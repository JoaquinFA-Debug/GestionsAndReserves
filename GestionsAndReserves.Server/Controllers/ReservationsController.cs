using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionsAndReserves.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReservationsController : ControllerBase
{
    private readonly ILogger<ReservationsController> _logger;
    private readonly ReservationsDbContext _dbContext;
    public ReservationsController(ILogger<ReservationsController> logger, ReservationsDbContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    [HttpGet]
    [Route("GetServiceTypes")]
    public async Task<ActionResult<IEnumerable<Services>>> GetServiceTypes()
    {
        return await _dbContext.Services.ToArrayAsync();
    }

    [HttpGet]
    [Route("GetAllReservations")]
    public async Task<ActionResult<IEnumerable<Reservations>>> GetAllReserves()
    {
        return await _dbContext.Reservations.ToArrayAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Reservations>> GetReserveById(int id)
    {
        var reserveItem = await _dbContext.Reservations.FindAsync(id);

        if (reserveItem == null)
        {
            return NotFound();
        }

        return reserveItem;
    }

    [HttpPost]
    public async Task<ActionResult<Reservations>> PostReserve(Reservations reservation)
    {


        var allReservations = await _dbContext.Reservations.ToListAsync();

        var matchedReservesSameDate = allReservations.Where(r => r.ServiceID.Equals(reservation.ServiceID) && r.ReservationDate == reservation.ReservationDate);

        var matchedSameClientSameDay = allReservations.Where(r => r.ClientDni.Equals(reservation.ClientDni) && r.ReservationDate.Date == reservation.ReservationDate.Date);

        //Validacion en caso de que exista un match tanto entre un servicio para el mismo dia
        //como un cliente con 2 servicios el mismo dia.
        if (matchedReservesSameDate.Count() > 0)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { message = "Can't add two reserves at the same time and hour for this service" });
        }
        else if (matchedSameClientSameDay.Count() > 0)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { message = "Same client can't have two reservations for the same date" });
        }

        _dbContext.Reservations.Add(reservation);
        await _dbContext.SaveChangesAsync();


        return CreatedAtAction(nameof(GetReserveById), new { id = reservation.Id }, reservation);
    }

}