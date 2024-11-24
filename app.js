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
app.get('/status_original', async (req, res) => {
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



app.get('/status', async (req, res) => {
    const responseDataFake = { 
            name:"def",
            items:["Load case","Simulation","Testing","Debugging","Deleting","Requirements","Hold","Vacation"],
            difficulty:["Junior","Senior","Expert"]
    }
    

    res.json(responseDataFake);
});

app.get('/test', async (req, res) => {
    
    const responseDataFake = {
        _uvar_local_task: 'Modalanalyse einer Platte mit Sickenmuster #1',
        _uvar_local_inscope: 'Wert der Eigenfrequenzen, Modalform',
        _uvar_local_outscope: 'Amplitude, Materialspannung',
        _basic_model:{
        _uvar_local_numerics: {
                case1: 'FEM',
                case2: 'Non FEM'
            },
        _uvar_local_solver:{ 
            case1: 'Abaqus',
            case2: 'Epilysis',
            case3: 'MSC Nastran',
            case4: 'UG NX Nastran',
            case5: 'LS Dyna',
            case6: 'Radioss',
            case7: 'OpenRadioss',
            case8: 'OpenFOAM',
            case9: 'Fluent',
            case10: 'StarCCM+'

        }

        },
        _uvar_local_definition_status: {
            case1: 'Not Yet Started',
            case2: 'In Progress',
            case3: 'Complete'
        },
        _physicsmodel_base:{
            _uvar_local_catbase:{
                case1: 'Fluid',
                case2: 'Structure',
                case3: 'Multi Body'
            },
            _uvar_local_catbase_behaviour:{
                case1: 'Compressible',
                case2: 'Incompressible',
                case3: 'Elastic',
                case4: 'Inelastic'

            },
            _uvar_local_catbase_thermal:{
                case1: 'Isothermal',
                case2: 'Non Isothermal'
            },
            _uvar_local_catbase_time:{
                case1: 'Stationary',
                case2: 'Transient'
            },
            _uvar_local_catbase_complexity:{
                case1: 'Laminar',
                case2: 'Turbulent'
            },
            _uvar_local_catspecial_1:{
                case1: 'Fluid',
                case2: 'Structure',
                case3: 'Linear',
                case4: 'Non Linear'
            },

        },
        _uvar_local_inscope: 'Die Modalanalyse mit Finiten Elementen ist eine Analyse der Steifigkeitsmatrix. Das Problem wird linearisiert, d. h. es kommen nur elastische Materialeigenschaften zum Einsatz. Kontakte werden vor der Berechnung geschlossen. Die als Ergebnis ausgegebenen Amplituden sind keine absoluten Amplituden, sondern dienen dem relativen Vergleich. Auch Materialspannungen werden mit einer Modalanalyse nicht berechnet. Zur Berechnung von Amplituden und Materialspannungen muss eine Frequency Response-Analyse gemacht werden.'

    };

    res.json(responseDataFake);
    
});

// Route to handle POST requests for /submit
app.get('/definition_hardcode',  async (req, res) => {

    const responseDataFake = {
        _uvar_local_task: 'Modalanalyse einer Platte mit Sickenmuster #1',
        _uvar_local_inscope: 'Wert der Eigenfrequenzen, Modalform',
        _uvar_local_outscope: 'Amplitude, Materialspannung',
        _basic_model: {
            _uvar_local_numerics: ['FEM', 'Non FEM'], 
            _uvar_local_solver: [
                'Abaqus', 'Epilysis', 'MSC Nastran', 'UG NX Nastran', 'LS Dyna',
                'Radioss', 'OpenRadioss', 'OpenFOAM', 'Fluent', 'StarCCM+'
            ]
        },
        _uvar_local_definition_status: ['Not Yet Started', 'In Progress', 'Complete'],
        _physicsmodel_base: {
            _uvar_local_catbase: ['Fluid', 'Structure', 'Multi Body'],
            _uvar_local_catbase_behaviour: ['Compressible', 'Incompressible', 'Elastic', 'Inelastic'],
            _uvar_local_catbase_thermal: ['Isothermal', 'Non Isothermal'],
            _uvar_local_catbase_time: ['Stationary', 'Transient'],
            _uvar_local_catbase_complexity: ['Fluid', 'Structure', 'Linear', 'Non Linear']
        },
        _physicsmodel_special: {
            _uvar_local_catspecial_1:['Single Phase','Multiphase','Contacts','No Contacts',],
            _uvar_local_catspecial_2:['Single Species','Multi Species','Simple Conn','Complex Conn'],
            _uvar_local_catspecial_3:['Acoustic','Non Acoustic']
        },
        _uvar_local_gencomdefinition: 'Die Modalanalyse mit Finiten Elementen ist eine Analyse der Steifigkeitsmatrix. Das Problem wird linearisiert, d. h. es kommen nur elastische Materialeigenschaften zum Einsatz...'
    };
    

    res.json(responseDataFake);
});





app.post('/filtering', async (req, res) => {
    const data = req.body;  // Capture the JSON data sent in the request body
    console.log('Data received:', data);

    const keys = Object.keys(data);
    console.log('Keys of the received data:', keys);

    // Check for the _uvar_local_view key and its value
    if (data._uvar_local_view === 'Junior') {
        // Return response if value is Junior
        const responseDataFake = { 
            name: "def",
            items: ["Testing", "Debugging", "Deleting", "Requirements", "Hold", "Vacation"],
            difficulty:["Junior","Senior","Expert"]
        };
        res.json(responseDataFake);
    } else {
        // Default response
        const responseDataFake = { 
            name: "def",
            items: ["Load case", "Simulation", "Testing", "Debugging", "Deleting", "Requirements", "Hold", "Vacation"],
            difficulty:["Junior","Senior","Expert"]
        };
        res.json(responseDataFake);
    }
});

app.get('/definition', async (req, res) => {
    const token = process.env.GITHUB_TOKEN; // Replace with your GitHub token
    const repoUrl = 'https://github.com/yedhukrishnagirish/TiddlyProjectRepo';
    const branch = 'main';
    const jsonFilePath = path.join(CLONE_DIR, 'Definition', 'definition.json');

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

app.get('/solution', async (req, res) => {
    const token = process.env.GITHUB_TOKEN; // Replace with your GitHub token
    const repoUrl = 'https://github.com/yedhukrishnagirish/TiddlyProjectRepo';
    const branch = 'main';
    const jsonFilePath = path.join(CLONE_DIR, 'Solution', 'solution.json');

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
    console.log(`API is up through , http://0.0.0.0:${port}`);
});
