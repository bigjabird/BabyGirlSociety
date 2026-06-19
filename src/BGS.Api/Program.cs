using System.Text;
using BGS.Api.Services;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var conn = builder.Configuration.GetConnectionString("Default")
           ?? Environment.GetEnvironmentVariable("BGS_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(conn))
    throw new InvalidOperationException("Connection string 'Default' or BGS_CONNECTION_STRING is required.");

builder.Services.AddDbContext<BgsDbContext>(o => o.UseNpgsql(conn));

var jwtKey = builder.Configuration["Jwt:Key"]!;
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = signingKey
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddControllers();

builder.Services.AddOpenApi();

var publicUrl = (builder.Configuration["PublicAppUrl"] ?? "http://localhost:4200").TrimEnd('/');
builder.Services.AddCors(o =>
{
    o.AddPolicy("Web", p => p.WithOrigins(publicUrl)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("Web");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await BgsDbSeeder.SeedAsync(app.Services);

app.Run();
