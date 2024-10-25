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

// Initialize Neo4j driver
const driver = neo4j.driver(
    'bolt://neo4j:7687',
    neo4j.auth.basic("neo4j", "mysecretpassword",
        { encrypted: 'ENCRYPTION_ON' }
    )
);

const session = driver.session();

// Directory to clone the repository to
const CLONE_DIR = path.join(__dirname, 'cloned_repo');

// Function to clone a GitHub repository
async function cloneRepo(token, repoUrl, branch, destDir) {
    const tokenRepoUrl = repoUrl.replace('https://', `https://${token}@`);
    
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

// Route to check the status and clone a repo
app.get('/status', async (req, res) => {
    const token = process.env.GITHUB_TOKEN; // Replace with your GitHub token
    const repoUrl = 'https://github.com/yedhukrishnagirish/TiddlyProjectRepo';
    const branch = 'main';
    const jsonFilePath = path.join(CLONE_DIR, 'Document Configuration', 'configuration.json');

    const cloneSuccess = await cloneRepo(token, repoUrl, branch, CLONE_DIR);

    if (!cloneSuccess) {
        return res.status(500).json({ error: 'Failed to clone repository' });
    }

    const statusData = loadJsonFile(jsonFilePath);

    if (!statusData) {
        return res.status(500).json({ error: 'Failed to read configuration.json from cloned repository' });
    }

    res.json(statusData);
});

// Route to handle POST requests for /submit
app.post('/submit', (req, res) => {
    const data = req.body;  // Capture the JSON data sent in the request body
    console.log('Data received:', data);

    const responseDataFake = {
        difficulty: {
            case1: 'Junior',
            case2: 'Senior',
            case3: 'Expert'
        },
        items: {
            case1: 'Load case',
            case2: 'Simulation',
            case3: 'Testing',
            case4: 'Debugging'
        },
        name: 'def'
    };

    const keys = Object.keys(data);
    console.log('Keys of the received data:', keys);

    res.json(responseDataFake);
});

// Route to handle database query
app.post('/db', async (req, res) => {
    const { name } = req.body; // Destructure the request body to get name

    try {
        // Fetch existing difficulty and items from Neo4j
        const difficultyQuery = 'MATCH (d:Difficulty) RETURN d.level AS level LIMIT 3'; // Adjust LIMIT as needed
        const itemsQuery = 'MATCH (i:Item) RETURN i.name AS name LIMIT 4'; // Adjust LIMIT as needed

        const difficultyResult = await session.run(difficultyQuery);
        const itemsResult = await session.run(itemsQuery);

        // Extract difficulty values
        const difficulty = {};
        difficultyResult.records.forEach((record, index) => {
            difficulty[`case${index + 1}`] = record.get('level'); // Extract level directly
        });

        // Extract item values
        const items = {};
        itemsResult.records.forEach((record, index) => {
            items[`case${index + 1}`] = record.get('name'); // Extract name directly
        });

        // Construct your Cypher query to create the new node
        const query = `
            CREATE (n:Node {name: $name}) 
            RETURN n
        `;

        // Execute the query to create a new node with the provided name
        const result = await session.run(query, { name });

        const newNode = result.records.map(record => record.get('n').properties.name); // Get just the name

        // Return the formatted response
        res.json({
            difficulty: difficulty,
            items: items,
            name: newNode[0] // Return the created node name
        });
    } catch (error) {
        console.error(`Database query error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch data from the database' });
    }
});


// Clean up on exit
process.on('exit', () => {
    session.close();
    driver.close();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
