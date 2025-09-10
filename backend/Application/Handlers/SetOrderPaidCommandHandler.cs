using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class SetOrderPaidCommandHandler : IRequestHandler<SetOrderPaidCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public SetOrderPaidCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(SetOrderPaidCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SetOrderPaidAsync(request.OrderId);
        }
    }
}
