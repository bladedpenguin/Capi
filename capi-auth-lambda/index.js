/*jshint esnext: true */
"use strict";
const jwt = require('jsonwebtoken');
const nJwt = require('njwt');
const AWS = require('aws-sdk');
const BUCKET_NAME = 'catalyst-api-secure';
const UNAUTHORIZED = 'Unauthorized';
const VERSION_DATE = "2012-10-17";


let google = require('googleapis');
let OAuth2 = google.oauth2('v2');

exports.handler = function (event, context) {
    const s3 = new AWS.S3();
    //console.log(event);
    // console.log('Client token: ' + event.authorizationToken);
     console.log('Method ARN: ' + event.methodArn);
    //    //
    var apiOptions = {};
    var tmp = event.methodArn.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    var awsAccountId = tmp[4];
    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = '*';
    //    console.log(JSON.stringify(apiOptions));
//    let header = event.authorizationToken.substring(0,event.authorizationToken.indexOf('.'));
    let decoded = jwt.decode(event.authorizationToken,{complete: true});
    if (!decoded || decoded.header.kid !== decoded.payload.iss){
        context.fail(`Invalid Service Token`);
    }
    console.log(`decoded token: ${JSON.stringify(decoded)}`);
    s3.getObject({
        Bucket: BUCKET_NAME,
        Key: `${decoded.header.kid}.crt`
    }, (err, data) => {
        if (err) {
            console.error(`Expected to get ${decoded.header.kid}.crt in ${BUCKET_NAME} : ${err}`);
            context.fail('Cert Not Found');
        }
        //console.log("cert got: " + data.Body.length);
        let cert = data.Body;
        //console.log(`Cert: ${cert}`);
        let token = jwt.verify(event.authorizationToken, cert, {
            algorithms: ['RS256', 'RS512'],
        }, (err, token) => {
            if (err) {
                console.log(`Failed Service Authentication: Service token: ${err}`);
                context.fail(UNAUTHORIZED);
            } else {
                //got our google token out of the service token
                let decoded = jwt.decode(token.gtoken);
                if (!decoded) {
                    console.log(`Failed Authentication: gtoken was not a valid jwt: ${token.gtoken}`);
                    context.fail(UNAUTHORIZED);
                }
                if (decoded.hd !== 'catalystdevworks.com') {
                    console.error(`Incorrect Hosted Domain: ${decoded.hd}`);
                    context.fail(UNAUTHORIZED);
                }
                OAuth2.tokeninfo({
                    id_token: token.gtoken
                }, (err, info) => {
                    if (err) {
                        console.log(`Identity Token not verifiable: ${err}`);
                        context.fail(UNAUTHORIZED);
                    }
                    if (decoded.sub !== info.user_id) {
                        console.log(`incorrect user id: ${decoded.sub} did not match ${info.user_id}`);
                        context.fail(UNAUTHORIZED);
                    }
                    //Build policy object
                    let policy = {};
                    policy.principalId = decoded.email;
                    policy.policyDocument = {};
                    policy.policyDocument.Version = VERSION_DATE;
                    policy.policyDocument.Statement = [];
                    let statementObject = {};
                    statementObject.Effect = "Allow";
                    statementObject.Action = [];
                    statementObject.Action.push("execute-api:Invoke");
                    statementObject.Action.push("cloudsearch:search");
                    statementObject.Resource = [];
                    statementObject.Resource.push(event.methodArn);
                    statementObject.Resource.push("arn:aws:cloudsearch:us-east-1:719839850793:domain/testdomain");
                    policy.policyDocument.Statement.push(statementObject);

                    console.log(` decoded google token: ${JSON.stringify(decoded)} : returning policy : ${JSON.stringify(policy)}`);
                    //let policy = new AuthPolicy(decoded.sub, '719839850793', apiOptions);
                    context.succeed(policy);

                });
            }
        });
    });
};