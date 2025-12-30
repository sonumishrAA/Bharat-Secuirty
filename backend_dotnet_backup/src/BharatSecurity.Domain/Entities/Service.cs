using BharatSecurity.Domain.Common;

namespace BharatSecurity.Domain.Entities;

public class Service : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty; // Emoji or SVG path
    public string Slug { get; set; } = string.Empty;
    
    // We can store Features as a JSON string or related table. 
    // Ideally related table, but for simplicity/JSON column:
    public string FeaturesJson { get; set; } = "[]"; 
    
    public bool IsActive { get; set; } = true;
}
