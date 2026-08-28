const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/sync-indicators', async (req, res) => {
  const query = `
    query GetTacticalIPs {
      stixCyberObservables(types: ["IPv4-Addr"], first: 10, orderBy: created_at, orderMode: desc) {
        edges {
          node {
            observable_value
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'http://10.10.10.102:8080/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${process.env.OPENCTI_TOKEN}`
        }
      }
    );
    
    const ips = response.data.data.stixCyberObservables.edges.map(edge => edge.node.observable_value);
    res.json({ status: 'success', count: ips.length, indicators: ips });
  } catch (error) {
    console.error("OpenCTI Query Failed", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => console.log(`CTI Aggregator running on port ${PORT}`));
