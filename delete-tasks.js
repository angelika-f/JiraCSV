var axios = require('axios');
require('dotenv').config();
const getIssues = require('./get-issues');


const username = process.env.ATLASSIAN_USERNAME
const password = process.env.ATLASSIAN_API_KEY
const domain = process.env.DOMAIN

const auth = {
  username: username,
  password: password
};

async function deleteTasks() {

  const issues = await getIssues();

  try {
    
    // Filter tasks from the issues
    const taskIssues = issues.filter(issue => issue.fields.issuetype.name === "Task");

    // Check if there are no tasks to delete
    if (taskIssues.length === 0) {
      console.error("Error: There are no tasks to delete.");
      return;
    }

    let taskCounter = 0;
    const totalTasks = taskIssues.length;

    // Loop through each task and delete
    for (let task of taskIssues) {
      const taskID = task.id;
      try {
        const baseUrl = 'https://' + domain + '.atlassian.net';

        const config = {
          method: 'delete',
          url: baseUrl + '/rest/api/3/issue/' + taskID,
          headers: { 'Content-Type': 'application/json' },
          auth: auth
        };

        // API Call to delete the task
        const response = await axios.request(config);

        if (response.status === 204) {
          taskCounter++;
          console.log('Task', taskCounter, '/', totalTasks, 'deleted successfully with name:', task.fields.summary);
        } else {
          console.error('Failed to delete Task with name:', task.fields.summary, response.statusText);
        }
      } catch (error) {
        console.error('Error deleting Task with ID:', taskID, error.message);
      }
    }

    console.log('COMPLETE: All tasks deleted successfully.');

  } catch (error) {
    console.error('Error:', error.response?.data?.errors || error.message);
  }
}



module.exports = deleteTasks;