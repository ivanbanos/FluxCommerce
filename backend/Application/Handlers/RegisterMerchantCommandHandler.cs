using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using FluxCommerce.Api.Common;
using MediatR;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class RegisterMerchantCommandHandler : IRequestHandler<RegisterMerchantCommand, RegisterMerchantResult>
    {
        private readonly MongoDbService _mongoService;
        public RegisterMerchantCommandHandler(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        public async Task<RegisterMerchantResult> Handle(RegisterMerchantCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (await _mongoService.MerchantEmailExistsAsync(request.Email))
                {
                    throw new ApiException("El correo ya está registrado.", (int)HttpStatusCode.BadRequest);
                }

                var merchant = new Merchant
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    State = "pending activation"
                };
                await _mongoService.InsertMerchantAsync(merchant);

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
