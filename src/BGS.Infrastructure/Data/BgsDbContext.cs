using BGS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BGS.Infrastructure.Data;

public class BgsDbContext : DbContext
{
    public BgsDbContext(DbContextOptions<BgsDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<MarketingCampaign> MarketingCampaigns => Set<MarketingCampaign>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.BasePrice).HasPrecision(18, 2);
            e.Property(p => p.Slug).HasMaxLength(200);
            e.Property(p => p.Name).HasMaxLength(300);
            e.Property(p => p.Currency).HasMaxLength(10);
        });

        modelBuilder.Entity<InventoryItem>(e =>
        {
            e.HasIndex(i => i.Sku).IsUnique();
            e.Property(i => i.Sku).HasMaxLength(80);
            e.HasOne(i => i.Product).WithMany(p => p.InventoryItems).HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MarketingCampaign>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(200);
            e.Property(c => c.Type).HasMaxLength(80);
        });

        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(320);
            e.Property(u => u.Role).HasMaxLength(40);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.StripeSessionId);
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.Property(o => o.DiscountAmount).HasPrecision(18, 2);
            e.Property(o => o.PromoCode).HasMaxLength(80);
            e.Property(o => o.Status).HasMaxLength(40);
            e.Property(o => o.Currency).HasMaxLength(10);
        });

        modelBuilder.Entity<OrderLine>(e =>
        {
            e.Property(l => l.UnitPrice).HasPrecision(18, 2);
            e.HasOne(l => l.Order).WithMany(o => o.Lines).HasForeignKey(l => l.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Product).WithMany().HasForeignKey(l => l.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
