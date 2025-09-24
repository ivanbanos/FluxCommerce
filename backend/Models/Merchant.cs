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
    public string? StoreSlug { get; set; } // Slug único para la URL de la tienda
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public string? PasswordHash { get; set; }
        [Required]
        [Phone]
        public string? Phone { get; set; }
    public string? ActivationToken { get; set; } // Token de activación
    public string State { get; set; } = "pending activation"; // Estados: pending activation, validatedemail, active
    public bool IsActive { get; set; } = true; // Control de activación/desactivación
    }
}
