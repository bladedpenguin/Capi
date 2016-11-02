'use strict';

const auth = {
  'user': 'dashapp',
  'pass': '63115 vetch',
}
const jiraServer = 'https://catalystit.atlassian.net';
const options = {
  auth: auth,
  method: "get"
};


/**
* gets all issues for jira project
* usefull for contruction of defectRate
*/
exports.jiraDefectRate = (projectKey) => {
  const jiraUrl = jiraServer + '/rest/api/2/search?jql=project="' +
    projectKey + '"&maxResults=1000';
    return makeOptions(jiraUrl);
};

/**
 * returns a json object containing an array of sprints for a given project
 * need projectKey as seen in JIRA
 */
exports.jiraSprints = (projectKey) => {
  const jiraUrl = jiraServer +
    '/rest/greenhopper/1.0/integration/teamcalendars/sprint/list?jql=project=' +
    projectKey + ' and sprint in openSprints()';
    return makeOptions(jiraUrl);
}


/**
 * gets Sprint data to construct burndown charts
 * need rapid view id and project id
 */
exports.jiraBurndownChart = (rapidViewId, sprintId) => {
  const jiraUrl = jiraServer +
    '/rest/greenhopper/1.0/rapid/charts/scopechangeburndownchart.json?rapidViewId=' +
    rapidViewId + '&sprintId=' + sprintId +
    '&estimate=field_customfield_10004';

    return makeOptions(jiraUrl);
}

/**
* gets a an array of rapidViews. Useful to check if a project has a burndown chart
*/
exports.jiraRapidViews = () => {
    const jiraUrl = jiraServer + '/rest/greenhopper/1.0/rapidview';
     return makeOptions(jiraUrl);
}

/**
* Helper - constructs options object
*/
const makeOptions = (jiraUrl) => {
  let requestOptions = Object.assign({}, options);
  requestOptions.uri = jiraUrl;
  return requestOptions;
}
