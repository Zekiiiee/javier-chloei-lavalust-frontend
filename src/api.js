// API base URL — change this to your deployed Render URL in production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/Lavalust';

/**
 * Helper to make authenticated API requests with automatic token refresh
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const tokens = getTokens();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (tokens?.access_token) {
    headers['Authorization'] = `Bearer ${tokens.access_token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, try refreshing
  if (response.status === 401 && tokens?.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed.access_token}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

/**
 * Store tokens in localStorage
 */
function saveTokens(tokens) {
  localStorage.setItem('auth_tokens', JSON.stringify(tokens));
}

/**
 * Get tokens from localStorage
 */
function getTokens() {
  const raw = localStorage.getItem('auth_tokens');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Remove tokens
 */
function clearTokens() {
  localStorage.removeItem('auth_tokens');
  localStorage.removeItem('auth_user');
}

/**
 * Save user data
 */
function saveUser(user) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

/**
 * Get user data
 */
function getUser() {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Attempt to refresh access token
 */
async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.tokens) {
      saveTokens(data.tokens);
      return data.tokens;
    }
    return null;
  } catch {
    return null;
  }
}

// =============================================
// Auth API
// =============================================
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  
  saveTokens(data.tokens);
  saveUser(data.user);
  return data;
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function logoutUser() {
  const tokens = getTokens();
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens?.refresh_token || '' }),
    });
  } catch {
    // Logout even if server request fails
  }
  clearTokens();
}

// =============================================
// Products API
// =============================================
export async function getProducts() {
  let lastError;

  // Apache/LavaLust can briefly return its HTML error page while the API
  // route is initializing after login. Retry that first response in the
  // background so the dashboard does not flash a JSON parsing error.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await request('/api/products');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error('The server returned a non-JSON response');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
      return data.products;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  }

  throw lastError || new Error('Failed to fetch products');
}

export async function getProduct(id) {
  const res = await request(`/api/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch product');
  return data.product;
}

export async function createProduct(product) {
  const res = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data;
}

export async function updateProduct(id, product) {
  const res = await request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
}

export async function deleteProduct(id) {
  const res = await request(`/api/products/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  return data;
}

// Utility exports
export { getUser, getTokens, clearTokens };
