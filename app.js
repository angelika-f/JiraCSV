require('dotenv').config();

// Environment Variables
const csvFile = process.env.CSV_TEMPLATE_PATH

// PROJECT
const getProjectID = require('./get-project-ID.js')
const getProjects = require('./get-projects.js')

// ISSUE
const createIssue = require('./create-issue.js');
const createCSVIssues = require('./create-issue-CSV.js')
const deleteTasks = require('./delete-tasks.js')
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

// ?
const getUsers = require('./get-users.js');
const updateStatus = require('./update-status.js');
const getTransitions = require('./get-transitions.js');


// Order of operation:
// 1. Create components
// 2. Create versions
// 3. Create epics
// 4. Create tasks (parent to epics) (apply version)
// 5. Create sub-tasks (parent to tasks) (apply version)



const getProjectIDFunc= async () => {
  await getProjectID();
}


const createCSVIssueFunc = async () => {
  const csvFile = '/Users/angelikafiluba/Downloads/Mobile CSV Test.csv';

  const issueCSV = await createCSVIssues(csvFile);
  console.log(issueCSV)
}

const createProjectIssueAndUpdate = async () => {

  // const projectName = process.env.PROJECT_NAME
  // const projectKey = await createProject(projectName);
  // console.log(`Created project with key: ${projectKey}`);

  // // // When creating an issue, we need the following parameters, issueType, summary, and description. 
  // // // Read more about this on the JIRA Cloud REST API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post
  const issueType = 'Task';
  const summary = 'Subscribe to Horeas YouTube Channel!';
  const description = 'Do so now!!'

  // Note that we are using the project key which will be auto created in the above function call

  const issueKey = await createIssue('FIGMA2', issueType, summary, description);
  console.log(`Created issue with key: ${issueKey}`);

  // Notes about statusID: statusID corresponds to " 11 == "To Do", 21=="In Progress", 31=="In Review", 41=="Done"
  // for more info on statusID use the `get-transtions.js` file to see all available transitions
  // since we are hard coding `21` below this means we will update the issue to In Progress
  const statusID = '21'

  // Add issueKey you want to update. This will be the key which we autogenerated from the issue above.
  const update = await updateStatus(issueKey, statusID);
  console.log(update)
}

//This will output the most recent projects
const getRecentProjects = async () => {
  const recentProjects = await getProjects();
  console.log(recentProjects)
}

//This will list all issues for a project
const getIssuesFunc = async () => {
  const issues = await getIssues();
  console.log(JSON.stringify(issues, null, 2))
}

const getTransitionsFunc = async (issueKey) => {
  const transitions = await getTransitions(issueKey);
  console.log(transitions)
}

const getIssueByIDFunc = async (issueKey) => {
  const issue = await getIssueByID(issueKey);
  console.log(issue)
}

const updateStatusFunc = async (issueKey, statusID) => {
  const status = await updateStatus(issueKey, statusID);
  console.log(status)
}

// This will list all users
const getUsersFunc = async () => {
  const users = await getUsers();
  console.log(JSON.stringify(users, null, 3))

  const chunkSize = 10; // Adjust the chunk size as needed
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    console.log(JSON.stringify(chunk, null, 2));
  }

}


async function clearBoard() {
  try {
      await deleteComponents();
      console.log("Components deleted");
  } catch (error) {
      console.error("Error deleting components:", error);
  }

  try {
    await deleteVersion();
    console.log("Version deleted");
  } catch (error) {
    console.error("Error deleting version:", error);
  }

  try {
      await deleteTasks();
      console.log("Tasks deleted");
  } catch (error) {
      console.error("Error deleting tasks:", error);
  }

  try {
    await deleteEpic();
    console.log("Epic deleted");
  } catch (error) {
    console.error("Error deleting epic:", error);
  }

  console.log("Board cleared");
}



async function createBoard(){
  try {
      if (typeof csvFile !== 'string') {
        console.log(csvFile);
        throw new TypeError('The "path" argument must be of type string. Received ' + typeof csvFile);
      }
      await createComponent(csvFile);
  } catch (error) {
      console.error("Error creating component:", error);
  }

  try {
    await createVersion(csvFile);
    console.log("Version created");
  } catch (error) {
    console.error("Error creating version:", error);
  }

  try {
    const epicDict = await createEpic(csvFile);
    console.log(JSON.stringify(epicDict, null, 2))
  } catch (error) {
    console.error("Error creating epic:", error);
  }

  try {
      await createCSVIssues(csvFile);
      console.log("CSV issues created");
  } catch (error) {
      console.error("Error creating CSV issues:", error);
  }

  console.log("Board creation completed");
}


createBoard();
//deleteEpic();



//getProjectIDFunc()
//createVersionFunc();
//getVersionFunc();


//getIssuesFunc();
// FUNC TO CREATE SUB-TASKS


//getIssuesFunc();


