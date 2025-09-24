using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetOrderReceivedCommandHandler : IRequestHandler<SetOrderReceivedCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public SetOrderReceivedCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(SetOrderReceivedCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetOrderReceivedAsync(request.OrderId);
        }
    }
}
