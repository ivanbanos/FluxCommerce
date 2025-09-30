using FluxCommerce.Models;
using FluxCommerce.Application.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace FluxCommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CustomerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Registra un nuevo cliente.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /api/customer/register
        ///     {
        ///         "name": "Juan Pérez",
        ///         "email": "juan@example.com",
        ///         "password": "tu_contraseña_segura"
        ///     }
        /// </remarks>
        /// <param name="dto">Datos del cliente a registrar</param>
        /// <returns>Id del cliente registrado o error si el email ya existe</returns>
        /// <response code="200">Registro exitoso</response>
        /// <response code="400">Email ya registrado o datos inválidos</response>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCustomerDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest();
            try
            {
                var id = await _mediator.Send(new RegisterCustomerCommand(dto));
                return Ok(new { id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        /// <summary>
        /// Inicia sesión de cliente y devuelve un JWT.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /api/customer/login
        ///     {
        ///         "email": "juan@example.com",
        ///         "password": "tu_contraseña_segura"
        ///     }
        /// </remarks>
        /// <param name="dto">Credenciales del cliente</param>
        /// <returns>JWT si las credenciales son correctas, error si no</returns>
        /// <response code="200">Login exitoso</response>
        /// <response code="400">Email o contraseña incorrectos</response>
        /// <summary>
        /// Inicia sesión de cliente y devuelve un JWT.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /api/customer/login
        ///     {
        ///         "email": "juan@example.com",
        ///         "password": "tu_contraseña_segura"
        ///     }
        /// </remarks>
        /// <param name="dto">Credenciales del cliente</param>
        /// <returns>JWT si las credenciales son correctas, error si no</returns>
        /// <response code="200">Login exitoso</response>
        /// <response code="400">Email o contraseña incorrectos</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCustomerDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest();
            try
            {
                var token = await _mediator.Send(new LoginCustomerCommand(dto));
                return Ok(new { token });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("by-email/{email}")]
        public async Task<IActionResult> GetCustomerByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return BadRequest();
            var result = await _mediator.Send(new FluxCommerce.Application.Queries.GetCustomerByEmailQuery(email));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("add-address")]
        public async Task<IActionResult> AddAddress([FromBody] AddAddressDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Address))
                return BadRequest();
            var ok = await _mediator.Send(new AddAddressCommand(dto));
            if (!ok) return BadRequest(new { error = "No se pudo agregar la dirección" });
            return Ok();
        }
    }
}
