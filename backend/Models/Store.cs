using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FluxCommerce.Api.Models
{
    public class Store
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
    public string MerchantId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string StoreSlug { get; set; } = null!;
        public string? Category { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string State { get; set; } = "active";
        public bool IsActive { get; set; } = true;
    }
}
