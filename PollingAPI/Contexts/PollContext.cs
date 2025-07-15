using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Models;

namespace PollingAPI.Contexts;

public class PollContext : DbContext
{
    public PollContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<User> Users { get; set; }
    public DbSet<Option> Options { get; set; }
    public DbSet<Poll> Polls { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(u => u.Username);

        modelBuilder.Entity<User>()
                    .HasMany(u => u.RefreshTokens)
                    .WithOne(r => r.User)
                    .HasForeignKey(r => r.Username);
        modelBuilder.Entity<Poll>()
                    .HasOne(p => p.CreatedBy)
                    .WithMany(u => u.PollsCreated)
                    .HasConstraintName("fk_user_poll")
                    .HasForeignKey(p => p.CreatedByUsername);

        modelBuilder.Entity<Option>()
                    .HasOne(o => o.Poll)
                    .WithMany(p => p.Options)
                    .HasConstraintName("fk_option_poll")
                    .HasForeignKey(o => o.PollId)
                    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vote>()
                    .HasOne(v => v.Option)
                    .WithMany(o => o.Votes)
                    .HasConstraintName("fk_vote_option")
                    .HasForeignKey(a => a.OptionId)
                    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vote>()
                    .HasOne(v => v.Poll)
                    .WithMany()
                    .HasConstraintName("fk_vote_poll")
                    .HasForeignKey(v => v.PollId);
        modelBuilder.Entity<Vote>()
                    .HasOne(v => v.User)
                    .WithMany(u => u.Votes)
                    .HasConstraintName("fk_vote_user")
                    .HasForeignKey(v => v.UserId);
        modelBuilder.Entity<Vote>()
                    .HasIndex(v => new { v.PollId, v.UserId })
                    .IsUnique();
        
    }
}


