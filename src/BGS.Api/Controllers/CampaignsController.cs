using BGS.Api.Contracts;
using BGS.Api.Services;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController(BgsDbContext db) : ControllerBase
{
    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<MarketingCampaignDto>>> Active(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var list = await db.MarketingCampaigns.AsNoTracking()
            .Where(c => c.IsActive && c.StartsAt <= now && (c.EndsAt == null || c.EndsAt >= now))
            .OrderBy(c => c.Name)
            .Select(c => new MarketingCampaignDto(
                c.Id, c.Name, c.Type, c.PayloadJson, c.StartsAt, c.EndsAt, c.IsActive))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("validate-promo")]
    public async Task<ActionResult<ValidatePromoResponse>> ValidatePromo(
        [FromBody] ValidatePromoRequest req,
        CancellationToken ct)
    {
        var resolved = await CampaignPromoResolver.TryResolveAsync(db, req.Code, ct);
        if (resolved == null)
            return NotFound(new { error = "Invalid or expired promo code" });

        var (campaign, promo) = resolved.Value;
        var subtotal = req.Subtotal ?? 0;
        var discount = CampaignPayloadParser.CalculateDiscount(promo, subtotal);

        if (promo.MinSubtotal.HasValue && subtotal > 0 && subtotal < promo.MinSubtotal.Value)
        {
            return BadRequest(new
            {
                error = $"Minimum order of {promo.MinSubtotal.Value:C} required for this code"
            });
        }

        return Ok(new ValidatePromoResponse(
            promo.Code,
            promo.DiscountType,
            promo.Amount,
            promo.MinSubtotal,
            discount,
            campaign.Id,
            campaign.Name));
    }
}
