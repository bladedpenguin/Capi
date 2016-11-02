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
"eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkODViYmZmZGNhNzZiZjJiYzJmMmQ2Y2M1NzBlMG.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXRfaGFzaCI6InFmN01PRk9ONUtKdENXOW9YQUJ1VHciLCJhdWQiOiI1NTExMDU2OTI5Ny1pM3BjaWg1bWwwa3JhczdubGM2cGR2YjZoZnZmamUxdi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNTMzNjg0MDgzNjM4ODcwMjA3MyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiI1NTExMDU2OTI5Ny1pM3BjaWg1bWwwa3JhczdubGM2cGR2YjZoZnZmamUxdi5p1cml0c2t5QGNhdGFseXN0ZGV2d29ya3MuY29tIiwiaWF0IjoxNDcxMjY3NjYxLCJleHAiOjE0NzEyNzEyNjEsIm5hbWUiOiJEbWl0cmkgTWVqdXJpdHNreSIsImdpdmVuX25hbWUiOiJEbWl0cmkiLCJmYW1pbHlfbmFtZSI6Ik1lanVyaXRza3kiLCJsb2NhbGUiOiJlbiJ9.MJwM2_twIZWc1MsMRJH-HGsUiMscGMeq2uPdvRUvAL71E1mD88ja1pnYihCxtdh4Gu1T8xIGAgqEn4VVY9H_EAYCTjYc5nUjDUEBWidEDt8U9_kXuqUjJTLao5fRENiUs9Es7JNhw_JyDp3Jo338Us-81WBtlqs6PpsMruXLUhZYrxxqXBUaRt35sCHhrSHeuyhDuSESOU0sqdAkZnwdOJnhDote_c6Ewauy_HRHIK-bDs4S52Ngw"
var cert = credentials.cert;
const ctx = context();
var capi_auth_lambda_service_only = require ("../capi-auth-lambda-service-only/index.js");
var AWS = require('aws-sdk-mock');
var handler = capi_auth_lambda_service_only.handler;
AWS.mock('S3','getObject',
  {"header":{"alg":"RS256","kid":"104625465f6d4c7d214e3326913c5a5e4505699c"},"Body":cert,"gtoken":"whatevertoken","payload":{"iss":"accounts.google.com","at_hash":"x6waF0bBOKR_AxSKoEzszg","aud":"55110569297-i3pcih5ml0kras7nlc6pdvb6hfvfje1v.apps.googleusercontent.com","sub":"115336840836388702073","email_verified":true,"azp":"55110569297-i3pcih5ml0kras7nlc6pdvb6hfvfje1v.apps.googleusercontent.com","hd":"catalystdevworks.com","email":"dmejuritsky@catalystdevworks.com","iat":1470861042,"exp":2470864642,"name":"John Doe","given_name":"JoeJoe","family_name":"Doe","locale":"en"},"signature":"M60ZVD7c5d5VqcJchrxUvviZvdmnQ6d4hA46GfaJMiSrnIDGHl7DhvjlqVarfXPBI_MtMTm5g6oblFJ-OlCLCuBJVDd2YKsWKR7wCDAGCJi2lkKtHxOcFxjL8KHuq2BrV4CWv9OSQdBfHseUi-reoEOgrCiQ7yAOxgv_jybweQRrziWYNPP_3GjFrddcXCFOTEuVaqTmS1Rui1iIC-S9p2hW5wpfXXHo8kq-wMHiRQdurk2qYb5udkEsFXc1fxpNsZPlXNhnZF086ty9QAjtwecUHX1nZ186uNfikmsZK38_YnKnVOfn_pn6fKqUEV9-iqfH8ZXKxApsoQOs-FTeqg"});
var testJwt = jwt.sign({
            gtoken: token
        }, credentials.key, {
            algorithm: 'RS256'
            , expiresIn: '1hr'
            , audience: 'solr'
            , issuer: 'capi'
            , header: {
                kid: 'capi'
            },
        });
var event = {
  "authorizationToken": testJwt,
  "methodArn": "arn:aws:execute-api:[region]:[account_id]:[restApiId]/[stage]/[method]/[resourcePath]",
  "type": "TOKEN"
};

describe("handler",function(){
    it("returns policy", function(done){
        handler(event, ctx);
        return LambdaTester( handler )
			.event( event )
			.expectSucceed( function( result ) {
                console.log(result);
                expect( result. policyDocument ).not.toEqual(null);
                expect( result. policyDocument ).not.toEqual(undefined);
                done();
                AWS.restore('S3');
            });
    });
});
