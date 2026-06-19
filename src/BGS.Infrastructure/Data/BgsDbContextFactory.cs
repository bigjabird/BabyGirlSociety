using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BGS.Infrastructure.Data;

public class BgsDbContextFactory : IDesignTimeDbContextFactory<BgsDbContext>
{
    public BgsDbContext CreateDbContext(string[] args)
    {
        var conn =
            Environment.GetEnvironmentVariable("BGS_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=bgs;Username=bgs;Password=bgs_dev_password";

        var options = new DbContextOptionsBuilder<BgsDbContext>()
            .UseNpgsql(conn)
            .Options;

        return new BgsDbContext(options);
    }
}
