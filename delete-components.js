var axios = require('axios');
require('dotenv').config();

async function deleteComponents() {

  const username = process.env.ATLASSIAN_USERNAME;
  const password = process.env.ATLASSIAN_API_KEY;
  const domain = process.env.DOMAIN;

  const auth = {
    username: username,
    password: password
  };

  try {
    const baseUrl = 'https://' + domain + '.atlassian.net';
    const requestBody = {
      method: 'get',
      url: baseUrl + '/rest/api/3/project/ANTE/component',
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    };

    // API Call to fetch all components
    const response = await axios.request(requestBody);
    const allComponents = response.data.values;

    // Check if there are no components to delete
    if (allComponents.length === 0) {
      console.error("Error: There are no components to delete.");
      return;
    }

    let componentsCounter = 0;
    const totalComponents = allComponents.length;

    // Loop through each component and delete
    for (let i = 0; i < allComponents.length; i++) {
      const componentKey = allComponents[i].id;

      try {
        const deleteRequestBody = {
          method: 'DELETE',
          url: baseUrl + '/rest/api/3/component/' + componentKey,
          headers: { 'Content-Type': 'application/json' },
          auth: auth,
        };

        // API Call to delete the component
        const deleteResponse = await axios.request(deleteRequestBody);

        if (deleteResponse.status === 204) {
          componentsCounter++;
          console.log('Component ', componentsCounter, '/', totalComponents, ' deleted successfully with ID:', componentKey);
        } else {
          console.error('Failed to delete component with ID:', componentKey, deleteResponse.statusText);
        }
      } catch (error) {
        console.error('Error deleting component with ID:', componentKey, error.message);
      }
    }

    console.log('COMPLETE: All components deleted successfully.');

  } catch (error) {
    console.error('Error:', error.response?.data?.errors || error.message);
  }
}


module.exports = deleteComponents;