using Microsoft.AspNetCore.Mvc;

namespace OpsHub_Facilities.Controllers;

public class AccountController : Controller
{
    public IActionResult Login()
    {
        return View();
    }
}
