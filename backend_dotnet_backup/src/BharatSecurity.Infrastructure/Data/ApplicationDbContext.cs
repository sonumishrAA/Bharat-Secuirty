using BharatSecurity.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BharatSecurity.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Service> Services { get; set; }
    public DbSet<CaseStudy> CaseStudies { get; set; }
    public DbSet<Inquiry> Inquiries { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Customize table names if needed
        builder.Entity<Service>().ToTable("Services");
        builder.Entity<CaseStudy>().ToTable("CaseStudies");
        builder.Entity<Inquiry>().ToTable("Inquiries");

        // Example unique index
        builder.Entity<Service>()
            .HasIndex(s => s.Slug)
            .IsUnique();
    }
}
