using System.ComponentModel.DataAnnotations;

namespace Core.ImListening.ApiModels
{
    public class UserRequest
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Please enter full name.")]
        public string? Username { get; set; }
        public string? Description { get; set; }
        [Required(AllowEmptyStrings = false, ErrorMessage = "Please enter password.")]
        [MinLength(5, ErrorMessage = "Password length should be minimum 5 character.")]
        public string? Password { get; set; }
    }
}
