import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; fullName: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const projectsApi = {
  list: (orgId: string) => api.get(`/projects?organizationId=${orgId}`),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
};

export const importsApi = {
  create: (projectId: string, data: { kind: string; sourceRef: string }) => api.post(`/projects/${projectId}/imports`, data),
  getStatus: (projectId: string, importId: string) => api.get(`/projects/${projectId}/imports/${importId}`),
};

export const pagesApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/pages`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/pages`, data),
};

export const mediaApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/media`),
  upload: (projectId: string, formData: FormData) => api.post(`/projects/${projectId}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const builderApi = {
  getTree: (projectId: string, pageId: string) => api.get(`/projects/${projectId}/builder/pages/${pageId}`),
  addNode: (projectId: string, data: any) => api.post(`/projects/${projectId}/builder/nodes`, data),
  updateNode: (projectId: string, nodeId: string, data: any) => api.patch(`/projects/${projectId}/builder/nodes/${nodeId}`, data),
  deleteNode: (projectId: string, nodeId: string) => api.delete(`/projects/${projectId}/builder/nodes/${nodeId}`),
};

export const deploymentsApi = {
  deploy: (projectId: string) => api.post(`/projects/${projectId}/deployments`),
  list: (projectId: string) => api.get(`/projects/${projectId}/deployments`),
};
