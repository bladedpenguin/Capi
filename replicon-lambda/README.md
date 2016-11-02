Lambda development could be sped up with node-lambda. Install it with:

    npm install -g node-lambda

Edit index.js locally. By default, it is  the  lambda handler.
"event.json"  and "context.json" could be setup with json objects to mock data in AWS.
 Event could contain data like authorization, headers or anything else sent from the event 
 that triggers lambda. 

To run function locally

    node-lambda run

To package for deployment

    node-lambda package -e production

The zipped file could be found in ./build folder
