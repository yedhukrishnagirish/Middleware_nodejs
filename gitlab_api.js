const express = require('express');
const cors = require('cors');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const neo4j = require('neo4j-driver');  // Import Neo4j driver
require('dotenv').config();
const { Client } = require('pg');  // Postgres client to interact with DB

const app = express();
const git = simpleGit();

// Use CORS to allow requests from any origin
app.use(cors());
app.use(express.json());  // To parse JSON request body

// Database connection setup
const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'process_companion',
    password: 'admin',
    port: 5432,
});

// Connect to the PostgreSQL database
client.connect();

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
    const collectionFilePath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'collection.json');
    const documentConfigFilePath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'document_configuration.json');
    const projectDetailsPath = path.join(CLONE_DIR, 'loadcase_template', 'load_case1', 'project_details.json');

    // Load JSON data from each file
    const definitionData = loadJsonFile(definitionFilePath);
    const solutionData = loadJsonFile(solutionFilePath);
    const collectionData = loadJsonFile(collectionFilePath);
    const documentConfigData = loadJsonFile(documentConfigFilePath);
    const projectDetailData = loadJsonFile(projectDetailsPath);

    if (!definitionData || !solutionData || !documentConfigData || !projectDetailData || !collectionData) {
        return res.status(500).json({ error: 'Failed to read one or more JSON files from the cloned repository' });
    }

    //  // Print the JSON content to the console
    //  console.log('definition.json:', JSON.stringify(definitionData));
    //  console.log('solution.json:', JSON.stringify(solutionData));
    //  console.log('document_configuration.json:', JSON.stringify(documentConfigData));
    // Return the data in the response
    res.json({
        definition: definitionData,
        collection: collectionData,
        solution: solutionData,
        document_configuration: documentConfigData,
        project_detail: projectDetailData
    });
    //res.json({ definition: definitionData,});
});

// Route to provide help information// Route to receive the field value and fetch help text from the database
app.post('/help_definition', async (req, res) => {
    const  field  = req.body._uvar_local_definition_help;  // Extract 'field' value from the request body

    if (!field) {
        return res.status(400).json({ error: "Field is required in the request body" });
    }

    console.log('Field received:', field);

    try {
        // Query the database to fetch the 'helper' text for the given field
        const result = await client.query(
            'SELECT helper FROM definition WHERE field = $1',
            [field]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No helper text found for field: ${field}` });
        }

        // Send the corresponding helper text in the response
        // Return the corresponding helper text in the 'help' key
        res.json({
            help: result.rows[0].helper,  // Return the helper text inside 'help'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database query failed' });
    }
});


app.post('/help_collection', async (req, res) => {
    console.log(req.body)
    const field  = req.body._uvar_local_collection_help;  // Extract 'field' value from the request body

    if (!field) {
        return res.status(400).json({ error: "Field is required in the request body" });
    }

    console.log('Field received:', field);

    try {
        // Query the database to fetch the 'helper' text for the given field
        const result = await client.query(
            'SELECT helper FROM collection WHERE field = $1',
            [field]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No helper text found for field: ${field}` });
        }

        // Send the corresponding helper text in the response
        // Return the corresponding helper text in the 'help' key
        res.json({
            help: result.rows[0].helper,  // Return the helper text inside 'help'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.post('/help_solution', async (req, res) => {
    console.log(req.body)
    const field  = req.body._uvar_local_solution_help;  // Extract 'field' value from the request body

    if (!field) {
        return res.status(400).json({ error: "Field is required in the request body" });
    }

    console.log('Field received:', field);

    try {
        // Query the database to fetch the 'helper' text for the given field
        const result = await client.query(
            'SELECT helper FROM solution WHERE field = $1',
            [field]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No helper text found for field: ${field}` });
        }

        // Send the corresponding helper text in the response
        // Return the corresponding helper text in the 'help' key
        res.json({
            help: result.rows[0].helper,  // Return the helper text inside 'help'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database query failed' });
    }
});


app.post('/help_report', (req, res) => {
    const data = req.body;  // Capture the JSON data sent in the request body
    console.log('Data received:', data);
    res.json({ help: "It's just a task from Segula\n and fraunhofer" });
});

app.get('/status', async (req, res) => {
    const responseDataFake = { 
            name:"def",
            items:["Load case","Simulation","Testing","Debugging","Deleting","Requirements","Hold","Vacation"],
            difficulty:["Junior","Senior","Expert"]
    }
    

    res.json(responseDataFake);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Middleware is running on port ${PORT}`);
});
