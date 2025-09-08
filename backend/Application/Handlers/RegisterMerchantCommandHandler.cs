using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using FluxCommerce.Api.Common;
using MediatR;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FluxCommerce.Api.Services;
using System.Security.Cryptography;

namespace FluxCommerce.Api.Application.Handlers
{
    public class RegisterMerchantCommandHandler : IRequestHandler<RegisterMerchantCommand, RegisterMerchantResult>
    {
        private readonly MongoDbService _mongoService;
        private readonly EmailService _emailService;
        public RegisterMerchantCommandHandler(MongoDbService mongoService, EmailService emailService)
        {
            _mongoService = mongoService;
            _emailService = emailService;
        }

        public async Task<RegisterMerchantResult> Handle(RegisterMerchantCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Validación de correo
                if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
                    throw new ApiException("Correo electrónico inválido.", (int)HttpStatusCode.BadRequest);

                // Validación de teléfono
                if (string.IsNullOrWhiteSpace(request.Phone) || request.Phone.Length < 7)
                    throw new ApiException("Teléfono inválido.", (int)HttpStatusCode.BadRequest);

                if (await _mongoService.MerchantEmailExistsAsync(request.Email))
                {
                    throw new ApiException("El correo ya está registrado.", (int)HttpStatusCode.BadRequest);
                }

                // Generar token de activación
                var tokenBytes = RandomNumberGenerator.GetBytes(32);
                var activationToken = Convert.ToBase64String(tokenBytes).Replace("/", "_").Replace("+", "-");

                var merchant = new Merchant
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Phone = request.Phone,
                    State = "pending activation",
                    ActivationToken = activationToken
                };
                await _mongoService.InsertMerchantAsync(merchant);

                // Obtener dominio de activación desde configuración
                var activationDomain = _emailService.GetConfig("ActivationDomain") ?? "https://tudominio.com";
                var activationUrl = $"{activationDomain.TrimEnd('/')}/activate?token={activationToken}";
                var body = $"<h3>Bienvenido a Flux Commerce</h3><p>Activa tu cuenta haciendo clic <a href='{activationUrl}'>aquí</a>.</p>";
                await _emailService.SendAsync(merchant.Email!, "Activa tu cuenta Flux Commerce", body);

                return new RegisterMerchantResult { Success = true, Name = merchant.Name, Email = merchant.Email };
            }
            catch (ApiException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new ApiException($"Internal server error: {ex.Message}", (int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
