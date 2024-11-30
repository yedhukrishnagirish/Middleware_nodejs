const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Port for the server

// GraphDB endpoint URL
const endpoint = 'http://localhost:7200/repositories/DE3246524379';

// SPARQL query to get name and age
const sparqlQuery = `
PREFIX ex: <http://example.org/ns#>

SELECT ?task ?title ?inScope ?outScope ?definitionStatus ?taskDescription 
       (GROUP_CONCAT(DISTINCT ?catBaseValue; SEPARATOR=" , ") AS ?catBaseValues)
       (GROUP_CONCAT(DISTINCT ?catBaseBehaviourValue; SEPARATOR=" , ") AS ?catBaseBehaviourValues)
       (GROUP_CONCAT(DISTINCT ?catBaseThermalValue; SEPARATOR=" , ") AS ?catBaseThermalValues)
       (GROUP_CONCAT(DISTINCT ?catBaseTimeValue; SEPARATOR=" , ") AS ?catBaseTimeValues)
       (GROUP_CONCAT(DISTINCT ?catBaseComplexityValue; SEPARATOR=" , ") AS ?catBaseComplexityValues)
       (GROUP_CONCAT(DISTINCT ?catSpecial1Value; SEPARATOR=" , ") AS ?catSpecial1Values)
WHERE {
  ?task a ex:ModalAnalysisTask .
  ?task ex:title ?title .
  ?task ex:inScope ?inScope .
  ?task ex:outScope ?outScope .
  ?task ex:definitionStatus ?definitionStatus .
  ?task ex:taskDescription ?taskDescription .

  OPTIONAL { ?task ex:physicsModel/ex:catBase ?catBase . ?catBase ?p ?catBaseValue . }
  OPTIONAL { ?task ex:physicsModel/ex:catBaseBehaviour ?catBaseBehaviour . ?catBaseBehaviour ?p ?catBaseBehaviourValue . }
  OPTIONAL { ?task ex:physicsModel/ex:catBaseThermal ?catBaseThermal . ?catBaseThermal ?p ?catBaseThermalValue . }
  OPTIONAL { ?task ex:physicsModel/ex:catBaseTime ?catBaseTime . ?catBaseTime ?p ?catBaseTimeValue . }
  OPTIONAL { ?task ex:physicsModel/ex:catBaseComplexity ?catBaseComplexity . ?catBaseComplexity ?p ?catBaseComplexityValue . }
  OPTIONAL { ?task ex:physicsModel/ex:catSpecial1 ?catSpecial1 . ?catSpecial1 ?p ?catSpecial1Value . }
}
GROUP BY ?task ?title ?inScope ?outScope ?definitionStatus ?taskDescription
`;

// Query route to fetch data from GraphDB
app.get('/data', async (req, res) => {
  try {
    const response = await axios.get(endpoint, {
      params: {
        query: sparqlQuery,
      },
      headers: {
        Accept: 'application/sparql-results+json', // Request results in JSON format
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching data from GraphDB',
      message: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
