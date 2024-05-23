var axios = require('axios');
const getIssues = require('./get-issues');
require('dotenv').config();

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN




const issueKEY = 'WBTE-254';





const auth = {
  username: username,
  password: password
};

//Gets all issues in a particular project using the Jira Cloud REST API
async function deleteIssueByID(issueKey) {

  try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    const config = {
      method: 'delete',
      url: baseUrl + '/rest/api/2/issue/' + issueKey,
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };
    const response = await axios.request(config);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}


// (async () => {
//   try {
//     const issueKeys = await getIssues();
//     console.log(issueKeys);

//     for (let i = 0; i < issueKeys.length; i++) {
//     const issueKey = issueKeys[i];
//     await deleteIssueByID(issueKey)
//      console.log(issueKey,"deleted.")
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// })();

module.exports = deleteIssueByID;