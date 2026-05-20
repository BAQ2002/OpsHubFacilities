using Microsoft.AspNetCore.Mvc;

namespace OpsHub_Facilities.Controllers;

public class BatchController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
