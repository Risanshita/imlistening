using Core.ImListening.DbModels;

namespace Core.ImListening.ApiModels
{
    public class LoadTestGroup
    {
        public int HitCount { get; set; }
        public Webhook Webhook { get; set; }
    }
}
