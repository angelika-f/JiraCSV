var axios = require('axios');
require('dotenv').config();

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECTKEY

const baseUrl = 'https://' + domain + '.atlassian.net';
const jqlQuery = projectKey;

const auth = {
  username: username,
  password: password
};

//Gets all issues in a particular project using the Jira Cloud REST API
async function getIssues() {

  const issues = [];
  let startAt = 0;
  const maxResults = 50;
  let total = 0;

  do {
    const config = {
      method: 'get',
      url: baseUrl + '/rest/api/3/search?jql=project%20%3D%20ANTE',
      headers: { 'Content-Type': 'application/json' },
      params: {
        startAt: startAt,
        maxResults: maxResults
      },
      auth: auth,
      //body : bodyData
    };
    
    const response = await axios.request(config); // API request
    issues.push(response.data.issues) // add issues from response to issues list
    total = response.data.total; // save total of issues from response added to list
    startAt += maxResults; // increment starting position by 50 (max result from API request)

    // const issuesDict = response.data.issues.map(issue => {
    //   return {
    //   summary: issue.fields.summary,
    //   issueType: issue.fields.issuetype.name
    //   }
    // });
    
  } while (startAt < total); // make requests while starting position is less than total results

    return issues.flat();
    
  } 


module.exports = getIssues;