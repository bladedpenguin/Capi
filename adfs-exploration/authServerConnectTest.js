var https = require('https');
var http = require('http');
var fs = require('fs');

var options = {
    hostname: 'localhost',
    port: 443,
    path: '/',
    method: 'GET',
    rejectUnauthorized: false,
    //protocol: 'https:',
    //agent: false,
    //ca: fs.readFileSync('cert/capi.crt')
};

//options.agent = new https.Agent(options);

var req = https.request(options, function(res){
    console.log("connection established: ");
    var stuff = '';
    res.on('data', function(data){
        stuff += data;
        console.log("got stuff: " + stuff);
    });
    res.on('end', function(){
        console.log("done getting stuff");
    });
});

req.on('error', function(err){
    console.log('oops: ' + err.message);
});

console.log("done");