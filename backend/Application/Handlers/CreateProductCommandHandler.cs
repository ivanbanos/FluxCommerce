using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, string>
    {
        private readonly MongoDbService _mongoService;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "ProductImages");
        public CreateProductCommandHandler(MongoDbService mongoService)
        {
            _mongoService = mongoService;
            if (!Directory.Exists(_imagePath))
                Directory.CreateDirectory(_imagePath);
        }

        public async Task<string> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            if (request.Images == null || request.Images.Count == 0)
                throw new Exception("Debes subir al menos una imagen");
            if (request.Images.Count > 5)
                throw new Exception("Máximo 5 imágenes");

            var imageUrls = new List<string>();
            for (int i = 0; i < request.Images.Count; i++)
            {
                var file = request.Images[i];
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(_imagePath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }
                imageUrls.Add($"/product-images/{fileName}");
            }

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                Images = imageUrls,
                CoverIndex = request.CoverIndex,
                MerchantId = request.MerchantId
            };
            await _mongoService.InsertProductAsync(product);
            return product.Id!;
        }
    }
}
