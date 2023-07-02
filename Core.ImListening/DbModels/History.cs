namespace Core.ImListening.DbModels
{
    public class History
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime? ExpireOnUtc { get; set; } = DateTime.UtcNow.AddDays(15);

        public Webhook Webhook { get; set; }
        public string WebhookId { get; set; }
        public User User { get; set; }
        public string UserId { get; set; }

        public DateTime CreateAtUtc { get; set; } = DateTime.UtcNow;

        public ICollection<RequestInfo> RequestInfos { get; set; }
    }
}
