import { request } from './client';
import { PRIORITIES, STATUS_TODO } from '../config';

// The API may wrap results ({ task }, { tasks }, { data }) or return them bare.
const unwrap = (data, ...keys) => {
  for (const key of keys) if (data && data[key] !== undefined) return data[key];
  return data;
};
const asList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const role = typeof raw.role === 'string' ? raw.role : raw.role?.name || raw.Role?.name || raw.roleName || 'user';
  return {
    id: raw.id ?? raw._id ?? raw.userId,
    username: raw.username ?? raw.name ?? '',
    email: raw.email ?? '',
    role: String(role).toLowerCase(),
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

export function normalizeTask(raw) {
  return {
    id: raw.id ?? raw._id ?? raw.taskId,
    title: raw.title ?? '',
    description: raw.description ?? '',
    status: raw.status ?? STATUS_TODO,
    priority: raw.priority ?? PRIORITIES[1].value,
    dueDate: raw.dueDate ?? raw.due_date ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
    userId: raw.userId ?? raw.user_id ?? raw.ownerId ?? null,
    owner: raw.owner?.username ?? raw.user?.username ?? raw.User?.username ?? raw.username ?? null,
  };
}

// The body sent when creating or updating a task.
export const taskPayload = (task) => ({
  title: task.title.trim(),
  description: (task.description || '').trim(),
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate || null,
});

const authResult = (data) => ({
  token: data?.token ?? data?.accessToken ?? data?.data?.token ?? null,
  user: normalizeUser(data?.user ?? data?.data?.user),
});

const taskPath = (id) => `/api/tasks/${encodeURIComponent(id)}`;

export const authApi = {
  login: (identifier, password, rememberMe) =>
    request('/api/auth/login', { method: 'POST', body: { username: identifier, password, rememberMe } }).then(
      authResult,
    ),
  register: (fields) => request('/api/auth/register', { method: 'POST', body: fields }).then(authResult),
  me: () => request('/api/auth/me').then((d) => normalizeUser(unwrap(d, 'user'))),
  profile: () => request('/api/auth/profile').then((d) => normalizeUser(unwrap(d, 'user', 'profile'))),
  updateProfile: (fields) =>
    request('/api/auth/profile', { method: 'PUT', body: fields }).then((d) => normalizeUser(unwrap(d, 'user'))),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/password', { method: 'PUT', body: { currentPassword, newPassword } }),
};

export const taskApi = {
  // params: status, priority, search, sortBy (createdAt | dueDate), order (asc | desc)
  list: (params) => request('/api/tasks', { params }).then((d) => asList(d, 'tasks').map(normalizeTask)),
  get: (id) => request(taskPath(id)).then((d) => normalizeTask(unwrap(d, 'task'))),
  create: (task) => request('/api/tasks', { method: 'POST', body: taskPayload(task) }),
  update: (id, task) => request(taskPath(id), { method: 'PUT', body: taskPayload(task) }),
  remove: (id) => request(taskPath(id), { method: 'DELETE' }),
};

export const adminApi = {
  users: () => request('/api/admin/users').then((d) => asList(d, 'users').map(normalizeUser)),
  tasks: () => request('/api/admin/tasks').then((d) => asList(d, 'tasks').map(normalizeTask)),
  deleteUser: (id) => request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  deleteTask: (id) => request(`/api/admin/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
