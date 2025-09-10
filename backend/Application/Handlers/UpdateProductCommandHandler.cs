using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
    {
        private readonly MongoDbService _mongoDbService;
        public UpdateProductCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _mongoDbService.GetProductByIdAsync(request.Id);
            if (product == null) return false;
            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.Stock = request.Stock;
            product.CoverIndex = request.CoverIndex;

            // Manejo de imágenes
            if (request.Images != null && request.Images.Count > 0)
            {
                if (request.Images.Count > 5)
                    throw new System.Exception("Máximo 5 imágenes");
                var imageUrls = new List<string>();
                var imagePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "ProductImages");
                if (!System.IO.Directory.Exists(imagePath))
                    System.IO.Directory.CreateDirectory(imagePath);
                foreach (var file in request.Images)
                {
                    var ext = System.IO.Path.GetExtension(file.FileName);
                    var fileName = $"{System.Guid.NewGuid()}{ext}";
                    var filePath = System.IO.Path.Combine(imagePath, fileName);
                    using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
                    {
                        await file.CopyToAsync(stream, cancellationToken);
                    }
                    imageUrls.Add($"/product-images/{fileName}");
                }
                product.Images = imageUrls;
            }

            return await _mongoDbService.UpdateProductAsync(product);
        }
    }
}
