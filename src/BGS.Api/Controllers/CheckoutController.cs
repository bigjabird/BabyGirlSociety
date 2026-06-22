using BGS.Api.Contracts;
using BGS.Api.Services;
using BGS.Domain.Entities;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckoutController(BgsDbContext db, IConfiguration config, ILogger<CheckoutController> log) : ControllerBase
{
    [HttpPost("session")]
    public async Task<ActionResult<CreateCheckoutSessionResponse>> CreateSession(
        [FromBody] CreateCheckoutSessionRequest req,
        CancellationToken ct)
    {
        var secret = config["Stripe:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            log.LogWarning("Stripe:SecretKey is not configured");
            return StatusCode(503, new { error = "Payment provider not configured" });
        }

        if (req.Items == null || req.Items.Count == 0)
            return BadRequest("Cart is empty");

        var publicUrl = (config["PublicAppUrl"] ?? "http://localhost:4200").TrimEnd('/');

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var orderId = Guid.NewGuid();
            var now = DateTimeOffset.UtcNow;
            decimal subtotal = 0;
            var lines = new List<OrderLine>();
            var stripeLineItems = new List<SessionLineItemOptions>();

            foreach (var line in req.Items)
            {
                if (line.Quantity <= 0) continue;
                var product = await db.Products
                    .Include(p => p.InventoryItems)
                    .FirstOrDefaultAsync(p => p.Id == line.ProductId && p.IsActive, ct);
                if (product == null)
                    return BadRequest($"Unknown product {line.ProductId}");

                var stock = product.InventoryItems.Sum(i => i.QuantityOnHand);
                if (stock < line.Quantity)
                    return BadRequest($"Insufficient stock for {product.Name}");

                var unit = product.BasePrice;
                subtotal += unit * line.Quantity;

                lines.Add(new OrderLine
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderId,
                    ProductId = product.Id,
                    Quantity = line.Quantity,
                    UnitPrice = unit
                });

                stripeLineItems.Add(new SessionLineItemOptions
                {
                    Quantity = line.Quantity,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = product.Currency,
                        UnitAmount = (long)Math.Round(unit * 100m, MidpointRounding.AwayFromZero),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = product.Name
                        }
                    }
                });
            }

            if (lines.Count == 0)
                return BadRequest("No valid lines");

            var productIds = lines.Select(l => l.ProductId).Distinct().ToList();
            var currencies = await db.Products
                .Where(p => productIds.Contains(p.Id))
                .Select(p => p.Currency)
                .Distinct()
                .ToListAsync(ct);
            if (currencies.Count != 1)
                return BadRequest("All items must use the same currency");

            decimal discountAmount = 0;
            string? appliedPromo = null;

            if (!string.IsNullOrWhiteSpace(req.PromoCode))
            {
                var resolved = await CampaignPromoResolver.TryResolveAsync(db, req.PromoCode, ct);
                if (resolved == null)
                    return BadRequest(new { error = "Invalid or expired promo code" });

                var promo = resolved.Value.Promo;
                if (promo.MinSubtotal.HasValue && subtotal < promo.MinSubtotal.Value)
                {
                    return BadRequest(new
                    {
                        error = $"Minimum order of {promo.MinSubtotal.Value:C} required for this code"
                    });
                }

                discountAmount = CampaignPayloadParser.CalculateDiscount(promo, subtotal);
                if (discountAmount <= 0)
                    return BadRequest(new { error = "Promo code does not apply to this order" });

                appliedPromo = promo.Code;
                ApplyProportionalDiscount(stripeLineItems, subtotal, discountAmount);
            }

            var total = subtotal - discountAmount;

            var order = new Order
            {
                Id = orderId,
                TotalAmount = total,
                DiscountAmount = discountAmount,
                PromoCode = appliedPromo,
                Currency = currencies[0],
                Status = "pending",
                CreatedAt = now
            };
            foreach (var l in lines)
                order.Lines.Add(l);

            db.Orders.Add(order);
            await db.SaveChangesAsync(ct);

            Stripe.StripeConfiguration.ApiKey = secret;
            var sessionService = new SessionService();
            var options = new SessionCreateOptions
            {
                Mode = "payment",
                ClientReferenceId = orderId.ToString(),
                LineItems = stripeLineItems,
                SuccessUrl = $"{publicUrl}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{publicUrl}/checkout/cancel"
            };

            var session = await sessionService.CreateAsync(options, cancellationToken: ct);

            order.StripeSessionId = session.Id;
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            if (string.IsNullOrEmpty(session.Url))
                return StatusCode(500, "Stripe session URL missing");

            return Ok(new CreateCheckoutSessionResponse(session.Url, orderId));
        }
        catch (Stripe.StripeException ex)
        {
            await tx.RollbackAsync(ct);
            log.LogError(ex, "Stripe error");
            return BadRequest(new { error = ex.Message });
        }
    }

    private static void ApplyProportionalDiscount(
        List<SessionLineItemOptions> lineItems,
        decimal subtotal,
        decimal discountAmount)
    {
        if (subtotal <= 0 || discountAmount <= 0 || lineItems.Count == 0)
            return;

        var targetTotalCents = (long)Math.Round((subtotal - discountAmount) * 100m, MidpointRounding.AwayFromZero);
        var subtotalCents = (long)Math.Round(subtotal * 100m, MidpointRounding.AwayFromZero);
        var adjustedCents = new List<long>();
        long running = 0;

        for (var i = 0; i < lineItems.Count; i++)
        {
            var item = lineItems[i];
            var quantity = item.Quantity ?? 1;
            var lineSubtotalCents = item.PriceData!.UnitAmount!.Value * quantity;
            long lineTargetCents;

            if (i == lineItems.Count - 1)
            {
                lineTargetCents = targetTotalCents - running;
            }
            else
            {
                var share = subtotalCents == 0 ? 0m : (decimal)lineSubtotalCents / subtotalCents;
                lineTargetCents = (long)Math.Round(targetTotalCents * share, MidpointRounding.AwayFromZero);
                running += lineTargetCents;
            }

            var unitCents = quantity == 0 ? 0 : Math.Max(0L, lineTargetCents / quantity);
            item.PriceData.UnitAmount = unitCents;
            adjustedCents.Add(unitCents * quantity);
        }

        var sum = adjustedCents.Sum();
        if (sum != targetTotalCents && lineItems.Count > 0)
        {
            var last = lineItems[^1];
            var diff = targetTotalCents - sum;
            last.PriceData!.UnitAmount = Math.Max(0L, last.PriceData.UnitAmount!.Value + diff);
        }
    }
}
