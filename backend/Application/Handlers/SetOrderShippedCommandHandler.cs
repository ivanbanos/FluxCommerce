using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetOrderShippedCommandHandler : IRequestHandler<SetOrderShippedCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public SetOrderShippedCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(SetOrderShippedCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetOrderShippedAsync(request.OrderId);
        }
    }
}
