
// Implementasi Real-time Data Fetching (In-Memory Only)
const DIRECT_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

// Helper function untuk API calls langsung tanpa persistent storage
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Default Content-Type to application/json, unless it's a DELETE request without body
    if (!options.method || options.method.toUpperCase() !== 'DELETE' || options.body) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${DIRECT_URL}${endpoint}`;

    // Menambahkan timestamp untuk mencegah browser caching pada level HTTP request
    // jika method adalah GET
    const finalUrl = (options.method === 'GET' || !options.method) 
      ? `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`
      : url;

    const response = await fetch(finalUrl, {
      ...options,
      headers,
    });

    // Check Content-Type header
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // ignore json parse error
        }
      } else {
        // Jika error tapi bukan JSON (misal HTML 404/500), ambil text sebagian
        try {
          const text = await response.text();
          // console.error(`API Error Response (${endpoint}):`, text.substring(0, 200));
          errorMessage += " (Non-JSON response)";
        } catch (e) {}
      }
      
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    if (!isJson) {
      // Jika status 200 OK tapi bukan JSON (misal HTML index.html karena proxy fail)
      const text = await response.text();
      // console.error(`API Unexpected HTML Response (${endpoint}):`, text.substring(0, 200));
      throw new Error(`API returned Non-JSON response (HTML). Check proxy/backend configuration.`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // console.error(`API Call Error (${endpoint}):`, error);
    // Re-throw error agar bisa ditangani oleh React Query / UI
    throw error;
  }
}
