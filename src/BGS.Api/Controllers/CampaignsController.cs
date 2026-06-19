using BGS.Api.Contracts;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController(BgsDbContext db) : ControllerBase
{
    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<MarketingCampaignDto>>> Active(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var list = await db.MarketingCampaigns.AsNoTracking()
            .Where(c => c.IsActive && c.StartsAt <= now && (c.EndsAt == null || c.EndsAt >= now))
            .OrderBy(c => c.Name)
            .Select(c => new MarketingCampaignDto(
                c.Id, c.Name, c.Type, c.PayloadJson, c.StartsAt, c.EndsAt, c.IsActive))
            .ToListAsync(ct);
        return Ok(list);
    }
}
