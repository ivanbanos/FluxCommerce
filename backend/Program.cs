using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluxCommerce.Api.Data;
using System.IO;
using MongoDB.Driver;
using MediatR;
using FluxCommerce.Api.Application.Handlers;
using FluxCommerce.Api.Common;
using Microsoft.SemanticKernel;
using FluxCommerce.Api.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// JWT config
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"] ?? "clave_super_secreta";
    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "fluxcommerce";
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey))
    };
});

// Add Semantic Kernel with Ollama (FREE!) - Suppress experimental warning
#pragma warning disable SKEXP0070
builder.Services.AddKernel()
    .AddOllamaChatCompletion(
        modelId: "llama3.2:3b",
        endpoint: new Uri("http://localhost:11434")
    );
#pragma warning restore SKEXP0070

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<MongoDbService>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<RegisterMerchantCommandHandler>());
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ApiExceptionFilter>();
});
builder.Services.AddSingleton<FluxCommerce.Api.Services.EmailService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddSignalR();


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Expose ProductImages as static files
// Ensure the directory exists to avoid DirectoryNotFoundException when running in new environments
var productImagesPath = Path.Combine(Directory.GetCurrentDirectory(), "ProductImages");
Directory.CreateDirectory(productImagesPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(productImagesPath),
    RequestPath = "/product-images"
});

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Map SignalR hubs
app.MapHub<FluxCommerce.Api.Hubs.ChatHub>("/hubs/chat");

app.Run();

