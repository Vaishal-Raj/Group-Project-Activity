using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PollingAPI.Contexts;
using PollingAPI.Hubs;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Repositories;
using PollingAPI.Services;
using Serilog;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = "Clinic API", Version = "v1" });
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});
builder.Services.AddControllers()
                .AddJsonOptions(opts =>
                {
                    opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
                    opts.JsonSerializerOptions.WriteIndented = true;
                });
#region contexts
builder.Services.AddDbContext<PollContext>(options=>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
#endregion

#region Repositories
builder.Services.AddTransient<IRepository<string, User>, UserRepository>();
builder.Services.AddTransient<IRepository<string, RefreshToken>, RefreshTokenRepository>();
builder.Services.AddTransient<IRepository<int, Poll>, PollRepository>();
builder.Services.AddTransient<IPollRepository, PollRepository>();
builder.Services.AddTransient<IRepository<int, Vote>, VoteRepository>();
builder.Services.AddTransient<IVoteRepository, VoteRepository>();
builder.Services.AddTransient<IRepository<int,Option>,OptionRepository>();

// builder.Services.AddTransient<>();
#endregion
#region Services
builder.Services.AddTransient<PollingAPI.Interfaces.IAuthenticationService, PollingAPI.Services.AuthenticationService>();
builder.Services.AddTransient<IEncryptionService, EncryptionService>();
builder.Services.AddTransient<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddTransient<ITokenService, TokenService>();
builder.Services.AddTransient<IPollService, PollService>();
builder.Services.AddTransient<IVoteService, VoteService>();
builder.Services.AddTransient<IUserService, UserService>();

#endregion

#region AuthenticationFilter
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//                 .AddJwtBearer(options =>
//                 {
//                     options.TokenValidationParameters = new TokenValidationParameters
//                     {
//                         ValidateAudience = false,
//                         ValidateIssuer = false,
//                         ValidateLifetime = true,
//                         ValidateIssuerSigningKey = true,
//                         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Keys:JwtTokenKey"]))
//                     };
//                 });


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

    // ✅ Required for external login flow
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = false,
        ValidateIssuer = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Keys:JwtTokenKey"])),
        RoleClaimType=ClaimTypes.Role
    };
})
// ✅ Add Cookie auth to support sign-in scheme for OAuth
.AddCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.Lax; // ✅ allows Google to redirect back
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
})

// ✅ Google OAuth setup
.AddGoogle("Google", options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    options.CallbackPath = "/signin-google";

    options.Scope.Add("profile");
    options.Scope.Add("email");

    options.SaveTokens = true;
    options.ClaimActions.MapJsonKey("urn:google:picture", "picture", "url");
    options.Events.OnCreatingTicket = context =>
    {
        var email = context.Identity?.FindFirst(ClaimTypes.Email)?.Value;
        var name = context.Identity?.FindFirst(ClaimTypes.Name)?.Value;

        return Task.CompletedTask;
    };
});


#endregion

#region Signal R Hub
builder.Services.AddSignalR();
#endregion

#region Cors
builder.Services.AddCors(options=>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5501","http://localhost:51067","http://localhost:4200","http://localhost:8080")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
#endregion

#region SERILOG
Log.Logger = new LoggerConfiguration()
                    .WriteTo.Console()
                    .WriteTo.File("/Users/vaishal/Desktop/Presidio/Genspark-training/Day 25 (Individual project)", rollingInterval: RollingInterval.Day)
                    .Enrich.FromLogContext()
                    .MinimumLevel.Debug()
                    .CreateLogger();
builder.Host.UseSerilog();
#endregion


#region Rate Limiter


builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("RequestLimit", context =>
    {
        var username = context.User.Identity?.Name ?? context.Request.Headers["X-UserId"].FirstOrDefault() ?? "anonymous";

        return RateLimitPartition.GetTokenBucketLimiter(username, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 1000,         
            TokensPerPeriod = 100,         
            ReplenishmentPeriod = TimeSpan.FromHours(1),
            AutoReplenishment = true,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

#endregion
var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

app.UseHttpsRedirection();

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors("AllowAll");

app.MapControllers().RequireRateLimiting("RequestLimit");

app.MapHub<PollingHub>("/pollHub");
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
