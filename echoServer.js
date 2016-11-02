/*jshint esnext: true */
var http = require("http");

http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    var headThing = JSON.stringify(request.headers);
    console.log(request.method);
    console.log(request.url);
    console.log('headers:  ' + headThing);
    var body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log(`Body: ${JSON.stringify(body)}`);
    });

}).listen(8082);

console.log('Server running at http://127.0.0.1:8082/');