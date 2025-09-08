
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
        public MongoDbService(MongoDbContext context)
        {
            _merchants = context.Database.GetCollection<Merchant>("Merchants");
            _products = context.Database.GetCollection<Product>("Products");
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
            return await _products.Find(p => p.MerchantId == merchantId).ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(string id)
        {
            return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
        }
    }
}
