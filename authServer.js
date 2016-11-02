/*jshint esnext: true */
(function () {
    "use strict";
    //const ActiveDirectory = require('ActiveDirectory');
    const express = require('express');
    const https = require('https');
    const http = require('http');
    const AWS = require('aws-sdk')
    const fs = require('fs');
    const jwt = require('jsonwebtoken');
    const MICROSERVICE_URL = 'http://Capi-Load-Balancer-1155966111.us-east-1.elb.amazonaws.com/solr';
    const google = require('googleapis');
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2('55110569297-i3pcih5ml0kras7nlc6pdvb6hfvfje1v.apps.googleusercontent.com', 'i189QPnRygP64jNwcZaDTQF_', 'https://localhost:8080');
    let calendar = google.calendar('v3');
    let oauth2 = google.oauth2('v2');
    google.options({
        auth: oauth2Client
    }); // set auth as a global default
    let app = express();
    let credentials = {
        key: fs.readFileSync('cert/capi.key')
        , cert: fs.readFileSync('cert/capi.crt')
    };
    app.use(express.static('webapp'));
    app.post('/tokensignin', function (req, res) {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            //body returns auth_tokens, scopes, 
            // and other ids needed for authentication
            let authResponse = JSON.parse(body);
            oauth2Client.setCredentials({
                access_token: authResponse.access_token
                //refresh_token: 'REFRESH TOKEN HERE'
            });
            var events = [];
            oauth2.tokeninfo({
                id_token: authResponse.id_token
            }, (err, response) => {
                if (err) console.log('err' + err);
                //response returns all calendar events and details
                events = response.items;
                res.end(JSON.stringify(response));
            });
        });
    });
    app.post('/signtoken', function (req, res) {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            //console.log(`signing jwt: ${body}`);
            let token = signToken(body);
            //console.log(`encrypted token: ${token} : `);
            res.end(token);
        });
    });
    app.post('/verifytoken', function (req, res) {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            console.log(`reciieved Service token for verification: ${body}`);
            //console.log(`Cert: ${credentials.cert}`);
            let token = jwt.verify(body, credentials.cert, {
                algorithms: ['RS256', 'RS512']
            , });
            console.log(`decrypted token ${token}`);
            res.end(JSON.stringify(token));
        });
    });
    app.get('/timeline', function (req, res) {
        if (!req.headers.authorization) {
            res.writeHead(401).end();
        }
        let a = req.headers.authorization.split(' ');
        if (a[0].toLowerCase() != ('bearer')) {
            res.writeHead(401).end();
        }
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            https.get({
                host: 'api.catalystdevworks.com'
                , port: 443
                , path: '/timeline'
                , headers: {
                    authorization: signToken("")
                    , accept: '*/*'
                }
            }, (response) => {
                let data = [];
                response.on('data', (chunk) => {
                    data.push(chunk);
                }).on('end', () => {
                    data = Buffer.concat(body).toString();
                    res.end();
                });
            });
        });
    });
    app.get('/solr', function (req, res) {
        if (!req.headers.authorization) {
            res.writeHead(401).end();
        }
        let a = req.headers.authorization.split(' ');
        if (a[0].toLowerCase() != ('bearer')) {
            res.writeHead(401).end();
        }
        console.log(`auth: ${a[1]}`);
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            https.get({
                host: 'api.catalystdevworks.com'
                , port: 443
                , path: '/profiles?q=(and%20name:%27Timothy%27)'
                , headers: {
                    authorization: signToken(a[1])
                    , accept: '*/*'
                }
            }, (response) => {
                let body = [];
                response.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    console.log(body);
                    res.end(body);
                });
            });
        });
    });
    app.post('/replicon', function (req, res) {
        
        let a = req.headers.authorization.split(' ');
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
            console.log(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();    
            let options={
                hostname: 'api.catalystdevworks.com',
                port: 443,
                path: '/testhr',
                method: "POST",
                data: body,
                headers: {
                    authorization: signToken(a[1]),
                    accept: '*/*'
                },
                agent : false
            }; 
            let request = https.request(options, (res) => {
                var body = [];                
                res.setEncoding('utf8');               
                res.on('data', function (chunk) {
                    body.push(chunk);
                    console.log(body);
                });     
                res.on('end', function(){
                    return JSON.stringify(body);
                });
            });
            request.end(body);
        });
    });
    https.createServer(credentials, app).on('clientError', (err) => {
        console.log('clientError: ' + err.message);
    }).listen(8080);
    app.post('/microservice', (req, res) => {
        //console.log(JSON.stringify(req.headers));
        if (!req.headers.authorization) {
            res.writeHead(401).end();
        }
        let a = req.headers.authorization.split(' ');
        if (a[0].toLowerCase() != ('bearer')) {
            res.writeHead(401).end();
        }
        console.log(`auth: ${a[1]}`);
        //assuming a valid google token...
        https.request({
            method: 'GET'
            , host: '49gv5hjh98.execute-api.us-east-1.amazonaws.com'
            , port: 443
            , path: '/csTestDev/solr'
            , headers: {
                authorization: signToken(a[1])
                , accept: '*/*'
            }
            , key: credentials.key
            , cert: credentials.cert
        }, (response) => {
            let body = [];
            response.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                console.log(body);
                res.end(body);
            });
        }).end(`{
   "Action": "Query",
   "QueryType": "ProjectByIds",
   "DomainType": "Replicon.Project.Domain.Project",
   "Args": [
      [
         678
      ]
   ]
}`);
    });
    app.post('/federate', (req, res) => {
        console.log(JSON.stringify(req.headers));
        if (!req.headers.authorization) {
            res.writeHead(401).end();
        }
        let a = req.headers.authorization.split(' ');
        if (a[0].toLowerCase() != ('bearer')) {
            res.writeHead(401).end();
        }
        console.log(`auth: ${a[1]}`);
        //assuming a valid google token...
        https.request({
            method: 'GET',
            host: 'api.catalystdevworks.com',
            port: 443,
            path: '/bootcamps/uiux',
            headers: {
                authorization: signToken(a[1]),
                accept: '*/*'
            },
            key: credentials.key,
            cert: credentials.cert
        }, (response) => {
            let data = [];
            response.on('data', (chunk) => {
                data.push(chunk);
            }).on('end', () => {
                data = Buffer.concat(data).toString();
//                console.log(data);
                console.log("Got from federation endpoint: " + data);
                res.end(data);
                
                data = JSON.parse(data);
                
                var destinationUrl = "https://console.aws.amazon.com", //set like this for future options/bootcamps(+user folders)
                internalUrl = "https://catalyst-aws2.signin.aws.amazon.com/console";
                
//                var session = {
//                    "sessionId": data.Credentials.AccessKeyId,
//                    "sessionKey": data.Credentials.SecretAccessKey,
//                    "sessionToken": data.Credentials.SessionToken
//                };
//                AWS.config.accessKeyId = data.Credentials.AccessKeyId;
//                AWS.config.secretAccessKey = data.Credentials.SecretAccessKey;
//                AWS.config.sessionToken = data.Credentials.SessionToken;
//                AWS.config.region = "us-east-1";
                
                
//                let iam = new AWS.IAM();
//                iam.listPolicies({},(err, data) => {
//                    if (err) {
//                        console.log('Policy Error: ' + err);
//                    } else {
//                        console.log( 'Policies! : ' + JSON.stringify(data));
//                        res.end(JSON.stringify(data));
//                    }
//                });
                
//                let s3 = new AWS.S3();
//                s3.putObject({
//                    Bucket: 'catalyst-ui-ux',
//                    Key: 'testFile',
//                    Body: `{"lol": "testing at ' + ${new Date()}}"`,
//                    ContentType: 'application/json'
//                }, (err, data) => {
//                    if (err) {res.end(err)} else {
//                        console.log(`s3 put respons${JSON.stringify(data)}`)
//                        res.end('https://s3.amazonaws.com/catalyst-ui-ux/testFile');
//                    }
//                    res.end()
//                });
                
//                s3.getObject({
//                    Bucket: 'catalyst-ui-ux',
//                    Key: 'index.html'
//                }, (err, data) => {
//                    if (err) {
//                        console.log('Error getting from s3: ' + err)
//                        res.end(err);
//                    }
//                    else {
//                        console.log('retrieved data from s3: ' + JSON.stringify(data));
//                        res.end(data.Body);
//                    }
//                });
//                console.log('s3 object requested')
            });
        }).end();
    });

    function signToken(token) {
        let ret = jwt.sign({
            gtoken: token
        }, credentials.key, {
            algorithm: 'RS256'
            , expiresIn: '1hr'
            , audience: 'solr'
            , issuer: 'capi'
            , header: {
                kid: 'capi'
            }
        });
//        console.log(` signed a token: ${ret}`);
        return ret;
    }
})();