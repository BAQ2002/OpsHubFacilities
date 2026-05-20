using Microsoft.AspNetCore.Mvc;

namespace OpsHub_Facilities.Controllers;

public class SwinesController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
