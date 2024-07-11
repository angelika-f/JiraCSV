var axios = require('axios');
require('dotenv').config();

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN
const projectKey = process.env.PROJECT_KEY

const auth = {
  username: username,
  password: password
};

//Gets all issues in a particular project using the Jira Cloud REST API
async function getVersions() {

  try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    console.log(projectKey)

    const config = {
      method: 'get',
      url: `${baseUrl}/rest/api/3/project/${projectKey}/versions`,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    };
    
    const response = await axios.request(config);
    const versions = response.data;
    console.log(versions);
    return versions;
    
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }
}

module.exports = getVersions;