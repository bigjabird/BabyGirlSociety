using BGS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BGS.Infrastructure.Data;

public static class BgsDbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<BgsDbContext>();
        await db.Database.MigrateAsync(ct);

        if (await db.Users.AnyAsync(ct))
            return;

        var now = DateTimeOffset.UtcNow;
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        db.Users.Add(new AppUser
        {
            Id = adminId,
            Email = "admin@babygirlsociety.local",
            // password: Admin123!
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "admin"
        });

        var p1 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
        var p2 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
        var p3 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3");

        db.Products.AddRange(
            new Product
            {
                Id = p1,
                Slug = "velvet-mini-dress",
                Name = "Velvet Mini Dress",
                Description = "Soft stretch velvet with sweetheart neckline.",
                BasePrice = 89.00m,
                Currency = "usd",
                ImagesJson = """["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"]""",
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Product
            {
                Id = p2,
                Slug = "satin-cami-set",
                Name = "Satin Cami Set",
                Description = "Bias-cut satin with lace trim.",
                BasePrice = 64.50m,
                Currency = "usd",
                ImagesJson = """["https://images.unsplash.com/photo-1618932260643-eee4a2f652a7?w=800"]""",
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Product
            {
                Id = p3,
                Slug = "mesh-longsleeve",
                Name = "Sheer Mesh Long Sleeve",
                Description = "Layer-friendly sheer mesh top.",
                BasePrice = 42.00m,
                Currency = "usd",
                ImagesJson = """["https://images.unsplash.com/photo-1550614000-4b9519e09593?w=800"]""",
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });

        db.InventoryItems.AddRange(
            new InventoryItem { Id = Guid.NewGuid(), ProductId = p1, Sku = "BGS-VELVET-S", QuantityOnHand = 25, LowStockThreshold = 5 },
            new InventoryItem { Id = Guid.NewGuid(), ProductId = p2, Sku = "BGS-SATIN-M", QuantityOnHand = 40, LowStockThreshold = 8 },
            new InventoryItem { Id = Guid.NewGuid(), ProductId = p3, Sku = "BGS-MESH-OS", QuantityOnHand = 60, LowStockThreshold = 10 });

        db.MarketingCampaigns.Add(new MarketingCampaign
        {
            Id = Guid.NewGuid(),
            Name = "Spring Drop",
            Type = "banner",
            PayloadJson = """{"headline":"New arrivals — Babygirl Society","subcopy":"Free shipping over $75","cta":"/shop"}""",
            StartsAt = now.AddDays(-7),
            EndsAt = now.AddDays(30),
            IsActive = true
        });

        await db.SaveChangesAsync(ct);
    }
}
