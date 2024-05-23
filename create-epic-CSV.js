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

//creates an issue in Jira Cloud using REST API 
async function createEpic(csvFile) {

  try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

    let epicList = [];
    let project = "ANTE"; // Global variable for project

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
      let uniqueList = [];
      let valueSet = new Set();

      for (let value of epicList) {
        if (!valueSet.has(value)) {
          valueSet.add(value);
          uniqueList.push(value);
        }
      }

      console.log('Unique Epic List:', uniqueList);

      // Make API requests to create epic tickets
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
              project: {
                key: 'ANTE' 
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
              //customfield_10101: "61afe51febce470067dbd482",
              issuetype: {
                name: 'Epic'
              }
            }
          }
        };

        console.log(`Creating epic ticket for: ${epic}`);
        const response = await axios(requestBody);

        if (response.status === 201) {
          console.log('Epic ticket created successfully:', response.data);
        } else {
          console.error('Failed to create epic ticket:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating epic ticket:', error.message);
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


module.exports = createEpic;