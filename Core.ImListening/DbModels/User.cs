using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Core.ImListening.DbModels
{
    public class User
    {
        [BsonId]
        public string Id { get; set; }
        public DateTime? ExpireOnUtc { get; set; }
        public string? Description { get; set; }
        public string? Role { get; set; } = "User";
        public string? Password { get; set; }
    }
}
