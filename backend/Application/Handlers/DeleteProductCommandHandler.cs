using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public DeleteProductCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.SoftDeleteProductAsync(request.Id);
        }
    }
}
