var axios = require('axios');
require('dotenv').config();

async function deleteComponents(){

const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const auth = {
  username: username,
  password: password
};



try {

    const baseUrl = 'https://' + domain + '.atlassian.net';

    const requestBody = {
      method: 'get',
      url: baseUrl + '/rest/api/3/project/ANTE/component', // would be using variable
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
      //body : bodyData
    };
    
    // API CALL 
    const response = await axios.request(requestBody)
    const allComponents = response.data.values
    
    for (let i = 0; i < allComponents.length; i++) {
        const componentKey = allComponents[i].id;

        // delete goes here 

            const baseUrl = 'https://' + domain + '.atlassian.net';

            const requestBody = {
            method: 'DELETE',
            url: baseUrl + '/rest/api/3/component/'+componentKey,
            headers: { 'Content-Type': 'application/json' },
            auth: auth,
            };
            
            // API CALL 
            const response = await axios.request(requestBody)
            console.log("Component with ID", componentKey, "deleted.")
        }
    
    return response
    
    //const issues = response.data.issues.map(issue => issue.key); // Extract issue keys
    //return issues;
    
    //return response.data.json();
  } catch (error) {
    console.log('error: ')
    console.log(error.response.data.errors)
  }

}

  module.exports = deleteComponents;