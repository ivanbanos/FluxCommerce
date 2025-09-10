
using System.Collections.Generic;
using FluxCommerce.Api.Models;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Data
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Merchant> _merchants;
        private readonly IMongoCollection<Product> _products;
        private readonly IMongoCollection<Order> _orders;
        public MongoDbService(MongoDbContext context)
        {
            _merchants = context.Database.GetCollection<Merchant>("Merchants");
            _products = context.Database.GetCollection<Product>("Products");
            _orders = context.Database.GetCollection<Order>("Orders");
        }

        public async Task InsertOrderAsync(Order order)
        {
            await _orders.InsertOneAsync(order);
        }

        public async Task InsertProductAsync(Product product)
        {
            await _products.InsertOneAsync(product);
        }

        public async Task<List<Merchant>> GetAllMerchantsAsync()
        {
            return await _merchants.Find(_ => true).ToListAsync();
        }

        public async Task<Merchant?> GetMerchantByEmailAsync(string email)
        {
            return await _merchants.Find(m => m.Email == email).FirstOrDefaultAsync();
        }

        public async Task<bool> MerchantEmailExistsAsync(string email)
        {
            return await _merchants.Find(m => m.Email == email).AnyAsync();
        }

        public async Task InsertMerchantAsync(Merchant merchant)
        {
            await _merchants.InsertOneAsync(merchant);
        }

        public async Task<Merchant?> GetMerchantByActivationTokenAsync(string token)
        {
            return await _merchants.Find(m => m.ActivationToken == token).FirstOrDefaultAsync();
        }

        public async Task UpdateMerchantAsync(Merchant merchant)
        {
            await _merchants.ReplaceOneAsync(m => m.Id == merchant.Id, merchant);
        }

        public async Task<Merchant?> GetMerchantByIdAsync(string id)
        {
            return await _merchants.Find(m => m.Id == id).FirstOrDefaultAsync();
        }


        public async Task<List<Product>> GetProductsByMerchantAsync(string merchantId)
        {
            return await _products.Find(p => p.MerchantId == merchantId && !p.IsDeleted).ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(string id)
        {
            return await _products.Find(p => p.Id == id && !p.IsDeleted).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateProductAsync(Product product)
        {
            var result = await _products.ReplaceOneAsync(p => p.Id == product.Id, product);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SoftDeleteProductAsync(string id)
        {
            var update = Builders<Product>.Update.Set(p => p.IsDeleted, true);
            var result = await _products.UpdateOneAsync(p => p.Id == id, update);
            return result.ModifiedCount > 0;
        }


        public async Task<List<Order>> GetOrdersByMerchantAsync(string merchantId)
        {
            return await _orders.Find(o => o.MerchantId == merchantId)
                .SortByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Order> CreateOrderAsync(object request)
        {
            // Map request to Order
            var req = request as dynamic;
            var order = new Order
            {
                BuyerName = req.BuyerName,
                BuyerEmail = req.BuyerEmail,
                MerchantId = req.MerchantId,
                Total = req.Total,
                Products = new List<OrderProduct>(),
                CreatedAt = System.DateTime.UtcNow,
                Status = "pendiente",
            };
            foreach (var p in req.Products)
            {
                order.Products.Add(new OrderProduct
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Price = p.Price,
                    Qty = p.Qty
                });
            }

            await _orders.InsertOneAsync(order);
            return order;
        }

        public async Task<bool> SetOrderPaidAsync(string orderId)
        {
            var update = Builders<Order>.Update.Set(o => o.Status, "pagado");
            var result = await _orders.UpdateOneAsync(o => o.Id == orderId, update);
            return result.ModifiedCount > 0;
        }
        public async Task<bool> SetOrderShippedAsync(string orderId)
        {
            var update = Builders<Order>.Update.Set(o => o.Status, "enviado");
            var result = await _orders.UpdateOneAsync(o => o.Id == orderId, update);
            return result.ModifiedCount > 0;
        }

    }
}
