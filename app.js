require('dotenv').config();

// Environment Variables
const csvFile = process.env.CSV_TEMPLATE_PATH

// USER
const getUsers = require('./get-users.js');

// PROJECT
const getProjectID = require('./get-project-ID.js') // Retrieves project ID for specific project
const getProjects = require('./get-projects.js') // Retrieves all projects on workspace

// ISSUE
const createCSVIssues = require('./create-issue-CSV.js') // Creates tasks from CSV
const deleteTasks = require('./delete-tasks.js') // Deletes tasks
const createEpic = require('./create-epic-CSV.js')
const deleteEpic = require('./delete-epic.js')
const getIssueByID = require('./get-issue-by-id.js');
const getIssues = require('./get-issues.js');

// COMPONENT
const createComponent = require('./create-components-CSV.js')
const deleteComponents = require('./delete-components.js')

// VERSION
const createVersion = require('./create-version-csv.js')
const deleteVersion = require('./delete-version.js')
const getVersions = require('./get-versions.js');

let versionDict = {};
let epicDict = {};
let issuesDict = {};

// Order of operation:
// 1. Create components
// 2. Create versions
// 3. Create epics
// 4. Create tasks (parent to epics) (apply version)
// 5. Create sub-tasks (parent to tasks) (apply version)


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


createBoard();
//clearBoard();


