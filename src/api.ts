// API Configuration & Helper for EdVyro Full Stack Application

// In AI Studio / Vite, relative path '/api' seamlessly routes to the Express server on the same origin.
// If an external backend is specified via VITE_API_URL, we prefix that instead.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Standard fetch wrapper that handles base URL resolution, JSON parsing, and unified error handling
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  let data: any;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = 
      (data && typeof data === 'object' && (data.error || (data.details && data.details.join(', ')))) ||
      `Request failed with status ${response.status} (${response.statusText})`;
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
