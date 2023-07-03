
using Common.ImListening.Repositories.InMemoryDb;
using Core.ImListening.Services;
using ImListening.Handlers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using NSwag.Generation.Processors.Security;
using NSwag;
using Core.ImListening.DbModels;
using Microsoft.Data.SqlClient;
using Core.ImListening;

namespace ImListening
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllersWithViews();

            // logging
            builder.Services
              .AddLogging(builder =>
              {
                  builder.AddConsole();
              });


            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "BasicAuth";
                options.DefaultChallengeScheme = "BasicAuth";
            })
            .AddScheme<AuthenticationSchemeOptions, BasicAuthHandler>("BasicAuth", null);

            builder.Services.AddSignalR(e =>
            {
                e.MaximumReceiveMessageSize = 102400000;
            });

            // in memory cache
            //builder.Services.AddMemoryCache();

            // In memory db provider
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ClientPermission", policy =>
                {
                    policy.AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithOrigins("https://localhost:44428")
                        .AllowCredentials();
                });
            });

            builder.Services.AddDbContext<InMemoryDbContext>(options =>
            {
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
                builder.DataSource = "SBSMS-RISHI-LT2";
                builder.InitialCatalog = "ImListening";
                //builder.UserID = "your_username";
                //builder.Password = "your_password";
                builder.TrustServerCertificate = true; // Add this line to disable SSL validation
                builder.MultipleActiveResultSets = true;

                string connectionString = builder.ConnectionString;
                connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=ImListening;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";
                options.UseSqlServer(connectionString);
                //options.UseInMemoryDatabase("ImListeningDb");
            });
            var provider = builder.Services.BuildServiceProvider();

            builder.Services.AddTransient<DbContext>((a) => a.GetService<InMemoryDbContext>());

            // Business Services
            builder.Services.AddServices();
            // Add Swagger
            builder.Services.AddSwaggerDocument(config =>
            {
                // Other Swagger configuration options...

                // Add Basic Authentication to Swagger
                config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("Basic"));

                // Set the Swagger document basic authentication scheme
                config.AddSecurity("Basic", Enumerable.Empty<string>(), new OpenApiSecurityScheme
                {
                    Type = OpenApiSecuritySchemeType.Http,
                    Scheme = "basic",
                    Description = "Basic Authentication"
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseCors("ClientPermission");

            // Register the Swagger generator and the Swagger UI middlewares
            app.UseOpenApi();
            app.UseSwaggerUi3();

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthorization();
            app.UseAuthentication();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller}/{action=Index}/{id?}");

            app.MapFallbackToFile("index.html");

            //Task.Run(async () =>
            //{
            //    await Task.Delay(5000);
            //    var userService = provider.GetService<IUserService>();
            //    await userService.CreateUserAsync(new Core.ImListening.ApiModels.UserRequest { Description = "This is a admin account to manage the app.", Password = "Rishi@112", Username = "RISHI" }, "Admin");
            //});
            app.MapHub<ChatHub>("/chatHub");

            CreateDbIfNotExists(app);
            app.Run();
        }
        private static void CreateDbIfNotExists(IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<InMemoryDbContext>();
                    Initialize(context);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<InMemoryDbContext>>();
                    logger.LogError(ex, "An error occurred creating the DB.");
                }
            }

        }

        public static void Initialize(InMemoryDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any students.
            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }
            var adminUser = new User
            {
                Description = "THIS IS ADMIN USER",
                Id = "RISHI",
                Password = "    ",
                Role = "Admin"
            };

            context.Users.Add(adminUser);
            context.Webhook.Add(new Webhook
            {
                Id = "rishi",
                StatusCode = 200,
                UserId = adminUser.Id
            });

            context.SaveChanges();
        }
    }
}