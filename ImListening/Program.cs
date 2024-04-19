using Common.ImListening.DbContexts;
using Common.ImListening.Repositories.InMemoryDb;
using Common.ImListening.Repositories.MongoDb;
using Core.ImListening;
using Core.ImListening.Services;
using Core.ImListening.Services.Interfaces;
using ImListening.Controllers;
using ImListening.Handlers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;

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
            if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("IDENTITY_PROVIDER_AUTORITY")))
            {
                builder.Services
                .AddAuthentication(options =>
                {

                    options.DefaultAuthenticateScheme = "Bearer";
                    options.DefaultChallengeScheme = "Bearer";
                })
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = Environment.GetEnvironmentVariable("IDENTITY_PROVIDER_AUTORITY");
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false
                    };
                });
            }
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

            builder.Services.AddSingleton(typeof(MongoDbContext<>));
            builder.Services.Configure<MongoDbConfigs>(builder.Configuration.GetSection(MongoDbConfigs.Option));
            builder.Services.AddSingleton(new MongoDbConfigs()
            {
                ConnectionString = Environment.GetEnvironmentVariable("MONGO_DB_CONNECTION_STRING") ?? string.Empty,
                DatabaseName = Environment.GetEnvironmentVariable("DATABASE_NAME") ?? string.Empty,
                EnableCommandTracing = Convert.ToBoolean(Environment.GetEnvironmentVariable("MONGO_DB_ENABLE_COMMAND_TRACING"))
            });
            builder.Services.AddTransient(typeof(IMongoDbRepository<>), typeof(MongoDbRepository<>));

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

            app.UseAuthentication();
            app.UseAuthorization();

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
            StartJobs(app);
            app.Run();
        }
        private static void CreateDbIfNotExists(IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var userService = services.GetRequiredService<IUserService>();
                    var webhookService = services.GetRequiredService<IWebhookService>();
                    var historyService = services.GetRequiredService<IHistoryService>();
                    Initialize(userService);
                    webhookService.CreatIndexAsync().Wait();
                    historyService.CreatIndexAsync().Wait();
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<InMemoryDbContext>>();
                    logger.LogError(ex, "An error occurred creating the DB.");
                }
            }

        }

        public static void Initialize(IUserService userService)
        {
            userService.CreateUserAsync(new Core.ImListening.ApiModels.UserRequest { Username = "RISHI", Password = "KUMAR" }).Wait();
        }

        public static void StartJobs(IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;
            try
            {
                var listenerService = services.GetRequiredService<IListenerService>();
                var logger = services.GetRequiredService<ILogger<ListenerService>>();
                PollLoadTest(listenerService, logger);
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<ListenerService>>();
                logger.LogError(ex, "An error occurred registering job.");
            }
        }

        public static void PollLoadTest(IListenerService listenerService, ILogger logger)
        {
            Task.Run(async () =>
            {
                while (true)
                {
                    await Task.Delay(1000);
                    try
                    {
                        var users = ListenController.LoadTestingWebhooks.Select(a => a.Value.Webhook.UserId).Distinct().ToList();
                        foreach (var user in users)
                        {
                            if (!string.IsNullOrWhiteSpace(user))
                            {
                                var paths = ListenController.LoadTestingWebhooks.Where(a => a.Value.Webhook.UserId == user)
                                .Select(a => new { Path = a.Key, a.Value.HitCount, Time = DateTime.UtcNow }).ToList<object>();
                                if (paths.Any())
                                {
                                    await listenerService.SendLoadTestResultAsync(user, paths);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "An error occurred while polling load test.");
                    }
                }
            });
        }
    }
}
