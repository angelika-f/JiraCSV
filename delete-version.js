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

  const versions = await getVersion(); // Ensure getVersion is defined and returns the list of versions

  try {
    // Check if there are no versions to delete
    if (versions.length === 0) {
      console.error("Error: There are no versions to delete.");
      return;
    }

    let versionCounter = 0;
    const totalVersions = versions.length;

    // Loop through each version and delete
    for (let version of versions) {
      const versionID = version.id;
      //console.log("Deleting Version", versionCounter + 1, "/", totalVersions, "with name:", version.name);

      try {
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

        // API Call to delete the version
        const response = await axios.request(config);

        if (response.status === 204) {
          versionCounter++;
          console.log('Version', versionCounter, '/', totalVersions, 'deleted successfully with name:', version.name);
        } else {
          console.error('Failed to delete Version with name:', version.name, response.statusText);
        }
      } catch (error) {
        console.error('Error deleting Version with ID:', versionID, error.message);
      }
    }

    console.log('COMPLETE: All versions deleted successfully.');

  } catch (error) {
    console.error('Error:', error.response?.data?.errors || error.message);
  }
}



module.exports = deleteVersion;