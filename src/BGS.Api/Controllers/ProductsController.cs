using BGS.Api.Contracts;
using BGS.Api.Helpers;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(BgsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> List(CancellationToken ct)
    {
        var list = await db.Products.AsNoTracking()
            .Where(p => p.IsActive)
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

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDetailDto>> BySlug(string slug, CancellationToken ct)
    {
        var p = await db.Products.AsNoTracking()
            .Include(x => x.InventoryItems)
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive, ct);
        if (p == null) return NotFound();
        var stock = p.InventoryItems.Sum(i => i.QuantityOnHand);
        return Ok(new ProductDetailDto(
            p.Id,
            p.Slug,
            p.Name,
            p.Description,
            p.BasePrice,
            p.Currency,
            JsonImages.ParseList(p.ImagesJson).ToList(),
            p.IsActive,
            stock));
    }
}
