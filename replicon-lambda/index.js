'use strict';
const rp = require('request-promise');
const Replicon = require('./replicon.js');

exports.handler = function(event, context, callback) {
  // callback(null, event["params"]["header"]["projectIdentity"]);
  // check params for project names
  const noParamsError = "Please add a header parameter [projectName] or [projectIdentity]"
  if(!event["params"] || !event["params"]["header"]) {
    callback(noParamsError);
  }
  if(!event["params"]["header"]["projectName"] && !event["params"]["header"]["projectIdentity"]) {
    callback(noParamsError);
  }

  let options =
    event["params"]["header"]["projectName"]
        ? Replicon.getProjectByName(event["params"]["header"]["projectName"])
        : Replicon.getProjectById(event["params"]["header"]["projectIdentity"]);

  rp(options)
    .then((res) => {
      if(res.Value.length === 0) {
        callback("No project with that name or identity found");
      }
      const projectIdentity = res["Value"][0].Identity;
      const userIds = res["Value"][0]["Relationships"]["ProjTeamUsers"].map(
        (user) => {
          console.log(user);
          return user.Identity;
        });

      return userIds.map((userId) => {
        return timesheetsByUserProject(userId, projectIdentity);
      })
    })
    .then((res) => {
      Promise.all(res).then(values => {
        callback(null, values);
      })
    })
    .catch((error) => {
      callback(error);
    });

  const timesheetsByUserProject = (userIdentity, projectIdentity) => {
    return rp(Replicon.getTimesByUserIDsProjectIds(userIdentity, projectIdentity))
      .then((res) => {
        return res;
      })
      .catch((error) => {
         let message = "There was error getting timesheet by user";
         console.log(message);

        callback(error, message);
      });
  }
}
