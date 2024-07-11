const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const auth = {
  username: username,
  password: password
};

// Function to read CSV file and create Jira issues
async function createIssuesFromCsv(csvFile) {
    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', async (row) => {
            // Assuming your CSV has columns like 'summary', 'description', 'projectKey', etc.
            const issueData = {
                fields: {
                    project: { "key": "MEBL" },
                    summary: row.summary,
                    issuetype: { name: row.issueType },
                    priority: { name: row.priority },
                    fixVersions: [{ name: row.fixVersion }],
                    components: [{ name: row.component }],
                    description: row.description,
                    timetracking: {
                        originalEstimate: row.originalEstimate,
                        remainingEstimate: row.remainingEstimate
                    },
                    //customfield_10102: row.epicLinkSummary, // Replace with the correct custom field ID for Epic Link
                    customfield_10101: row.featureOwner // Replace with the correct custom field ID for Feature Owner
                }
            };
            await createIssue(issueData, auth);
        })
        .on('end', () => {
            console.log('CSV file successfully processed.');
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error.message);
        });
}

//creates an issue in Jira Cloud using REST API 
async function createCSVIssues(projectKey, issueType, summary, description) {

  try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    const data = {
      fields: {
        project: { key: projectKey },
        summary: summary,
        description: description,
        issuetype: { name: issueType }
      }
    };
    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };
    const response = await axios.post(`${baseUrl}/rest/api/2/issue`, data, config);
    return response.data.key;

  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}

module.exports = createIssuesFromCsv;