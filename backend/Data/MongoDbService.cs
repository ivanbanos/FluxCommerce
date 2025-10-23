
using System.Collections.Generic;
using MongoDB.Driver;
using System.Threading.Tasks;
using FluxCommerce.Api.Models;

namespace FluxCommerce.Api.Data
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Merchant> _merchants;
        private readonly IMongoCollection<Product> _products;
        private readonly IMongoCollection<Order> _orders;
        private readonly IMongoCollection<Store> _stores;

        public MongoDbService(MongoDbContext context)
        {
            _merchants = context.Database.GetCollection<Merchant>("Merchants");
            _products = context.Database.GetCollection<Product>("Products");
            _orders = context.Database.GetCollection<Order>("Orders");
            _stores = context.Database.GetCollection<Store>("Stores");
        }

        public async Task<List<Store>> GetStoresByMerchantAsync(string merchantId)
        {
            var filter = Builders<Store>.Filter.Eq(s => s.MerchantId, merchantId);
            return await _stores.Find(filter).ToListAsync();
        }

        public async Task<List<Product>> GetProductsByMerchantAsync(string merchantId)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.MerchantId, merchantId);
            return await _products.Find(filter).ToListAsync();
        }

        public async Task<List<Order>> GetOrdersByMerchantAsync(string merchantId)
        {
            var filter = Builders<Order>.Filter.Eq(o => o.MerchantId, merchantId);
            return await _orders.Find(filter).ToListAsync();
        }
        public async Task<List<Store>> GetAllStoresAsync()
        {
            return await _stores.Find(_ => true).ToListAsync();
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

        // SetupMerchantStoreAsync removed: now handled by Store logic

        // SetMerchantActiveAsync removed: now handled by Store logic

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


        public async Task<List<Product>> GetProductsByStoreAsync(string storeId)
        {
            return await _products.Find(p => p.StoreId == storeId && !p.IsDeleted).ToListAsync();
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


        public async Task<List<Order>> GetOrdersByStoreAsync(string storeId)
        {
            return await _orders.Find(o => o.StoreId == storeId)
                .SortByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // Removed CreateOrderAsync(object request): use strongly typed CreateOrderCommandHandler

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

        public async Task<bool> SetOrderReceivedAsync(string orderId)
        {
            var update = Builders<Order>.Update.Set(o => o.Status, "recibido");
            var result = await _orders.UpdateOneAsync(o => o.Id == orderId, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetOrderTrackingNumberAsync(string orderId, string trackingNumber)
        {
            var update = Builders<Order>.Update.Set(o => o.TrackingNumber, trackingNumber);
            var result = await _orders.UpdateOneAsync(o => o.Id == orderId, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Order>> GetOrdersByBuyerEmailAsync(string email)
        {
            return await _orders.Find(o => o.BuyerEmail == email).SortByDescending(o => o.CreatedAt).ToListAsync();
        }
        public async Task<Order?> GetOrderByIdAsync(string id)
        {
            return await _orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Product>> SearchProductsAsync(string searchTerm, string storeId = "")
        {
            Console.WriteLine($"🗄️ MONGO DEBUG: Starting search - SearchTerm: '{searchTerm}', StoreId: '{storeId}'");

            var filterBuilder = Builders<Product>.Filter;
            var searchFilter = filterBuilder.Or(
                filterBuilder.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );

            if (!string.IsNullOrEmpty(storeId))
            {
                Console.WriteLine($"🏪 MONGO DEBUG: Adding store filter for storeId: '{storeId}'");
                var storeFilter = filterBuilder.Eq(p => p.StoreId, storeId);
                searchFilter = filterBuilder.And(searchFilter, storeFilter);
            }

            var products = await _products.Find(searchFilter).ToListAsync();
            Console.WriteLine($"📊 MONGO DEBUG: Database query returned {products.Count} products");
            return products;
        }
    }
}