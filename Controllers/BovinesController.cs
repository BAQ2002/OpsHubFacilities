using Microsoft.AspNetCore.Mvc;

namespace OpsHub_Facilities.Controllers;

public class BovinesController : Controller
{
    public IActionResult IndexBovine()
    {
        return View();
    }
}
