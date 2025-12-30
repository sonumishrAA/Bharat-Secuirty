using BharatSecurity.Domain.Common;

namespace BharatSecurity.Domain.Entities;

public class Inquiry : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string Message { get; set; } = string.Empty;
    public InferenceStatus Status { get; set; } = InferenceStatus.New;
    public string? AdminNotes { get; set; }
}

public enum InferenceStatus
{
    New,
    InProgress,
    Contacted,
    Closed
}
