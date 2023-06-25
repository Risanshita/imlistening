using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace ImListening.Controllers
{
    [Route("api/users")]
    [ApiController]
    [AllowAnonymous]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public IAsyncEnumerable<User> GetUsers([FromQuery] string? keyword = null)
        {
            return _userService.GetUsersAsync(keyword);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById([FromRoute] string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult> CreateUser([FromBody] UserRequest request)
        {
            await _userService.CreateUserAsync(request);
            return new ObjectResult(null) { StatusCode = (int)HttpStatusCode.Created };
        }

        [HttpPost("authenticate")]
        public async Task<ActionResult> Authenticate([FromBody] LoginRequest request)
        {
            var user = await _userService.Authenticate(request.Username, request.Password);
            if (user == null)
            {
                return BadRequest(new { Message = "Username or password is wrong." });
            }
            return new ObjectResult(user) { StatusCode = (int)HttpStatusCode.OK };
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser([FromRoute] string id, [FromBody] UserRequest request)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            await _userService.UpdateUserAsync(user, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser([FromRoute] string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            await _userService.DeleteUserAsync(user);
            return Ok();
        }
    }
}
