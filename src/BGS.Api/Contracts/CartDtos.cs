namespace BGS.Api.Contracts;

public record CheckoutLineRequest(Guid ProductId, int Quantity);

public record CreateCheckoutSessionRequest(IReadOnlyList<CheckoutLineRequest> Items);

public record CreateCheckoutSessionResponse(string SessionUrl, Guid OrderId);
