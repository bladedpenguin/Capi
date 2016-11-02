const LambdaTester = require( 'lambda-tester' );
var AWS = require('aws-sdk-mock');
var data = {"Credentials":{"AccessKeyId":"accesskeyid"}}
var federation_lambda = require ("../federation-lambda.js");
var handler = federation_lambda.handler;
var event = {"context":{"authorizerPrincipalId":"someName@email.com"}};
AWS.mock('S3','putObject');
AWS.mock('STS','assumeRole',data);
					
describe("federation lambda handler", function(){
       it('returns SSO', function(done) {
		     return LambdaTester( handler )
			.event( event )
			.expectResult( function(result){
				console.log("RESULT "+result);
				expect(result).toContain('SigninToken');
				done();
				AWS.restore('S3');	
                AWS.restore('STS');
			});
	   });
});

