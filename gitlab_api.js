const express = require('express');
const cors = require('cors');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const neo4j = require('neo4j-driver');  // Import Neo4j driver
require('dotenv').config();

const app = express();
const git = simpleGit();

// Use CORS to allow requests from any origin
app.use(cors());
app.use(express.json());  // To parse JSON request body

// Directory to clone the repository to
const CLONE_DIR = path.join(__dirname, 'cloned_repo');

// Function to load JSON file content from the cloned repository
function loadJsonFile(jsonFilePath) {
    try {
        const data = fs.readFileSync(jsonFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading JSON file: ${error.message}`);
        return null;
    }
}

// Function to clone a GitLab repository
async function cloneRepo(token, repoUrl, branch, destDir) {
    const tokenRepoUrl = repoUrl.replace('https://', `https://girish:${token}@`);

    // Remove existing directory if exists
    if (fs.existsSync(destDir)) {
        console.log(`Removing existing directory: ${destDir}`);
        fs.rmSync(destDir, { recursive: true, force: true });
    }

    try {
        console.log(`Cloning repository from ${repoUrl} (branch: ${branch}) into ${destDir}`);
        await git.clone(tokenRepoUrl, destDir, ['--branch', branch]);
        console.log(`Repository successfully cloned to ${destDir}`);
        return true;
    } catch (error) {
        console.error(`Error occurred while cloning the repository: ${error.message}`);
        return false;
    }
}

// Route to clone the repository
app.get('/clone', async (req, res) => {
    const token = 'glpat-zmxiuMJUjxND7pZJ-iHV' //'glpat-pGzhzJoFPgPb4xv7ybye' // process.env.GITLAB_TOKEN; // Your GitLab token from .env file
    const repoUrl = 'https://erbenschell.iese.fraunhofer.de/ep40_processcompanion/test.git';
    const branch = 'dev';

    const cloneSuccess = await cloneRepo(token, repoUrl, branch, CLONE_DIR);

    if (!cloneSuccess) {
        return res.status(500).json({ error: 'Failed to clone repository' });
    }

    const definitionFilePath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'definition.json');
    const solutionFilePath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'solution.json');
    const documentConfigFilePath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'document_configuration.json');
    const projectDetailsPath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'project_details.json');

    // Load JSON data from each file
    const definitionData = loadJsonFile(definitionFilePath);
    const solutionData = loadJsonFile(solutionFilePath);
    const documentConfigData = loadJsonFile(documentConfigFilePath);
    const projectDetailData = loadJsonFile(projectDetailsPath);

    if (!definitionData || !solutionData || !documentConfigData || !projectDetailData) {
        return res.status(500).json({ error: 'Failed to read one or more JSON files from the cloned repository' });
    }

    //  // Print the JSON content to the console
    //  console.log('definition.json:', JSON.stringify(definitionData));
    //  console.log('solution.json:', JSON.stringify(solutionData));
    //  console.log('document_configuration.json:', JSON.stringify(documentConfigData));
    // Return the data in the response
    res.json({
        definition: definitionData,
        solution: solutionData,
        document_configuration: documentConfigData,
        project_detail: projectDetailData
    });
    //res.json({ definition: definitionData,});
});

// Route to provide help information
app.get('/help', (req, res) => {
    res.json({ help: "It's just a task from Segula\n and fraunhofer" });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Middleware is running on port ${PORT}`);
});
