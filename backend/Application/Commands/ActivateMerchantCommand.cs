using FluxCommerce.Api.Data;
using FluxCommerce.Api.Common;
using System.Net;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Commands
{
    public class ActivateMerchantCommand : IRequest<string>
    {
        public string Token { get; set; }
        public ActivateMerchantCommand(string token)
        {
            Token = token;
        }
    }

    public class ActivateMerchantCommandHandler : IRequestHandler<ActivateMerchantCommand, string>
    {
        private readonly MongoDbService _mongoDbService;
        public ActivateMerchantCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }
        public async Task<string> Handle(ActivateMerchantCommand request, CancellationToken cancellationToken)
        {
            var merchant = await _mongoDbService.GetMerchantByActivationTokenAsync(request.Token);
            if (merchant == null)
                throw new ApiException("Token inválido o expirado.", HttpStatusCode.BadRequest);
            merchant.State = "validatedemail";
            merchant.ActivationToken = null;
            await _mongoDbService.UpdateMerchantAsync(merchant);
            return "Correo validado correctamente. Espera la aprobación del administrador.";
        }
    }
}
