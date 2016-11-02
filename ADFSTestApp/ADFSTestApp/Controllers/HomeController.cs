using System;
using System.IdentityModel.Services;
using System.Threading;
using System.Web.Mvc;

namespace ADFSTestApp.Controllers
{
    public class HomeController : Controller
    {
        private const string SIGNOUTURL = "https://api.catalystdevworks.com/adfs/ls/?wa=wsignout1.0";

        /// <summary>
        /// Displays the claim from ADFS
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            ViewBag.ClaimsIdentity = Thread.CurrentPrincipal.Identity;
            return View();
        }

        /// <summary>
        /// Federated sign out from ADFS
        /// </summary>
        public void Logout()
        {
            string replyUrl = string.Empty;
            if (HttpContext.Request.Url != null)
            {
                string absoluteUrl = HttpContext.Request.Url.AbsoluteUri;
                replyUrl = absoluteUrl.Substring(0, absoluteUrl.LastIndexOf("/", StringComparison.Ordinal) + 1);
            }
            WSFederationAuthenticationModule.FederatedSignOut(new Uri(SIGNOUTURL), new Uri(replyUrl));
        }
    }
}