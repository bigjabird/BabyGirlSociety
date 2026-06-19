using BGS.Api.Contracts;
using BGS.Api.Services;
using BGS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(BgsDbContext db, JwtTokenService jwt) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == req.Email, ct);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized();

        var token = jwt.CreateToken(user.Id, user.Email, user.Role);
        return Ok(new LoginResponse(token, user.Email, user.Role));
    }
}
