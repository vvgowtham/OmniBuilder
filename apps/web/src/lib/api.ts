const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: any = { ...options.headers };
  if (!options.body || !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && token !== 'demo-token') headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; password: string; fullName: string }) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiFetch('/auth/me'),

  // Dashboard
  dashboardStats: () => apiFetch('/dashboard/stats'),
  dashboardActivity: () => apiFetch('/dashboard/activity'),

  // Projects
  getProjects: (orgId?: string) => apiFetch(`/projects${orgId ? `?organizationId=${orgId}` : ''}`),
  getProject: (id: string) => apiFetch(`/projects/${id}`),
  createProject: (data: any) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => apiFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),
  duplicateProject: (id: string) => apiFetch(`/projects/${id}/duplicate`, { method: 'POST' }),

  // Pages
  getPages: (projectId?: string) => apiFetch(`/pages${projectId ? `?projectId=${projectId}` : ''}`),
  getPage: (id: string) => apiFetch(`/pages/${id}`),
  createPage: (data: any) => apiFetch('/pages', { method: 'POST', body: JSON.stringify(data) }),
  updatePage: (id: string, data: any) => apiFetch(`/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePage: (id: string) => apiFetch(`/pages/${id}`, { method: 'DELETE' }),
  publishPage: (id: string) => apiFetch(`/pages/${id}/publish`, { method: 'POST' }),

  // Builder
  saveBuilderContent: (pageId: string, content: any) => apiFetch(`/builder/pages/${pageId}/save`, { method: 'POST', body: JSON.stringify({ content }) }),
  loadBuilderContent: (pageId: string) => apiFetch(`/builder/pages/${pageId}/load`),
  publishBuilderPage: (pageId: string) => apiFetch(`/builder/pages/${pageId}/publish`, { method: 'POST' }),
  getBuilderVersions: (pageId: string) => apiFetch(`/builder/pages/${pageId}/versions`),
  getPublishedPage: (slug: string) => apiFetch(`/builder/render/${slug}`),

  // Media
  getMedia: (projectId?: string) => apiFetch(`/media${projectId ? `?projectId=${projectId}` : ''}`),
  uploadMedia: (formData: FormData) => apiFetch('/media/upload', { method: 'POST', body: formData }),
  deleteMedia: (id: string) => apiFetch(`/media/${id}`, { method: 'DELETE' }),
  updateMedia: (id: string, data: any) => apiFetch(`/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Users
  getUsers: (search?: string) => apiFetch(`/users${search ? `?search=${search}` : ''}`),
  getUser: (id: string) => apiFetch(`/users/${id}`),
  createUser: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  // Menus
  getMenus: (projectId?: string) => apiFetch(`/menus${projectId ? `?projectId=${projectId}` : ''}`),
  getMenu: (id: string) => apiFetch(`/menus/${id}`),
  createMenu: (data: any) => apiFetch('/menus', { method: 'POST', body: JSON.stringify(data) }),
  updateMenu: (id: string, data: any) => apiFetch(`/menus/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenu: (id: string) => apiFetch(`/menus/${id}`, { method: 'DELETE' }),
  addMenuItem: (menuId: string, data: any) => apiFetch(`/menus/${menuId}/items`, { method: 'POST', body: JSON.stringify(data) }),

  // Forms
  getForms: (projectId?: string) => apiFetch(`/forms${projectId ? `?projectId=${projectId}` : ''}`),
  createForm: (data: any) => apiFetch('/forms', { method: 'POST', body: JSON.stringify(data) }),
  deleteForm: (id: string) => apiFetch(`/forms/${id}`, { method: 'DELETE' }),
  getFormSubmissions: (formId: string) => apiFetch(`/forms/${formId}/submissions`),
  submitForm: (formId: string, data: any) => apiFetch(`/forms/${formId}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Health
  health: () => apiFetch('/health'),
};
