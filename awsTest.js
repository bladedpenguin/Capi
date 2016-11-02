var https = require('https');
var fs = require('fs');

var serverOptions = {
    key: fs.readFileSync('cert/capi-key.pem'),
    cert: fs.readFileSync('cert/capi-cert.pem')
};

var gitOptions = {
    hostname: 'api.github.com',
    headers: {
        'User-Agent': 'bladedpenguin'
    }
};


https.createServer(serverOptions, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
    
});


var req = https.get(gitOptions, function (res) {
    var data = '';
    //res.on
    res.on('data', function (chunk) {

        data += chunk;
    });
    res.on('end', function () {
        console.log(data);
    });
});
req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});