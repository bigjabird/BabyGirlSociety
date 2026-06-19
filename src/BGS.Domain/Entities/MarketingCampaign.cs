namespace BGS.Domain.Entities;

public class MarketingCampaign
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>banner, featured_collection, promo_code, etc.</summary>
    public string Type { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public bool IsActive { get; set; } = true;
}
