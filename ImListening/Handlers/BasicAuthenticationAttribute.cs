using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;

namespace ImListening.Handlers
{

    public class BasicAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly IUserService _userService;
        public BasicAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock, IUserService userService)
            : base(options, logger, encoder, clock)
        {
            _userService = userService;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                // No Authorization header present
                return AuthenticateResult.Fail("Missing Authorization header");
            }

            try
            {
                var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);

                if (authHeader.Scheme.Equals("Basic", StringComparison.OrdinalIgnoreCase))
                {
                    var encodedCredentials = authHeader.Parameter;
                    var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(encodedCredentials));
                    var credentialParts = credentials.Split(':', 2);

                    if (credentialParts.Length == 2)
                    {
                        var username = credentialParts[0];
                        var password = credentialParts[1];

                        // Perform your authentication logic here
                        // Set the authenticated user's identity and claims if the authentication is successful
                        // Return AuthenticateResult.Success with the authenticated user's identity

                        if (await IsValidUser(username, password))
                        {
                            var claims = new[] { new Claim(ClaimTypes.Name, username) };
                            var identity = new ClaimsIdentity(claims, Scheme.Name);
                            var principal = new ClaimsPrincipal(identity);
                            var ticket = new AuthenticationTicket(principal, Scheme.Name);

                            return AuthenticateResult.Success(ticket);
                        }
                    }
                }

                // Invalid Authorization header
                return AuthenticateResult.Fail("Invalid Authorization header");
            }
            catch
            {
                // Error parsing Authorization header
                return AuthenticateResult.Fail("Error parsing Authorization header");
            }
        }

        private async Task<bool> IsValidUser(string username, string password)
        {
            // Add your custom authentication logic here
            // Return true if the user is valid, otherwise false
            // You can check against your user repository or any other authentication mechanism
            // For simplicity, this example considers any non-empty username and password as valid

            return (await _userService.Authenticate(username, password)) != null;
        }
    }

}
