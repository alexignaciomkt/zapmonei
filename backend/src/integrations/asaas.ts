import axios from 'axios';

const asaasUrl = process.env.ASAAS_URL || 'https://sandbox.asaas.com/api/v3';
const asaasApiKey = process.env.ASAAS_API_KEY || '';

const asaasClient = axios.create({
  baseURL: asaasUrl,
  headers: {
    'Content-Type': 'application/json',
    access_token: asaasApiKey,
  },
});

export default asaasClient;
