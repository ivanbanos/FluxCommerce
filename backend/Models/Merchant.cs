using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace FluxCommerce.Api.Models
{
    public class Merchant
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
    [Required]
    public string? Name { get; set; }
    // StoreSlug removed: now handled by Store model
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public string? PasswordHash { get; set; }
        [Required]
    // Phone removed: now handled by Store model
    public string? ActivationToken { get; set; } // Token de activación
    public string State { get; set; } = "pending activation";
    public bool IsActive { get; set; } = true;
    }
}
