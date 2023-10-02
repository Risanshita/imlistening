using Core.ImListening.DbModels;
using Microsoft.EntityFrameworkCore;

namespace Common.ImListening.Repositories.InMemoryDb
{
    public class InMemoryDbContext : DbContext
    {
        public InMemoryDbContext(DbContextOptions<InMemoryDbContext> dbContextOptions) : base(dbContextOptions) { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.EnableSensitiveDataLogging();
            optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            base.OnConfiguring(optionsBuilder);
            // Other configuration options...
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed initial data
            //modelBuilder.Entity<User>().HasData(
            //    new User
            //    {
            //        Username = "RISHI",
            //        Password = "RISHI@122",
            //        Description = "This is a admin account to manage."
            //    }
            //);

        }
        public DbSet<User> Users { get; set; }
        public DbSet<History> Histories { get; set; }
        public DbSet<Webhook> Webhook { get; set; }
        public DbSet<RequestInfo> RequestInfo { get; set; }
    }
}
