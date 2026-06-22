using BGS.Api.Services;
using BGS.Domain.Entities;
using BGS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Services;

public static class CampaignPromoResolver
{
    public static async Task<(MarketingCampaign Campaign, PromoCodePayload Promo)?> TryResolveAsync(
        BgsDbContext db,
        string? code,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var normalized = code.Trim().ToUpperInvariant();
        var now = DateTimeOffset.UtcNow;

        var campaigns = await db.MarketingCampaigns.AsNoTracking()
            .Where(c => c.IsActive && c.Type == "promo_code"
                && c.StartsAt <= now && (c.EndsAt == null || c.EndsAt >= now))
            .ToListAsync(ct);

        foreach (var campaign in campaigns)
        {
            if (!CampaignPayloadParser.TryParsePromo(campaign.PayloadJson, out var promo))
                continue;
            if (!string.Equals(promo.Code, normalized, StringComparison.Ordinal))
                continue;
            return (campaign, promo);
        }

        return null;
    }
}
