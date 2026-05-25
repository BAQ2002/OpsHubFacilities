using Microsoft.AspNetCore.Mvc;

namespace AgroManager.PL.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult NovaSolicitacao()
        {
            return View();
        }
    }
}
