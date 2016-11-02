var express = require('express');
var passport = require('passport');
var https = require('https');
var LocalStrategy = require('passport-local').Strategy;
var SamlStrategy = require('passport-saml-encrypted').Strategy;
var fs = require('fs');

var app = express();

app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('ad', new SamlStrategy(
    {
    entryPoint: 'https://api.catalystdevworks.com/adfs/ls/',
    issuer: 'https://localhost:3000',
    callbackUrl: 'https://localhost:3000/login/callback',
    //decryptionPvk: fs.readFileSync('cert/capi.key'),
    privateCert: fs.readFileSync('cert/capi.key'),
    cert: fs.readFileSync('cert/star_catalystdevworks_com.crt'),
    //authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
    //authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
    signatureAlgorithm: 'sha1',
    encryptedSAML:true,
    //identifierFormat:'urn:relying:party:trust:identifier',
    //identifierFormat:"urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
    //identifierFormat: null
    identifierFormat:"urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified"
    },function(profile, done) {
        console.log('profile got: ' + JSON.stringify(profile));
        return done(null, {
            upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
            // e.g. if you added a Group claim
            group: profile['http://schemas.xmlsoap.org/claims/Group']
        });
    }
));

//console.log(passport.authenticate('local'));


app.get('/', function (req, res) {
    res.send('Meow! <br><a href="/test">test</a><br><a href="/ad-saml-test">ad saml test</a><br> <a href="/ad-oauth-test">AD OAuth Test</a>');
});

app.get('/test', isLoggedIn, function (req, res) {
    console.log('request recieved');
    res.send('Hello World!');
});

app.get('/ad-oauth-test', function(req, res) {
    
});

app.get('/ad-saml-test', passport.authenticate('ad', { failureRedirect: '/',  failureFlash: true }),function(req, res) {
   console.log('ad test succesful login');
    res.send('Active directory login successful');
}).on('error', function(err){
    console.log("ad test error: " + err.message);
});

app.post('/adcomplete', function(req, res) {
   console.log('posting to adcomplete: ' + JSON.stringify(req));
   res.send('<h1>You did it!</h1>');
});

app.post('/login/callback',
  passport.authenticate('ad', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    console.log("login callback posted: " + JSON.stringify(req));
    res.redirect('https://localhost:3000/');
  }
);


//app.listen(3000, function () {
//    console.log('Example app listening on port 3000!');
//});
https.createServer({
    key: fs.readFileSync('cert/capi.key'),
    cert: fs.readFileSync('cert/capi.crt')
}, app).listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

app.on('error', function(err){
   console.log("error: " + err.message);
});

function isLoggedIn(req, res, next) {
    console.log('login test');
    // if user is authenticated in the session, carry on 
    //if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}