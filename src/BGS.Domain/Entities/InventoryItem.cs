namespace BGS.Domain.Entities;

public class InventoryItem
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Sku { get; set; } = string.Empty;
    public int QuantityOnHand { get; set; }
    public int? LowStockThreshold { get; set; }
}
