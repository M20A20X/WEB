using System.Web.Mvc;

namespace DebugMVC.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            int firstVal = 10;
            int secondVal = 5;
            int result = firstVal / secondVal;

            ViewBag.Message = "Отладка приложения ASP.NET MVC!";

            return View(result);
        }
    }
}