const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY

const auth = {
  username: username,
  password: password
};

let epicDict = {}; // epic name, epic key] (for parenting issues later on)

//creates an issue in Jira Cloud using REST API 
async function createEpic(csvFile) {

  console.log("IN PROGRESS: Creating epics...");

  try {
    const baseUrl = 'https://' + domain + '.atlassian.net';
    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

    let epicList = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          // Save to dict
          if (row.epicLinkSummary.trim() !== '') {
            epicList.push(row.epicLinkSummary.trim());
          }
        })
        .on('end', async () => {
          console.log('CSV file successfully processed.');

          // Remove duplicates from the list
          let uniqueEpicList = [];
          let valueSet = new Set();

          for (let value of epicList) {
            if (!valueSet.has(value)) {
              valueSet.add(value);
              uniqueEpicList.push(value);
            }
          }

          console.log('Unique Epic List:', uniqueEpicList);

          // Make API requests to create epic tickets
          for (let epic of uniqueEpicList) {
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
                    project: {
                      key: projectKey 
                    },
                    summary: epic,
                    description: {
                      type: "doc",
                      version: 1,
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Update based on project scope."
                            }
                          ]
                        }
                      ]
                    },
                    issuetype: {
                      name: 'Epic'
                    }
                  }
                }
              };

              const response = await axios(requestBody);

              if (response.status === 201) {
                epicDict[epic] = [response.data.key, response.data.id];
              } else {
                console.error('Failed to create epic ticket:', response.statusText);
              }

            } catch (error) {
              console.error('Error creating epic ticket:', error.message);
            }
          }

          resolve(epicDict);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error);
        });
    });

  } catch (error) {
    console.log('error: ');
    console.log(error.response.data.errors);
  }
}


module.exports = createEpic;