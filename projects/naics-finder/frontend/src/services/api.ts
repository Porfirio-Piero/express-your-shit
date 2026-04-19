import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CompanyData {
  url?: string;
  name: string;
  address?: string;
}

export interface LookupResult {
  url?: string;
  name: string;
  address?: string;
  naicsCode: string;
  naicsTitle: string;
  confidence: number;
  source: string;
}

export interface BatchJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total?: number;
  processed?: number;
  results?: LookupResult[];
  error?: string;
}

export const lookupCompany = async (data: CompanyData): Promise<LookupResult> => {
  try {
    const response = await api.post('/lookup', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`Lookup failed: ${message}`);
    }
    throw new Error('Network error: Unable to connect to server');
  }
};

export const lookupBatch = async (companies: CompanyData[]): Promise<{ jobId: string }> => {
  try {
    const response = await api.post('/lookup/batch', { companies });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`Batch lookup failed: ${message}`);
    }
    throw new Error('Network error: Unable to connect to server');
  }
};

export const getJobStatus = async (jobId: string): Promise<BatchJob> => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`Failed to get job status: ${message}`);
    }
    throw new Error('Network error: Unable to connect to server');
  }
};
