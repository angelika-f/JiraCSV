

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY
const featureOwner = process.env.PROD_FEATURE_OWNER

const auth = {
  username: username,
  password: password
};

const baseUrl = 'https://' + domain + '.atlassian.net';

    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

//creates an issue in Jira Cloud using REST API 
async function createIssuesFromCsv(csvFile) {

  try {
    const issueList = [];
    
    // Read CSV file and iterate through each row
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        // Collect rows that meet criteria (e.g., issueType === 'task')
        if (row.issueType.toLowerCase() === 'task') {
          issueList.push(row);
          console.log(row.summary);
        }
      })
      .on('end', async () => {
        console.log('CSV file successfully processed.');

        // Process each row and create Jira issue sequentially
        for (const row of issueList) {
          try {
            const requestBody = {
              method: 'post',
              url: `${baseUrl}/rest/api/3/issue`,
              headers: {
                'Content-Type': 'application/json'
              },
              auth: auth,
              data: {
                fields: {
                  project: { key: projectKey },
                  summary: row.summary,
                  customfield_10101: {
                    "accountId": "61afe51febce470067dbd482",
                    "emailAddress": "angelika.filuba@unit9.com",
                    }, 
                  issuetype: { name: row.issueType },
                  priority: { name: row.priority },
                  // fixVersions: [{ name: row.fixVersion }], // Uncomment if fixVersions is configured correctly
                  components: [{ name: row.components }],
                  description: {
                    type: 'doc',
                    version: 1,
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: row.description
                          }
                        ]
                      }
                    ]
                  },
                  timetracking: {
                    originalEstimate: row.originalEstimate,
                    remainingEstimate: row.remainingEstimate
                  },
                 
                }
              }
            };

            console.log(`Creating task issue for: ${row.summary}`);
            const response = await axios(requestBody);

            if (response.status === 201) {
              console.log('Task issue created successfully:', response.data);
            } else {
              console.error('Failed to create task issue:', response.statusText);
            }
          } catch (error) {
            console.error('Error creating task issue:', error.message);
          }
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error.message);
      });

  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}


module.exports = createIssuesFromCsv;