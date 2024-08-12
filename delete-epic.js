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
async function deleteEpic() {

  const issues = await getIssues();

  try {
    // Check if there are no epics to delete
    const epicIssues = issues.filter(issue => issue.fields.issuetype.name === "Epic");
    if (epicIssues.length === 0) {
      console.error("Error: There are no epics to delete.");
      return;
    }

    let epicCounter = 0;
    const totalEpics = epicIssues.length;

    // Loop through each epic and delete
    for (let issue of epicIssues) {
      const epicID = issue.id;

      try {
        const baseUrl = 'https://' + domain + '.atlassian.net';

        const config = {
          method: 'delete',
          url: baseUrl + '/rest/api/3/issue/' + epicID,
          headers: { 'Content-Type': 'application/json' },
          auth: auth
        };

        // API Call to delete the epic
        const response = await axios.request(config);

        if (response.status == 204) {
          epicCounter++;
          console.log('Epic ', epicCounter, '/', totalEpics, ' deleted successfully with ID:', epicID);
        } else {
          console.error('Failed to delete Epic with ID:', epicID, response.statusText);
        }
      } catch (error) {
        console.error('Error deleting Epic with ID:', epicID, error.message);
      }
    }

    console.log('COMPLETE: All epics deleted successfully.');

  } catch (error) {
    console.error('Error:', error.response?.data?.errors || error.message);
  }
}



module.exports = deleteEpic;