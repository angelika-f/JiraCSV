// ISSUES
const createIssue = require('./create-issue.js');
const createCSVIssues = require('./create-issue-CSV.js')
const deleteIssueByID = require('./delete-issue-by-id.js');
const createEpic = require('./create-epic-CSV.js')
const deleteEpic = require('./delete-epic.js')
const deleteTasks = require('./delete-tasks.js')
const createVersion = require('./create-version-csv.js')
const deleteVersion = require('./delete-version.js')
const getIssueByID = require('./get-issue-by-id.js');
const getIssues = require('./get-issues.js');
const getVersions = require('./get-versions.js');
const getUsers = require('./get-users.js');
const updateStatus = require('./update-status.js');
const getProjectID = require('./get-project-ID.js')
const getProjects = require('./get-projects.js')

// COMPONENTS
const deleteComponents = require('./delete-components.js')
const createComponent = require('./create-components-CSV.js')


// MISC
const getTransitions = require('./get-transitions.js');
const createProject = require('./create-project.js');


// Common call pattern 1: create project, create issue in that project, and move that 
// issue into in progress. This function will do exactly as described in the previous sentence 
// by making 3 async calls to different functions which we imported at the top. See function logic 
// in the individual function files which are named as obviously as possible :) 

const csvFile = process.env.CSV_TEMPLATE_PATH

const getProjectIDFunc= async () => {
  await getProjectID();
}

const createComponentsFunc = async () => {
  //const csvFile = '/Users/angelikafiluba/Downloads/Mobile CSV Test.csv'
  const components = await createComponent(csvFile);
  // console.log(components)
}

const createEpicFunc = async () => {
  //const csvFile = '/Users/angelikafiluba/Downloads/Mobile CSV Test.csv'
  const epic = await createEpic(csvFile);
}



const createVersionFunc  = async () => {
  await createVersion(csvFile);
}



const getVersionFunc = async () => {
  await getVersions();
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
    await deleteComponents();
    await deleteEpic();
    await deleteVersion();
    await deleteTasks();
}


async function createBoard(){
  await createComponent(csvFile);
  await createEpic(csvFile)
  await createVersion(csvFile);
  await createCSVIssues(csvFile);
}


//clearBoard();
createBoard();











