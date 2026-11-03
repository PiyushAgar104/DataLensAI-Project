const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    credentials: 'include',
    ...options,
    headers: {
      'Cache-Control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}`);
  }
  return payload;
}

export function uploadDataset(files, signal) {
  const formData = new FormData();
  const selectedFiles = Array.isArray(files) ? files : [files];
  selectedFiles.forEach((file) => formData.append('files', file));
  return request('/api/datasets/upload', { method: 'POST', body: formData, signal });
}

export function askDataset(datasetId, question, history = []) {
  return request(`/api/datasets/${datasetId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });
}

export function forecastDataset(datasetId, requestBody) {
  return request(`/api/datasets/${datasetId}/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
}

export async function submitPayment(formData) {
  return request('/api/payments', { method: 'POST', body: formData });
}

export function getPaymentConfig() {
  return request('/api/payments/config');
}

export function getPaymentStatus(reference) {
  return request(`/api/payments/${encodeURIComponent(reference)}/status`);
}

export async function downloadPaymentReceipt(reference) {
  const response = await fetch(`${API_BASE_URL}/api/payments/${encodeURIComponent(reference)}/receipt`, {
    cache: 'no-store',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `Receipt request failed with status ${response.status}`);
  }
  return response.blob();
}

export function adminLogin(password) {
  const formData = new FormData();
  formData.append('admin_password', password);
  return request('/api/admin/login', { method: 'POST', body: formData });
}

export function adminLogout() {
  return request('/api/admin/logout', { method: 'POST' });
}

export function getAdminSession() {
  return request('/api/admin/session');
}

export function getAdminPayments(status) {
  return request(`/api/admin/payments${status ? `?status=${encodeURIComponent(status)}` : ''}`);
}

export function reviewAdminPayment(reference, decision) {
  return request(`/api/admin/payments/${encodeURIComponent(reference)}/${decision}`, { method: 'POST' });
}

export async function getPaymentScreenshot(reference) {
  const response = await fetch(`${API_BASE_URL}/api/admin/payments/${encodeURIComponent(reference)}/screenshot`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Screenshot unavailable');
  return response.blob();
}
