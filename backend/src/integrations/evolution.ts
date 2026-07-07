import axios from 'axios';

const evolutionUrl = process.env.EVOLUTION_URL || 'https://apigo.euattendo.com.br';
const evolutionApiKey = process.env.EVOLUTION_API_KEY || '';

const evolutionClient = axios.create({
  baseURL: evolutionUrl,
  headers: {
    'Content-Type': 'application/json',
    apikey: evolutionApiKey,
  },
});

export default evolutionClient;
