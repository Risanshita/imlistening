
using Common.ImListening.Repositories.MongoDb;
using Core.ImListening.DbModels;
using Core.ImListening.Services;
using FluentAssertions;
using ImListeningTest.Model;
using Moq;
using StackExchange.Redis;

namespace ImListeningTest
{
    public class UnitTest1
    {
        [Fact]
        public async Task Test1()
        {
            var repo = new Mock<IMongoDbRepository<Webhook>>();

            WebhookService webhookService = new(repo.Object);

            repo.Setup(a => a.GetByIdAsync(""))
                .ReturnsAsync(new Webhook() { ContentType = "Html" });
            WebhookClone webhookClone = new WebhookClone() { ContentType = "Html" };
            var res = await webhookService.GetWebhookByIdAsync("");

            res.Should().BeEquivalentTo(webhookClone, a => a.WithStrictOrdering());
            webhookClone.Should().BeEquivalentTo(res, a => a.WithStrictOrdering());
        }
    }
}