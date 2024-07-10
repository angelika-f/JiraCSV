var axios = require('axios');
require('dotenv').config();
const getIssues = require('./get-issues');


const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const auth = {
  username: username,
  password: password
};



//Gets all issues in a particular project using the Jira Cloud REST API
async function deleteTasks() {

const issues = await getIssues();

  try {

    for (let issue of issues) {
        if (issue.fields.issuetype.name == "Task"){
            const taskID = issue.id
            console.log("Deleting Task of name",issue.fields.summary)

            const baseUrl = 'https://' + domain + '.atlassian.net';

            const config = {
                method: 'delete',
                url: baseUrl + '/rest/api/3/issue/' + taskID,
                headers: { 'Content-Type': 'application/json' },
                auth: auth
            };

            const response = await axios.request(config);


        } 
    }

    
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}


module.exports = deleteTasks;