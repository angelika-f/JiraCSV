require('dotenv').config();

// Environment Variables
const csvFile = process.env.CSV_TEMPLATE_PATH

// USER
const getUsers = require('./get-users.js');

// PROJECT
const getProjectID = require('./get-project-ID.js') // Retrieves project ID for specific project
const getProjects = require('./get-projects.js') // Retrieves all projects on workspace

// ISSUE
const createCSVIssues = require('./create-task-CSV.js') // Creates tasks from CSV
const deleteTasks = require('./delete-tasks.js') // Deletes tasks
const createEpic = require('./create-epic-CSV.js') // Creates epics
const deleteEpic = require('./delete-epic.js') // Deletes epics
const getIssues = require('./get-issues.js'); // Gets issues via specific JQL query

// COMPONENT
const createComponent = require('./create-components-CSV.js') // Creates components
const deleteComponents = require('./delete-components.js') // Deletes components

// VERSION
const createVersion = require('./create-version-CSV.js') // Creates project versions
const deleteVersion = require('./delete-version.js') // Deletes project versions
const getVersions = require('./get-versions.js'); // Gets project versions

let versionDict = {};
let epicDict = {};

// MISC
const getProjectIDFunc = async () => {
  await getProjectID();
}
const getIssueByIDFunc = async (issueKey) => {
  const issue = await getIssueByID(issueKey);
  console.log(issue)
}
const getUsersFunc = async () => {
  const users = await getUsers();
  console.log(JSON.stringify(users, null, 3))

  const chunkSize = 10; // Adjust the chunk size as needed
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    console.log(JSON.stringify(chunk, null, 2));
  }
}

// Important - the CSV columns need to be named as per your Jira configuration that includes required fields.
// Best way to find this info is to export a CSV of issues from Jira to determine the column headings.

// Order of operation:
// 1. Create components
// 2. Create versions
// 3. Create epics
// 4. Create tasks (parent to epics) (apply version)

// To delete all contents of the Jira board
async function clearBoard() {
  try {
    console.log("IN PROGRESS: Deleting components...");
    await deleteComponents();
  } catch (error) {
    console.error("Error deleting components:", error);
  }

  try {
    console.log("IN PROGRESS: Deleting versions...");
    await deleteVersion();
  } catch (error) {
    console.error("Error deleting version:", error);
  }

  try {
    console.log("IN PROGRESS: Deleting tasks...");
    await deleteTasks();
  } catch (error) {
    console.error("Error deleting tasks:", error);
  }

  try {
    console.log("IN PROGRESS: Deleting epics...");
    await deleteEpic();
  } catch (error) {
    console.error("Error deleting epic:", error);
  }

  console.log("Board cleared");
}

// To create a JIRA board based on CSV file
async function createBoard() {
  try {
    console.log("IN PROGRESS: Creating components...");
    await createComponent(csvFile);
  } catch (error) {
    console.error("Error creating component:", error);
  }

  try {
    console.log("IN PROGRESS: Creating versions...");
    versionDict = await createVersion(csvFile);
  } catch (error) {
    console.error("Error creating version:", error);
  }

  try {
    epicDict = {};
    console.log("IN PROGRESS: Creating epics...");
    epicDict = await createEpic(csvFile);
  } catch (error) {
    console.error("Error creating epic:", error);
  }

  try {
    issuesDict = {};
    console.log("IN PROGRESS: Creating tasks...");
    issuesDict = await createCSVIssues(csvFile, versionDict, epicDict);
  } catch (error) {
    console.error("Error creating tasks:", error);
  }

  console.log("Board creation completed.");
}


//createBoard();
clearBoard();


