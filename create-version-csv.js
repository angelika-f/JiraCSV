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

async function createVersion(csvFile) {

  const projectID = await getProjectID();
  let versionsCounter = 0;
  let versionDict = {}; // {version name = version ID}

  return new Promise((resolve, reject) => {

    try {

      let versionList = []; // All version data retrieved from CSV rows

      // CSV Processing
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.fixVersion.trim() !== '') { // If row is not empty, add to version list
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

          let totalItems = uniqueList.length; // Get total number of items in version list

          for (let version of uniqueList) { // Make API call per version in version list
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

              const response = await axios(requestBody);

              if (response.status === 201) {
                versionDict[response.data.name] = response.data.id;
                versionsCounter++;
                console.log('Version ', versionsCounter, '/', totalItems, ' created successfully:', response.data.name);
              } else {
                console.error('Failed to create version:', response.statusText);
              }

            } catch (error) {
              console.error('Error creating version:', error.message);
            }
          }

          resolve(versionDict); // Resolve the promise with the versionDict after all versions are created

        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error.message);
          reject(error); // Reject the promise if there's an error reading the CSV file
        });

    } catch (error) {
      console.log('error: ');
      console.log(error.response?.data?.errors || error.message);
      reject(error); // Reject the promise if there's an error in the try block
    }
  });
}


module.exports = createVersion;