using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/webhooks/stripe")]
public class StripeWebhookController(BgsDbContext db, IConfiguration config, ILogger<StripeWebhookController> log)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        var webhookSecret = config["Stripe:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
            log.LogWarning("Stripe:WebhookSecret not configured");
            return StatusCode(503);
        }

        string json;
        using (var reader = new StreamReader(HttpContext.Request.Body))
            json = await reader.ReadToEndAsync(ct);

        if (!Request.Headers.TryGetValue("Stripe-Signature", out var sigHeader))
            return BadRequest("Missing signature");

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, sigHeader, webhookSecret);
        }
        catch (StripeException ex)
        {
            log.LogWarning(ex, "Invalid Stripe signature");
            return BadRequest();
        }

        if (stripeEvent.Type == "checkout.session.completed")
        {
            if (stripeEvent.Data.Object is not Session session)
                return Ok();

            if (string.IsNullOrEmpty(session.ClientReferenceId) || !Guid.TryParse(session.ClientReferenceId, out var orderId))
            {
                log.LogWarning("Checkout session missing client_reference_id");
                return Ok();
            }

            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var order = await db.Orders
                .Include(o => o.Lines)
                .FirstOrDefaultAsync(o => o.Id == orderId, ct);

            if (order == null)
            {
                await tx.CommitAsync(ct);
                return Ok();
            }

            if (order.Status == "paid")
            {
                await tx.CommitAsync(ct);
                return Ok();
            }

            order.Status = "paid";
            order.StripeSessionId = session.Id;
            order.StripePaymentIntentId = session.PaymentIntentId;
            order.CustomerEmail = session.CustomerDetails?.Email ?? session.CustomerEmail;

            foreach (var line in order.Lines)
            {
                var rows = await db.InventoryItems
                    .Where(i => i.ProductId == line.ProductId)
                    .OrderByDescending(i => i.QuantityOnHand)
                    .ToListAsync(ct);

                if (rows.Count == 0)
                {
                    log.LogError("No inventory row for product {ProductId}", line.ProductId);
                    await tx.RollbackAsync(ct);
                    return Ok();
                }

                var remaining = line.Quantity;
                foreach (var inv in rows)
                {
                    if (remaining <= 0) break;
                    var take = Math.Min(inv.QuantityOnHand, remaining);
                    inv.QuantityOnHand -= take;
                    remaining -= take;
                }

                if (remaining > 0)
                {
                    log.LogError("Oversell detected for order {OrderId}", order.Id);
                    await tx.RollbackAsync(ct);
                    return Ok();
                }
            }

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }

        return Ok();
    }
}
