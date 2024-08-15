const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY
const featureOwner = process.env.FEATURE_OWNER_ID
const featureOwnerEmail = process.env.FEATURE_OWNER_EMAIL

const auth = {
  username: username,
  password: password
};

const baseUrl = 'https://' + domain + '.atlassian.net';


async function createIssuesFromCsv(csvFile, epicDict) {
  
  let taskCounter = 0;

  const issuesDict = {}; // all task data retrieved from CSV rows

  try {
    const issueList = []; // all task data retrieved from CSV

    await new Promise((resolve, reject) => {

      // CSV Processing
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.issueType.toLowerCase() === 'task') { // Filters issues of type task only
            issueList.push(row);
          }
        })
        .on('end', async () => {
          console.log('CSV file successfully processed.');

          let totalItems = issueList.length;

          // Process each task sequentially
          for (const row of issueList) {
            try {
              const epicKey = epicDict[row.epicLinkSummary]?.[0];
              const requestBody = {
                method: 'post',
                url: `${baseUrl}/rest/api/3/issue`,
                headers: { 'Content-Type': 'application/json' },
                auth: auth,
                data: {
                  fields: {
                    project: { key: projectKey },
                    summary: row.summary,
                    customfield_10101: {
                      "accountId": featureOwner,
                      "emailAddress": featureOwnerEmail,
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
                    // Add Epic Link
                    customfield_10008: epicKey,
                  }
                }
              };

              const response = await axios(requestBody);

              if (response.status === 201) {
                issuesDict[row.summary] = response.data.key;
                taskCounter++;
                console.log('Task ', taskCounter, '/', totalItems, ' created successfully:', row.summary);

                // Apply version
                const issueKey = response.data.key;
                const versionRequestBody = {
                  method: 'put',
                  url: `${baseUrl}/rest/api/3/issue/${issueKey}`,
                  headers: { 'Content-Type': 'application/json' },
                  auth: auth,
                  data: {
                    fields: {
                      fixVersions: [{ name: row.fixVersion }]
                    }
                  }
                };

                const versionResponse = await axios(versionRequestBody);

                if (versionResponse.status === 204) {
                  console.log('Fix version applied to issue:', issueKey, row.summary);
                } else {
                  console.error('Failed to update fix version for issue:', issueKey, versionResponse.statusText);
                }

              } else {
                console.error('Failed to create task issue:', response.statusText);
              }
            } catch (error) {
              console.error('Error creating task issue:', error.message);
            }
          }

          resolve(issuesDict);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error);
        });
    });

  } catch (error) {
    console.log('Error:', error.message);
  }
}



module.exports = createIssuesFromCsv;