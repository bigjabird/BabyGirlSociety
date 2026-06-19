using BGS.Api.Contracts;
using BGS.Domain.Entities;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/admin/inventory")]
[Authorize(Roles = "admin,staff")]
public class AdminInventoryController(BgsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InventoryItemDto>>> List(CancellationToken ct)
    {
        var list = await db.InventoryItems.AsNoTracking()
            .Include(i => i.Product)
            .OrderBy(i => i.Sku)
            .Select(i => new InventoryItemDto(
                i.Id,
                i.ProductId,
                i.Product.Name,
                i.Sku,
                i.QuantityOnHand,
                i.LowStockThreshold))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("{productId:guid}")]
    public async Task<ActionResult<InventoryItemDto>> Create(Guid productId, [FromBody] UpsertInventoryRequest req, CancellationToken ct)
    {
        if (!await db.Products.AnyAsync(p => p.Id == productId, ct))
            return NotFound("Product not found");

        var item = new InventoryItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Sku = req.Sku.Trim(),
            QuantityOnHand = req.QuantityOnHand,
            LowStockThreshold = req.LowStockThreshold
        };
        db.InventoryItems.Add(item);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict("SKU must be unique");
        }

        var name = await db.Products.Where(p => p.Id == productId).Select(p => p.Name).FirstAsync(ct);
        return Created($"/api/admin/inventory", new InventoryItemDto(
            item.Id, productId, name, item.Sku, item.QuantityOnHand, item.LowStockThreshold));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpsertInventoryRequest req, CancellationToken ct)
    {
        var item = await db.InventoryItems.Include(i => i.Product).FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item == null) return NotFound();
        item.Sku = req.Sku.Trim();
        item.QuantityOnHand = req.QuantityOnHand;
        item.LowStockThreshold = req.LowStockThreshold;
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict("SKU must be unique");
        }

        return NoContent();
    }
}
