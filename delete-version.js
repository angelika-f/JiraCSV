var axios = require('axios');
require('dotenv').config();
const getVersion = require('./get-versions');


const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const auth = {
  username: username,
  password: password
};


//Gets all issues in a particular project using the Jira Cloud REST API
async function deleteVersion() {

const versions = await getVersion(); // need func 

  try {

    for (let version of versions) {

            const versionID = version.id
            console.log("Deleting Version of name",version.name)

            const baseUrl = 'https://' + domain + '.atlassian.net';

            const bodyData = {
                "customFieldReplacementList": [
                  {
                    "customFieldId": null,
                    "moveTo": null
                  }
                ],
                "moveAffectedIssuesTo": null,
                "moveFixIssuesTo": null
              };

            const config = {
                method: 'delete',
                url: `${baseUrl}/rest/api/3/version/${versionID}`,
                headers: { 'Content-Type': 'application/json' },
                auth: auth,
                data: bodyData
            };

            const response = await axios.request(config);
            console.log(response.data)
            console.log('Version',version.name,'deleted.')
    }

    
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}


module.exports = deleteVersion;