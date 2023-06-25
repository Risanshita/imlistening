namespace Core.ImListening.DbModels
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime? ExpireOnUtc { get; set; }
        public string? Description { get; set; }
        public string? Role { get; set; } = "User";
        public string? Password { get; set; }
    }
}
