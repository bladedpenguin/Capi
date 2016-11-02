using System.Web.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using ADFSTestApp.Controllers;

namespace ADFSTestApp.Tests.Controllers
{
    [TestClass]
    public class HomeControllerTest
    {
        [TestMethod]
        public void Index()
        {           
            HomeController controller = new HomeController();         
            ViewResult result = controller.Index() as ViewResult;            
            Assert.IsNotNull(result.ViewData["ClaimsIdentity"]);           
        }
    }
}
