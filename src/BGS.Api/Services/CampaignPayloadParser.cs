using System.Text.Json;

namespace BGS.Api.Services;

public static class CampaignPayloadParser
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static bool TryParsePromo(string payloadJson, out PromoCodePayload payload)
    {
        payload = default!;
        try
        {
            var parsed = JsonSerializer.Deserialize<PromoCodePayload>(payloadJson, JsonOptions);
            if (parsed == null || string.IsNullOrWhiteSpace(parsed.Code))
                return false;
            if (parsed.DiscountType is not ("percent" or "fixed"))
                return false;
            if (parsed.Amount <= 0)
                return false;
            if (parsed.DiscountType == "percent" && parsed.Amount > 100)
                return false;
            payload = parsed with { Code = parsed.Code.Trim().ToUpperInvariant() };
            return true;
        }
        catch
        {
            return false;
        }
    }

    public static decimal CalculateDiscount(PromoCodePayload promo, decimal subtotal)
    {
        if (subtotal <= 0)
            return 0;
        if (promo.MinSubtotal.HasValue && subtotal < promo.MinSubtotal.Value)
            return 0;

        return promo.DiscountType switch
        {
            "percent" => Math.Round(subtotal * promo.Amount / 100m, 2, MidpointRounding.AwayFromZero),
            "fixed" => Math.Min(promo.Amount, subtotal),
            _ => 0
        };
    }
}

public record PromoCodePayload(
    string Code,
    string DiscountType,
    decimal Amount,
    decimal? MinSubtotal);
