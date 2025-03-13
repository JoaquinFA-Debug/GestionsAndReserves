using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var conString = builder.Configuration.GetConnectionString("ReservationsDatabase") ??
     throw new InvalidOperationException("Connection string 'ReservationsDatabase'" +
    " not found.");
// Add services to the container.
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddDbContext<ReservationsDbContext>(options => options.UseSqlite(conString));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

//Configure db cors
app.UseCors();

using (var scope = app.Services.CreateScope()) { 
    var db = scope.ServiceProvider.GetRequiredService<ReservationsDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

public class ReservationsDbContext : DbContext
{
    public DbSet<Services> Services => Set<Services>();
    public DbSet<Reservations> Reservations => Set<Reservations>();

    public ReservationsDbContext(DbContextOptions<ReservationsDbContext> options) : base(options) { }
}
public class Services
{
    public int Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;

}

public class Reservations
{
    public int Id { get; set; }
    public int ServiceID { get; set; }
    public DateTime ReservationDate { get; set; } = DateTime.MinValue;
    public string ClientDni { get; set; } = String.Empty;
    public string ClientName { get; set; } = String.Empty;
}