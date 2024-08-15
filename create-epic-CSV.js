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

const baseUrl = 'https://' + domain + '.atlassian.net';

async function createEpic(csvFile) {
  let epicCounter = 0;
  let epicDict = {};

  try {
    let epicList = []; // all epic data retrieved from CSV rows

    await new Promise((resolve, reject) => {
      // CSV processing
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.epicLinkSummary.trim() !== '') {
            epicList.push(row.epicLinkSummary.trim());
          }
        })
        .on('end', async () => {
          console.log('CSV file successfully processed.');

          let uniqueList = [...new Set(epicList)]; // Remove duplicates

          let totalItems = uniqueList.length; // Get total number of items

          // Process each epic sequentially
          for (let epic of uniqueList) {
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
                    issuetype: { name: 'Epic' }
                  }
                }
              };

              const response = await axios(requestBody);

              if (response.status === 201) {
                epicDict[epic] = [response.data.key, response.data.id];
                epicCounter++;
                console.log('Epic ', epicCounter, '/', totalItems, ' created successfully:', epic);
              } else {
                console.error('Failed to create epic ticket:', response.statusText);
              }
            } catch (error) {
              console.error('Error creating epic ticket:', error.message);
            }
          }

          resolve(epicDict); // Resolve the promise with epicDict
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error); // Reject the promise if there's an error reading the CSV file
        });
    });

  } catch (error) {
    console.log('error: ', error.message);
  }
}



module.exports = createEpic;