AWS lambda function that returns JIRA info needed by KPI.
It needs two header parameters 'queryType' and 'projectKey'.
'queryType' can be one of ['burndownChart', 'defectRate']
'projectKey' is the key project is given in JIRA. (Capitilized letters next to issue numbers)

To test it locally, install node-lambda

    npm install -g node-lambda

From jira-lambda folder

    node-lambda run

To package lambda for deployment

    node-lambda package -e production

To test different configurations , tweak event.json. To see what happens when no
queryType given, remove it form JSON object in event.json.

Lambda is protected by JWT token. Check CAPI documentation about obtaining that.
