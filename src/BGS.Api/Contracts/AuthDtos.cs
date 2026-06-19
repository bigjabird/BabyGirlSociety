namespace BGS.Api.Contracts;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string Email, string Role);
