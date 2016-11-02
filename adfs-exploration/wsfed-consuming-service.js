var wsfed = require('node-wsfed'),
    passport = require('passport'),
    express = require('express'),
    fs = require('fs'),
    wsfedsaml2 = require('passport-wsfed-saml2').Strategy,
    http = require('https');

var wsfedOptions = {
	realm: 'http://localhost:3000',
	namespace: '[Enter ACS namespace here]',
	key: '[Enter security key here]',
	expiry: 20,
	ip: 'https://api.catalystdevworks.com/adfs/ls/', // Using the Windows Live Identity Provider
	bunyan: { name: 'wsfed' } // Use the internal bunyan logger
};

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.use(new wsfedsaml2(
  {
    path: '/login/callback',
    realm: 'https://localhost:3000',
    homeRealm: '', // optionally specify an identity provider to avoid showing the idp selector
    identityProviderUrl: 'https://api.catalystdevworks.com/adfs/ls',
    cert: fs.readFileSync('cert/star_catalystdevworks_com.crt')
  },
  function(profile, done) {
      
    findByEmail(profile.email, function(err, user) {
      console.log('user: ' +JSON.stringify(user));
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  })
);

var app = express();


app.post('/login/callback',
  passport.authenticate('wsfed-saml2', { failureRedirect: '/' }),
  function(req, res) {
    console.log("recieved login/callback");
    res.redirect('/');
  }
);

app.get('/account', ensureAuthenticated,
  function(req, res) {
    res.send('you did it!');
  });

app.get('/login',
  passport.authenticate('wsfed-saml2', { failureRedirect: '/', forceAuthn: true }),
  function(req, res) {
    console.log("herp derp authentication posted")
    res.redirect('/');
  }
);
 
app.get('/', function (req, res) {
    res.send('Meow! <br><a href="/test">test</a><br><a href="/account">account</a><br> <a href="/ad-oauth-test">AD OAuth Test</a>');
});

app.post('/', function(req, res) {
   console.log('posted to  /') ;
    res.send('posted');
});
 
// Add ws-federation endpoints
//app.use(wsfed.endpoints(options));
 
// Configure site to use federated security
//app.use(wsfed.enableAuthentication(options));
 
//// Configure secure area processing
//app.get('/secure', wsfed.requireAuthentication(options), 
//	function(req, res) {
//		var body = 'You are authenticated and in the secure area!';
//		body += '<br/>Identity Provider: ' + req.claims.identityprovider;
//		body += '<br/>ID:' + req.claims.nameid;
//		res.send(body);
//	});

http.createServer({
    key: fs.readFileSync('cert/capi.key'),
    cert: fs.readFileSync('cert/capi.crt')
}, app).listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    console.log('hrm checking authentication: ' + req.isAuthenticated());
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

