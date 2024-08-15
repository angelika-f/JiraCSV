const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY
const featureOwner = process.env.FEATURE_OWNER_ID

const baseUrl = 'https://' + domain + '.atlassian.net';

const auth = {
    username: username,
    password: password
};

async function createComponent(csvFile) {
    let componentsCounter = 0;

    return new Promise((resolve, reject) => {
        try {

            let dict = {}; // All component data retrieved from CSV rows

            // CSV Processing
            fs.createReadStream(csvFile)
                .pipe(csv())
                .on('data', (row) => {
                    dict[row.components] = {
                        "project": projectKey,
                        "name": row.components,
                        "description": "Update based on project scope.",
                        "assigneeType": "COMPONENT_LEAD",
                        "isAssigneeTypeValid": false,
                        "leadAccountId": featureOwner
                    };
                })
                .on('end', async () => {
                    console.log('CSV file successfully processed.');

                    // Remove duplicates from dict
                    let uniqueDict = {};
                    let valueSet = new Set();

                    for (let key in dict) {
                        let value = JSON.stringify(dict[key]);
                        if (!valueSet.has(value)) {
                            valueSet.add(value);
                            uniqueDict[key] = dict[key];
                        }
                    }

                    // Get total number of keys in components dict 
                    let totalKeys = Object.keys(uniqueDict).length;

                    // Process each component sequentially
                    for (let key in uniqueDict) {
                        try {
                            // Prepare request body for API Call
                            const requestBody = {
                                method: 'post',
                                url: baseUrl + '/rest/api/3/component',
                                headers: { 'Content-Type': 'application/json' },
                                auth: auth,
                                data: uniqueDict[key]
                            };

                            // API Call
                            const response = await axios.request(requestBody);

                            // API Response
                            if (response.status === 201) {
                                componentsCounter++;
                                console.log('Component ', componentsCounter, '/', totalKeys, ' created successfully:', response.data.name);
                            } else {
                                console.error('Failed to create component:', response.statusText);
                            }
                        } catch (error) {
                            console.error('Error creating component:', error.message);
                        }
                    }

                    // Resolve the promise after all components are created
                    resolve();
                })
                .on('error', (error) => {
                    console.error('Error reading CSV file:', error.message);
                    reject(error); // Reject the promise if an error occurs
                });

        } catch (error) {
            console.error('Error:', error);
            reject(error); // Reject the promise if an error occurs in the try block
        }
    });
}


module.exports = createComponent;