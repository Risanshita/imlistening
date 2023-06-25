using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ImListening.Controllers
{
    public class BaseController : ControllerBase
    {
        protected string UserId
        {
            get
            {
                var userId = User.Claims?.FirstOrDefault(a => a.Type == ClaimTypes.Name)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new InvalidOperationException("Invalid user");
                }
                return userId;
            }
        }
    }
}
