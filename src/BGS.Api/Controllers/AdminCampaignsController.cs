using BGS.Api.Contracts;
using BGS.Domain.Entities;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/admin/campaigns")]
[Authorize(Roles = "admin,staff")]
public class AdminCampaignsController(BgsDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MarketingCampaignDto>>> List(CancellationToken ct)
    {
        var list = await db.MarketingCampaigns.AsNoTracking()
            .OrderByDescending(c => c.StartsAt)
            .Select(c => new MarketingCampaignDto(
                c.Id, c.Name, c.Type, c.PayloadJson, c.StartsAt, c.EndsAt, c.IsActive))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<MarketingCampaignDto>> Create([FromBody] UpsertCampaignRequest req, CancellationToken ct)
    {
        var c = new MarketingCampaign
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Type = req.Type,
            PayloadJson = string.IsNullOrWhiteSpace(req.PayloadJson) ? "{}" : req.PayloadJson,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            IsActive = req.IsActive
        };
        db.MarketingCampaigns.Add(c);
        await db.SaveChangesAsync(ct);
        return Created($"/api/admin/campaigns/{c.Id}", new MarketingCampaignDto(
            c.Id, c.Name, c.Type, c.PayloadJson, c.StartsAt, c.EndsAt, c.IsActive));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpsertCampaignRequest req, CancellationToken ct)
    {
        var c = await db.MarketingCampaigns.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (c == null) return NotFound();
        c.Name = req.Name;
        c.Type = req.Type;
        c.PayloadJson = string.IsNullOrWhiteSpace(req.PayloadJson) ? "{}" : req.PayloadJson;
        c.StartsAt = req.StartsAt;
        c.EndsAt = req.EndsAt;
        c.IsActive = req.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        var c = await db.MarketingCampaigns.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (c == null) return NotFound();
        db.MarketingCampaigns.Remove(c);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
