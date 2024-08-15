# JIRA Board Automation Tool

## Description

This tool automates the creation of JIRA board components, versions, epics, and tasks based on a CSV file with pre-configuered issue field columns and issues. The script parses through the columns of the CSV. It is designed to streamline the process of setting up JIRA boards for repetitive projects by creating boilerplate ticket requirements in a CSV format.

For this script to work, your CSV file columns need to be configured correctly. To find out what mandatory column headers (field names) you need to include, export an existing issue CSV from Jira.

You can also use the clearBoard() function to remove components, versions, epics and tasks providing a clean slate.

## Features

- **Create Components**: Creates components from the CSV file.
- **Create Versions**: Creates versions from the CSV file.
- **Create Epics**: Creates epics from the CSV file.
- **Create Tasks**: Creates tasks, and applies versions.
- **Delete Board Contents**: Clears all components, versions, epics, and tasks from the JIRA board.

## Prerequisites

- Node.js installation

    **Required Node.js Modules**:

    ```bash
    npm install fs axios dotenv csv-parser
    ```
    - fs: File system module to handle file operations.
    - axios: For making HTTP requests.
    - dotenv: For managing environment variables.
    - csv-parser: For parsing CSV files.

- A JIRA account with the necessary permissions to create and delete issues, components, and versions.
- A `.env` file configured with JIRA environment variables:
    - ATLASSIAN_API_KEY
    - ATLASSIAN_USERNAME
    - DOMAIN
    - PROJECT_KEY
    - CSV_TEMPLATE_PATH
    - FEATURE_OWNER_ID
    - FEATURE_OWNER_EMAIL

## Usage

### Creating a JIRA Board

To create a JIRA board with components, versions, epics, and tasks, run:

```bash
node app.js
```

### Clearing a JIRA Board

To delete all contents (components, versions, epics, tasks) from a JIRA board:

Uncomment the clearBoard() function call in the script to first empty the board.
Run the script to clear the board before implementing the template.

## Functions Overview

**createBoard()**: Creates a JIRA board based on the CSV file.

**clearBoard()**: Deletes all contents from the JIRA board.

Individual functions for creating and deleting components, versions, epics, and tasks and fetching project/user info:

### User Functions

- **`getUsers()`**: Retrieves a list of users.
  - *File*: `./get-users.js`

### Project Functions

- **`getProjectID()`**: Retrieves the project ID for a specific project.
  - *File*: `./get-project-ID.js`

- **`getProjects()`**: Retrieves all projects on the workspace.
  - *File*: `./get-projects.js`

### Issue Functions

- **`createCSVIssues()`**: Creates tasks from a CSV file.
  - *File*: `./create-task-CSV.js`

- **`deleteTasks()`**: Deletes tasks.
  - *File*: `./delete-tasks.js`

- **`createEpic()`**: Creates epics from a CSV file.
  - *File*: `./create-epic-CSV.js`

- **`deleteEpic()`**: Deletes epics.
  - *File*: `./delete-epic.js`

- **`getIssues()`**: Retrieves a list of issues.
  - *File*: `./get-issues.js`

### Component Functions

- **`createComponent()`**: Creates components from a CSV file.
  - *File*: `./create-components-CSV.js`

- **`deleteComponents()`**: Deletes components.
  - *File*: `./delete-components.js`

### Version Functions

- **`createVersion()`**: Creates versions from a CSV file.
  - *File*: `./create-version-csv.js`

- **`deleteVersion()`**: Deletes versions.
  - *File*: `./delete-version.js`

- **`getVersions()`**: Retrieves a list of versions.
  - *File*: `./get-versions.js`

## Error Handling
The script includes basic error handling and logs any issues encountered during the creation or deletion processes.

## Credits

This tool was adapted from the original code found in the [JIRA Cloud REST API Tutorial](https://github.com/horeaporutiu/JIRA-Cloud-REST-API-Tutorial) repository. The adaptation was made to work with CSV files for automated creation of JIRA board components, versions, epics, and tasks based on different CSV templates.

