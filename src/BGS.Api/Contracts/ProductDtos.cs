namespace BGS.Api.Contracts;

public record ProductListItemDto(
    Guid Id,
    string Slug,
    string Name,
    decimal BasePrice,
    string Currency,
    IReadOnlyList<string> ImageUrls,
    bool IsActive);

public record ProductDetailDto(
    Guid Id,
    string Slug,
    string Name,
    string Description,
    decimal BasePrice,
    string Currency,
    IReadOnlyList<string> ImageUrls,
    bool IsActive,
    int TotalStock);

public record UpsertProductRequest(
    string Slug,
    string Name,
    string Description,
    decimal BasePrice,
    string Currency,
    IReadOnlyList<string> ImageUrls,
    bool IsActive);
