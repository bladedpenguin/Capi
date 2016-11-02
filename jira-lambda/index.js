'use strict';

const Jira = require('./jira');
const rp = require('request-promise');

exports.handler = (event, context, callback) => {

  // check for params needed for Jira query
  const noParamsError =
    "Please add header parameters [projectKey]  and [queryType] of 'defectRate', 'burndownChart'";
  if (!event["params"] || !event["params"]["header"]) {
    callback(noParamsError);
  }
  if (!event["params"]["header"]["projectKey"] || !event["params"]["header"][
      "queryType"
    ]) {
    callback(noParamsError);
  }

  const projectKey = event["params"]["header"]["projectKey"];
  const queryType = event["params"]["header"]["queryType"];

  switch (queryType) {
    case 'defectRate':
      rp(Jira.jiraDefectRate(projectKey)).then(res => {
        callback(null, JSON.parse(res));
      }).catch(error => {
        callback(error, 'Problem getting info from Jira')
      });
      break;

    case 'burndownChart':
      let sprint = '';
      rp(Jira.jiraSprints(projectKey)).then(res => {
          // get info on the last sprint
          const allSprints = JSON.parse(res).sprints;
          if (allSprints.length === 0) {
            callback(projectKey +
              ' either does not have active sprints or is not a valid project'
            );
          }
          sprint = allSprints[allSprints.length - 1]; // choose the last sprint
          return rp(Jira.jiraRapidViews());//get rapidViews
        })
        .then(res => {
          //go through rapidviews and check if it contains current project
          const rapidView = JSON.parse(res).views.filter(rv => {
            return rv.name.split(' ')[0] === sprint.projects[0].key;
          });

          if (rapidView && rapidView[0].sprintSupportEnabled) {
            //ajax for sprint issues
            return rp(Jira.jiraBurndownChart(rapidView[0].id, sprint.id))
          } else {
            // no sprint or kanban
            callback('Cannot get data for burndown chart. ' + sprint.projects[
              0].key + ' does not have any sprints. Is it Kanban?')
          }
        }).then(res => {
          //sent sprint json
          callback(null, JSON.parse(res))
        })
        .catch(error => {
          callback(error, 'Problem getting info from Jira')
        });
      break;

    default:
      callback('Could not satisfy your request. Check your parameters.')
  }
}
