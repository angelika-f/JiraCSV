var axios = require('axios');
require('dotenv').config();

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY

const baseUrl = 'https://' + domain + '.atlassian.net';

const auth = {
  username: username,
  password: password
};

async function getIssues() {

  const issues = [];
  let startAt = 0;
  const maxResults = 50;
  let total = 0;

  do {
    const config = {
      method: 'get',
      url: baseUrl + '/rest/api/3/search?jql=project%20%3D%20' + projectKey,
      headers: { 'Content-Type': 'application/json' },
      params: {
        startAt: startAt,
        maxResults: maxResults
      },
      auth: auth,
    };
    
    const response = await axios.request(config);
    issues.push(response.data.issues) // add issues from response to issues list
    total = response.data.total; // save total of issues from response added to list
    startAt += maxResults; // increment starting position by 50 (max result from API request)
    
  } while (startAt < total); // make requests while starting position is less than total results

    return issues.flat();
    
  } 


module.exports = getIssues;