
var http = require('http');
var https = require('https');

var username = 'PSAUser';
var password = 'SolrUserPSA';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
//console.log(auth);

var gitOptions = {
    hostname: 'api.github.com',
    headers: {
        'User-Agent': 'bladedpenguin'
        //Cookie: '_octo=GH1.1.529297114.1440599524; logged_in=yes; dotcom_user=bladedpenguin; _ga=GA1.2.1967665659.1440599524'
    }
};
var prastOptions = {
    hostname: 'prast.catalystdevworks.com',
    port: 8983,
    path: '/solr/PSA/select?q=*:*&wt=json&indent=true',
    //auth: auth
    headers: {
        Authorization: auth
    }
};

var prastTestOptions = {
    hostname: 'vxa3asanc2.execute-api.us-west-2.amazonaws.com',
    path: '/dev',
    headers: {
        Authorization: auth
    }
};

var server = http.createServer(function(req, res){
    //authenticate()
    var request = http.get(prastOptions, function(response){
        response;
        //console.log('response from git:' + JSON.stringify(response.complete));
        //console.log('response from git:' + Object.keys(response));
        res.writeHead(200);
        var json = '';
        response.on('data', function(chunk) {
            console.log('got %d bytes of data: %s', chunk.length, chunk);
            json += chunk;
        });
        response.on('error', function(err){
            console.log("error: " + err.message())
        });
        response.on('close', function(){
            console.log("closed");
        });
        response.on('end',function(){
            console.log("done")
            JSON.parse(json);
            res.end(json);
        });
        
    });
});

process.on('uncaughtException',function(err){
    console.log("oops");
})


//console.log()
server.listen(3000);