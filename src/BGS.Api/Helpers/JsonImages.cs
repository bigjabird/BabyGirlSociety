using System.Text.Json;

namespace BGS.Api.Helpers;

public static class JsonImages
{
    public static IReadOnlyList<string> ParseList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    public static string ToJson(IReadOnlyList<string> urls) =>
        JsonSerializer.Serialize(urls ?? Array.Empty<string>());
}
