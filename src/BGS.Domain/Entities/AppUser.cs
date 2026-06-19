namespace BGS.Domain.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    /// <summary>admin or staff</summary>
    public string Role { get; set; } = "staff";
}
