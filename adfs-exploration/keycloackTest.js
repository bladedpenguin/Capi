var kau = require('keycloak-auth-utils');
var config = new kau.Config({
    realm: 'master',
    authServerUrl: 'localhost:8081'
});
var gm = kau.GrantManager(config);

console.log('done');