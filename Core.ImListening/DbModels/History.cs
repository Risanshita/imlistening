using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Core.ImListening.DbModels
{
    public class History
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public DateTime? ExpireOnUtc { get; set; } = DateTime.UtcNow.AddDays(15);
        public Webhook Webhook { get; set; }
        public string WebhookId { get; set; }
        public User User { get; set; }
        public string UserId { get; set; }
        public DateTime CreateAtUtc { get; set; } = DateTime.UtcNow;
        public List<RequestInfo> RequestInfos { get; set; }
    }
}
