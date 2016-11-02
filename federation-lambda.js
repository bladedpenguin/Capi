/*jshint esnext: true */
var aws = require('aws-sdk');
https = require('https');


exports.handler = function (event, context, callback) {
    var sts = new aws.STS();
    // console.log('event: ' + JSON.stringify(event, null, 3));
    // console.log("context: " + event.context.authorizerPrincipalId);
    if (event.context && event.context.authorizerPrincipalId){
        var name = event.context.authorizerPrincipalId.split('@')[0];
    }
    if (!name){name = 'fedUser'}
    console.log(`name: ${name}`);
    var s3 = new aws.S3();
    s3.putObject({
        Bucket: 'catalyst-ui-ux',
        Key: `${name}/placeholder.json`,
        Body: `{"last accessed": "${new Date()}}"`,
        ContentType: 'application/json'
    }, (err,data) =>{
        if (err){console.log(`Error Uploading placeholder.json: ${err}`)} else {
            console.log(`Placeholder uplaoded: ${JSON.stringify(data)}`);
        }
    });
    var params = {
        
        RoleArn: 'arn:aws:iam::719839850793:role/federated_user',
        // RoleArn: 'arn:aws:iam::719839850793:role/UIUX_S3_access',
        RoleSessionName: name,
        DurationSeconds: 3600,
        Policy: 
        `{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "AllowUserToSeeBucketListInTheConsole",
                    "Action": ["s3:GetBucketLocation", "s3:ListAllMyBuckets"],
                    "Effect": "Allow",
                    "Resource": ["arn:aws:s3:::*"]
                },
                {
                    "Action": [
                        "s3:*"
                    ],
                    "Effect": "Allow",
                    "Resource": [
                        "arn:aws:s3:::catalyst-ui-ux/${name}/*",
                        "arn:aws:s3:::catalyst-ui-ux/${name}"
                    ]
                },
                {
                    "Action": [
                        "s3:Get*",
                        "s3:List*"
                    ],
                    "Effect": "Allow",
                    "Resource": [
                        "arn:aws:s3:::catalyst-ui-ux/*",
                        "arn:aws:s3:::catalyst-ui-ux"
                    ]
                }
            ]
        }`
    };
    
    destinationUrl = `https://console.aws.amazon.com/s3/home?region=us-east-1&bucket=catalyst-ui-ux&prefix=${name}/`, //set like this for future options/bootcamps(+user folders)
    internalUrl = "https://catalyst-aws2.signin.aws.amazon.com/console";
    sts.assumeRole(params, function (err, data) {
        if (err) {
            console.log("ERROR " + JSON.stringify(err), err.stack);
        } else {
            // callback(null,data);
            // return;
            var session = {
                "sessionId": data.Credentials.AccessKeyId,
                "sessionKey": data.Credentials.SecretAccessKey,
                "sessionToken": data.Credentials.SessionToken
            };
            console.log("sesh :" + JSON.stringify(session));
            var sessionUrl = encodeURIComponent(JSON.stringify(session));
            console.log("encoded sesh:" + sessionUrl);
            var fedUrl = "https://signin.aws.amazon.com/federation?Action=getSigninToken&SessionType=json&Session=" + sessionUrl;
            // var destinationUrlE = encodeURI(destinationUrl);
            // var internalUrlE = encodeURI(internalUrl);
            https.get(fedUrl, function (res) {
                console.log('statusCode: ', res.statusCode);
                var body = [];
                res.on('data', (d) => {
                    process.stdout.write(d);
                    body.push(d);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    console.log("mine body :" + body);
                    body = JSON.parse(body);
                    var token = body.SigninToken;
                    console.log("toke: " + token);
                    //remove hard coded stuff and uri encode
                    var SSO = 'https://signin.aws.amazon.com/federation?Action=login' +
                        // '&Issuer=' +
                        '&Destination=' + encodeURIComponent(destinationUrl) +
                        '&SigninToken=' + token;
                    callback(null, SSO);
                });
            }).on('error', (e) => {
                console.error(e);
            });
        }
    });
};