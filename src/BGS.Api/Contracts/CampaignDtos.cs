namespace BGS.Api.Contracts;

public record MarketingCampaignDto(
    Guid Id,
    string Name,
    string Type,
    string PayloadJson,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    bool IsActive);

public record UpsertCampaignRequest(
    string Name,
    string Type,
    string PayloadJson,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    bool IsActive);

public record ValidatePromoRequest(string Code, decimal? Subtotal);

public record ValidatePromoResponse(
    string Code,
    string DiscountType,
    decimal Amount,
    decimal? MinSubtotal,
    decimal DiscountAmount,
    Guid CampaignId,
    string CampaignName);
