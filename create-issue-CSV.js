const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY
const featureOwner = process.env.FEATURE_OWNER

const auth = {
  username: username,
  password: password
};

const baseUrl = 'https://' + domain + '.atlassian.net';

let issuesDict = {}

    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

//creates an issue in Jira Cloud using REST API 
async function createIssuesFromCsv(csvFile, versionDict, epicDict) {
  try {
    const issueList = [];
    const issuesDict = {};

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          // Collect rows that meet criteria (e.g., issueType === 'task')
          if (row.issueType.toLowerCase() === 'task') {
            issueList.push(row);
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
                      "accountId": featureOwner,
                      "emailAddress": "angelika.filuba@unit9.com",
                    },
                    issuetype: { name: row.issueType },
                    priority: { name: row.priority },
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
                    // Add Epic Link and Fix Versions if available
                    customfield_10008: epicDict[row.epicLinkSummary][0],
                  }
                }
              };

              
              const response = await axios(requestBody);

              if (response.status === 201) {
                console.log(`Creating task issue for: ${row.summary}`);
                // Add to issuesDict
                issuesDict[row.summary] = response.data.key;

                // Now update the issue with fixVersions
                const issueKey = response.data.key;
                const versionRequestBody = {
                  method: 'put',
                  url: `${baseUrl}/rest/api/3/issue/${issueKey}`,
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  auth: auth,
                  data: {
                    fields: {
                      fixVersions: [{ name: row.fixVersion }]
                    }
                  }
                };

                const versionResponse = await axios(versionRequestBody);

                if (versionResponse.status === 204) {
                  console.log(`Fix version applied to issue: ${issueKey}`);
                } else {
                  console.error(`Failed to update fix version for issue: ${issueKey}`, versionResponse.statusText);
                }


              } else {
                console.error('Failed to create task issue:', response.statusText);
              }
            } catch (error) {
              console.error('Error creating task issue:', error.message);
            }
          }
          // Resolve the promise with issuesDict
          resolve(issuesDict);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error);
        });
    });
  } catch (error) {
    console.log('Error:', error.response?.data?.errors || error.message);
  }
}


module.exports = createIssuesFromCsv;