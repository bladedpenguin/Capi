var ActiveDirectory = require('ActiveDirectory');
//var ad = new ActiveDirectory('ldap://corpdc02.catalystsolves.com', 'dc=catalystsolves,dc=com', 'trau@catalystsolves.com', '');
var ad = new ActiveDirectory('ldap://ec2-52-33-55-190.us-west-2.compute.amazonaws.com', 'dc=capi,dc=catalyst,dc=com', 'trau@capi.catalyst.com', 'Catalyst2015');
var username = 'trau@capi.catalyst.com';
ad.findUser(username, function(err, user) {
    console.log(" ad lol ");
  if (err) {
    console.log('ERROR: ' +JSON.stringify(err));
    return;
  }
 
  if (! user) console.log('User: ' + username + ' not found.');
  else console.log(JSON.stringify(user));
});
console.log("meow");