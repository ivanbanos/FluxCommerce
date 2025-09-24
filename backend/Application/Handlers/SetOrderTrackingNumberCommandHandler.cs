using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetOrderTrackingNumberCommandHandler : IRequestHandler<SetOrderTrackingNumberCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public SetOrderTrackingNumberCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(SetOrderTrackingNumberCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetOrderTrackingNumberAsync(request.OrderId, request.TrackingNumber);
        }
    }
}
