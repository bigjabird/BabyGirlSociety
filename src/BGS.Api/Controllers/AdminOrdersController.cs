using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "admin,staff")]
public class AdminOrdersController(BgsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> List(CancellationToken ct)
    {
        var list = await db.Orders.AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.Status,
                o.TotalAmount,
                o.Currency,
                o.CustomerEmail,
                o.StripeSessionId,
                o.CreatedAt,
                o.Lines.Count))
            .ToListAsync(ct);
        return Ok(list);
    }

    public record OrderSummaryDto(
        Guid Id,
        string Status,
        decimal TotalAmount,
        string Currency,
        string? CustomerEmail,
        string? StripeSessionId,
        DateTimeOffset CreatedAt,
        int LineCount);
}
