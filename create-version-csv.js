const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');
const getProjectID = require('./get-project-ID');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const baseUrl = 'https://' + domain + '.atlassian.net';

const auth = {
  username: username,
  password: password
};

let versionDict = {};

async function createVersion(csvFile) {

  const projectID = await getProjectID();

  try {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      auth: auth
    };

    let versionList = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          // Save to dict
          if (row.fixVersion.trim() !== '') {
            versionList.push(row.fixVersion.trim());
          }
        })
        .on('end', async () => {
          console.log('CSV file successfully processed.');

          // Remove duplicates from the list
          let uniqueList = [];
          let valueSet = new Set();

          for (let value of versionList) {
            if (!valueSet.has(value)) {
              valueSet.add(value);
              uniqueList.push(value);
            }
          }

          console.log('Unique Version List:', uniqueList);

          // Make API requests to create new versions
          for (let version of uniqueList) {
            try {
              const requestBody = {
                method: 'post',
                url: `${baseUrl}/rest/api/3/version`,
                headers: {
                  'Content-Type': 'application/json'
                },
                auth: auth,
                data: {
                  "archived": false,
                  "description": "Update based on scope.",
                  "name": version,
                  "projectId": projectID,
                  "released": false
                }
              };

              console.log(`Creating version for: ${version}`);
              const response = await axios(requestBody);

              if (response.status === 201) {
                versionDict[response.data.name] = response.data.id;
                console.log('Version', response.data.name, 'created successfully.');

              } else {
                console.error('Failed to create version:', response.statusText);
              }

            } catch (error) {
              console.error('Error creating version:', error.message);
            }
          }

          resolve(versionDict);

        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error); // Reject the promise if there's an error reading the CSV file
        });
    });

  } catch (error) {
    console.log('error: ');
    console.log(error.response?.data?.errors || error.message);
    throw error; // Rethrow the error to be caught by the caller
  }
}

module.exports = createVersion;