const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY

const baseUrl = 'https://' + domain + '.atlassian.net';

const auth = {
  username: username,
  password: password
};

async function createComponent(csvFile){

  console.log("IN PROGRESS: Creating components...")

  try {

    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

    // body of data taken from CSV
    let dict = {};

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    dict[row.components] = {
      "project": projectKey,
      "name": row.components,
      "description": "Update based on project scope.",
      "assigneeType": "COMPONENT_LEAD",
      "isAssigneeTypeValid": false,
      "leadAccountId": "61afe51febce470067dbd482"
    };
  })
  .on('end', async () => {
    console.log('CSV file successfully processed.');

    // Remove duplicates
    let uniqueDict = {};
    let valueSet = new Set();

    for (let key in dict) {
      let value = JSON.stringify(dict[key]);
      if (!valueSet.has(value)) {
        valueSet.add(value);
        uniqueDict[key] = dict[key];
      }
    }

    // Make API requests
    for (let key in uniqueDict) {
      try {
        
        const requestBody = {
          method: 'post',
          url: baseUrl + '/rest/api/3/component', // would be using variable
          headers: { 'Content-Type': 'application/json' },
          auth: auth,
          data: uniqueDict[key]
        };
        
        // API CALL 
        const response = await axios.request(requestBody)

        if (response.status === 201) {
          console.log('Component created successfully:', response.data.name);
        } else {
          console.error('Failed to create component:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating component:', error.message);
      }
    }
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error.message);
  });


  } catch (error) {
    console.log('error: ')
    console.log('Error:', error);
    console.log(error.response.data.errors)
  }
}

module.exports = createComponent;