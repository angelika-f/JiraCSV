var axios = require('axios');
require('dotenv').config();

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECTKEY

const jqlQuery = projectKey;

const auth = {
  username: username,
  password: password
};

//Gets all issues in a particular project using the Jira Cloud REST API
async function getIssues() {

  const bodyData = {
    "expand": [
      "names",
      "schema",
      "operations"
    ],
    "fields": [
      "summary",
      "status",
      "assignee",
      
    ],
    "fieldsByKeys": false,
    "jql": projectKey,
    "maxResults": 15,
    "startAt": 0
      };

  try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    const config = {
      method: 'get',
      url: baseUrl + '/rest/api/3/search?jql=project%20%3D%20ANTE', 
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
      //body : bodyData
    };
    
    const response = await axios.request(config);
    const issues = response.data.issues
    const issuesDict = response.data.issues.map(issue => {
      return {
      summary: issue.fields.summary,
      issueType: issue.fields.issuetype.name
      }
    }); // Extract issue keys
    console.log(issuesDict)
    return issues;
    //return response.data.json();
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}

module.exports = getIssues;