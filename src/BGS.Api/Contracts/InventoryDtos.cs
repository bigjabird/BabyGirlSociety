namespace BGS.Api.Contracts;

public record InventoryItemDto(Guid Id, Guid ProductId, string ProductName, string Sku, int QuantityOnHand, int? LowStockThreshold);

public record UpsertInventoryRequest(string Sku, int QuantityOnHand, int? LowStockThreshold);
