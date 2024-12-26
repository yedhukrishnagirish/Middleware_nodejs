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

// Function to recursively load all JSON files from a directory and its subdirectories
function loadJsonFilesFromDir(directory) {
    let jsonFilesData = [];

    // Read all files and directories within the current directory
    const items = fs.readdirSync(directory);

    items.forEach(item => {
        const itemPath = path.join(directory, item);

        // If the item is a directory, recursively call this function
        if (fs.statSync(itemPath).isDirectory()) {
            jsonFilesData = jsonFilesData.concat(loadJsonFilesFromDir(itemPath));
        }
        // If the item is a .json file, load it
        else if (itemPath.endsWith('.json')) {
            try {
                const fileData = fs.readFileSync(itemPath, 'utf-8');
                jsonFilesData.push({
                    fileName: path.relative(CLONE_DIR, itemPath),  // Foldername/FileName (relative to cloned repo)
                    data: JSON.parse(fileData)
                });
            } catch (error) {
                console.error(`Error reading file ${itemPath}: ${error.message}`);
            }
        }
    });

    return jsonFilesData;
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

// Route to clone the repository and load JSON files
app.get('/clone', async (req, res) => {
    const token =    'glpat-zmxiuMJUjxND7pZJ-iHV'  //'glpat-pGzhzJoFPgPb4xv7ybye'; // process.env.GITLAB_TOKEN; // Your GitLab token from .env file
    const repoUrl = 'https://erbenschell.iese.fraunhofer.de/ep40_processcompanion/test.git';
    const branch = 'dev';

    const cloneSuccess = await cloneRepo(token, repoUrl, branch, CLONE_DIR);

    if (!cloneSuccess) {
        return res.status(500).json({ error: 'Failed to clone repository' });
    }

    // Recursively load all JSON files from the cloned repository directory
    const allJsonData = loadJsonFilesFromDir(CLONE_DIR);

    if (!allJsonData || allJsonData.length === 0) {
        return res.status(500).json({ error: 'Failed to read any JSON files from the cloned repository' });
    }

    // Return the JSON data with foldername/filename
    res.json({ files: allJsonData });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
