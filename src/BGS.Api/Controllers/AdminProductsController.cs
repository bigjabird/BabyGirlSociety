using BGS.Api.Contracts;
using BGS.Api.Helpers;
using BGS.Domain.Entities;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "admin,staff")]
public class AdminProductsController(BgsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> List(CancellationToken ct)
    {
        var list = await db.Products.AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new ProductListItemDto(
                p.Id,
                p.Slug,
                p.Name,
                p.BasePrice,
                p.Currency,
                JsonImages.ParseList(p.ImagesJson).ToList(),
                p.IsActive))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ProductListItemDto>> Create([FromBody] UpsertProductRequest req, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var p = new Product
        {
            Id = Guid.NewGuid(),
            Slug = req.Slug.Trim().ToLowerInvariant(),
            Name = req.Name,
            Description = req.Description,
            BasePrice = req.BasePrice,
            Currency = string.IsNullOrWhiteSpace(req.Currency) ? "usd" : req.Currency.Trim().ToLowerInvariant(),
            ImagesJson = JsonImages.ToJson(req.ImageUrls),
            IsActive = req.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Products.Add(p);
        await db.SaveChangesAsync(ct);
        return Created($"/api/products/{p.Slug}", new ProductListItemDto(
            p.Id, p.Slug, p.Name, p.BasePrice, p.Currency, JsonImages.ParseList(p.ImagesJson).ToList(), p.IsActive));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpsertProductRequest req, CancellationToken ct)
    {
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p == null) return NotFound();
        p.Slug = req.Slug.Trim().ToLowerInvariant();
        p.Name = req.Name;
        p.Description = req.Description;
        p.BasePrice = req.BasePrice;
        p.Currency = string.IsNullOrWhiteSpace(req.Currency) ? "usd" : req.Currency.Trim().ToLowerInvariant();
        p.ImagesJson = JsonImages.ToJson(req.ImageUrls);
        p.IsActive = req.IsActive;
        p.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        var p = await db.Products.Include(x => x.InventoryItems).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p == null) return NotFound();
        db.Products.Remove(p);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
