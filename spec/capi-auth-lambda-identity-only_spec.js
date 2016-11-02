const LambdaTester = require( 'lambda-tester' );
const context = require('aws-lambda-mock-context');
const nJwt = require('njwt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
var credentials = {
        key: fs.readFileSync('cert/capi.key')
        , cert: fs.readFileSync('cert/capi.crt')
    };
var token = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
var cert = credentials.cert;
const ctx = context();
var capi_auth_lambda_identity_only = require ("../capi-auth-lambda-identity-only/index.js");
var handler = capi_auth_lambda_identity_only.handler; 
var testJwt = jwt.sign({
            hd: "catalystdevworks.com",
            gtoken: token
        }, credentials.key, {                      
             algorithm: 'RS256'
            , expiresIn: '1hr'
            , audience: 'solr'
            , issuer: 'capi'
            , header: {
                kid: 'capi',
            },
        });
var event = {
  "authorizationToken": testJwt,
  "methodArn": "arn:aws:execute-api:[region]:[account_id]:[restApiId]/[stage]/[method]/[resourcePath]",
  "type": "TOKEN"
};
let decoded = jwt.decode(event.authorizationToken);
describe("handler",function(){
    it("returns policy", function(done){
        return LambdaTester( handler )
			.event( event )
			.expectResult( function( result ) {
                console.log(result);
                expect( result. policyDocument ).not.toEqual(null);
                expect( result. policyDocument ).not.toEqual(undefined);
                done();      
            });
    });
});
