/*jshint esnext: true */
"use strict";
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = 'catalyst-api-secure';
const VERSION_DATE = "2012-10-17";
//const UNAUTHORIZED = 'Unauthorized';
const UNAUTHORIZED = {
    "Version": VERSION_DATE,
    "Statement": [
        {
            "Effect": "Deny",
            "Action": "*",
            "Resource": "*"
        }
    ]
};
let google = require('googleapis');
let OAuth2 = google.oauth2('v2');
exports.handler = function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    //    console.log('Client token: ' + event.authorizationToken);
    //    console.log('Method ARN: ' + event.methodArn);
    //    //
    function succeed() {
        callback(null,{
            "principalId": decoded.email,
            "policyDocument" : {
                "Version":VERSION_DATE,
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": "execute-api:Invoke",
                        "Resource": event.methodArn
                    }
                ]
            }
        });
    };
    
    var sync = {
        hd: false,
        google: false,
        doneHd: () => {
            sync.hd = true;
            if (sync.google) {
                return succeed();
            }
        },
        doneGoogle: () => {
            sync.google = true;
            if (sync.hd) {
                return succeed();
            }
        }
    };
    
    let token = event.authorizationToken; 
    OAuth2.tokeninfo({
        id_token: token
    }, (err, info) => {
        if (err) {
            console.error(`Identity Token not verifiable: ${err}`);
            callback(null, UNAUTHORIZED);
            return;
        }
        sync.doneGoogle();
    });
    let decoded = jwt.decode(event.authorizationToken);
    if (!decoded) {
        console.error(`Failed Authentication: gtoken was not a valid jwt: ${token}`);
        callback(null,UNAUTHORIZED);
        return;
    }
    if (decoded.hd !== 'catalystdevworks.com') {
        console.error(`Incorrect Hosted Domain: ${decoded.hd}`);
        callback(null,UNAUTHORIZED);
        return;
    }
    
    sync.doneHd();
};