using Microsoft.AspNetCore.Mvc;

namespace OpsHub_Facilities.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
