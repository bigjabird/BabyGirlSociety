namespace BGS.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? PromoCode { get; set; }
    public string Currency { get; set; } = "usd";
    /// <summary>pending, paid, failed</summary>
    public string Status { get; set; } = "pending";
    public string? CustomerEmail { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<OrderLine> Lines { get; set; } = new List<OrderLine>();
}
