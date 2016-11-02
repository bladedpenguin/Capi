'use strict';
/***
 * options to make request to Catalyst Replicon
 **/
const options = {
  method: 'POST',
  url: 'https://na1.replicon.com/a/RemoteApi/RemoteApi.ashx/8.29.23/test',
  headers: {
    contentType: 'application/json',
    authorization: 'Basic Q2F0YWx5c3RJVFxjYXBpOiFDYXRhbHlzdCFjYXBpIUNhdGFseXN0IQ=='
  },
  body: {},
  json: true
};
/**
 *
 */
exports.getProjectByName = (projectName) => {
  if (!projectName) {
    return {
      Error: "Error: ProjectName of type String not probided"
    };
  }

  let requestOptions = {};
  Object.assign(requestOptions, options);

  requestOptions.body = [{
    Action: 'Query',
    QueryType: 'ProjectByName',
    DomainType: 'Replicon.Project.Domain.Project',
    Args: [projectName],
    Load: [{
      Relationship: 'ProjTeamUsers',
      IdentityOnly: true
    }, {
      Relationship: 'ProjUserRateTypes',
      Load: [{
        Relationship: 'TaskRate',
        Load: [{
          Relationship: 'Entries',
          Load: [{
            Relationship: 'Currency',
            IdentityOnly: true
          }]
        }]
      }, {
        Relationship: 'TaskRateType'
      }, {
        Relationship: 'Role',
        IdentityOnly: true
      }, {
        Relationship: 'User'
      }]
    }]
  }];



  return requestOptions;

}

exports.getProjectById = (projectIdentity) => {
  if (!projectIdentity) {
    return {
      Error: "Error: ProjectId of type Integer must be provided"
    }
  }
  let requestOptions = {};
  Object.assign(requestOptions, options);

  requestOptions.body = [{
    Action: 'Query',
    QueryType: 'ProjectByIds',
    DomainType: 'Replicon.Project.Domain.Project',
    Args: [[parseInt(projectIdentity)]],
    Load: [{
      Relationship: 'ProjTeamUsers',
      IdentityOnly: false
    }, {
      Relationship: 'ProjUserRateTypes',
      Load: [{
        Relationship: 'TaskRate',
        Load: [{
          Relationship: 'Entries',
          Load: [{
            Relationship: 'Currency',
            IdentityOnly: true
          }]
        }]
      }, {
        Relationship: 'TaskRateType'
      }, {
        Relationship: 'Role',
        IdentityOnly: true
      }, {
        Relationship: 'User'
      }]
    }]
  }];


  // request.body = [{
  //   "Action": "Query",
  //   "QueryType": "ProjectByIds",
  //   "DomainType": "Replicon.Project.Domain.Project",
  //   "Args": [
  //     [
  //       projectId
  //     ]
  //   ]
  // }];

  return requestOptions;

}

/**
 * Gets timesheets by user ids
 * takes userid and project identity (string)
 */
exports.getTimesByUserIDsProjectIds = (userId, projectIdentity) => {
  if (!userId || !projectIdentity) {
    return {
      Error: "Error: UserId and projectIdentity were not provided"
    };
  }

  let requestOptions = {};
  Object.assign(requestOptions, options);

  let query = [{
    "Action": "Query",
    "QueryType": "TimesheetByArguments",
    "DomainType": "Replicon.TimeSheet.Domain.Timesheet",
    "Args": [{
        "__type": "Replicon.Domain.User",
        "Identity": userId
      },
      null,
      null,
      null,
      null,
      true,
      null, {
        "__type": "Replicon.Project.Domain.Project",
        "Identity": projectIdentity
      },
      null, [],
      [],
      []
    ]
  }];

  requestOptions.body = query;

  return requestOptions;

}
