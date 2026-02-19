/**
 * API Client for Trip Splitter Express Backend
 * Handles all communication with express backend
 * 
 * Base Backend URL: https://smartsplit-app-cv3e.onrender.com (from NEXT_PUBLIC_BACKEND_URL env)
 * API Path Prefix: /api
 * 
 * All routes are constructed as: {BACKEND_URL}/api{endpoint}
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartsplit-app-cv3e.onrender.com';
const API_URL = `${BACKEND_URL}/api`;

interface ApiRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  error?: string;
}

/**
 * Make API request to the Express backend
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiRequest = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
  } = options;

  // Construct URL - endpoint might already have /api prefix
  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  // Remove double /api if present
  url = url.replace('/api//api', '/api');

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization token if provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Include cookies for CORS
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'API request failed',
        error: data.message,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API Error on ${endpoint}:`, errorMessage);
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };
  }
}

/**
 * Auth API Endpoints
 */
export const auth = {
  register: (email: string, password: string, name: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),
};

/**
 * User API Endpoints
 */
export const user = {
  getProfile: (token: string) =>
    apiCall('/user/me', {
      method: 'GET',
      token,
    }),

  updateProfile: (token: string, data: any) =>
    apiCall('/user/update', {
      method: 'PUT',
      body: data,
      token,
    }),

  searchUsers: (token: string, query: string) =>
    apiCall(`/user/search?query=${query}`, {
      method: 'GET',
      token,
    }),

  deleteAccount: (token: string) =>
    apiCall('/user/delete-account', {
      method: 'DELETE',
      token,
    }),
};

/**
 * Trip API Endpoints
 */
export const trips = {
  create: (token: string, tripData: any) =>
    apiCall('/trips/create', {
      method: 'POST',
      body: tripData,
      token,
    }),

  getUserTrips: (token: string) =>
    apiCall('/trips/user', {
      method: 'GET',
      token,
    }),

  getTripDetails: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}`, {
      method: 'GET',
      token,
    }),

  addMember: (token: string, tripId: string, email: string) =>
    apiCall(`/trips/${tripId}/add-member`, {
      method: 'POST',
      body: { email },
      token,
    }),

  respondToInvite: (token: string, tripId: string, action: 'accept' | 'reject') =>
    apiCall(`/trips/${tripId}/respond`, {
      method: 'POST',
      body: { action },
      token,
    }),

  endTrip: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/end`, {
      method: 'POST',
      token,
    }),
};

/**
 * Expense API Endpoints
 */
export const expenses = {
  add: (token: string, expenseData: any) =>
    apiCall('/expenses/add', {
      method: 'POST',
      body: expenseData,
      token,
    }),

  update: (token: string, expenseId: string, expenseData: any) =>
    apiCall(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: expenseData,
      token,
    }),

  delete: (token: string, expenseId: string) =>
    apiCall(`/expenses/${expenseId}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Settlement API Endpoints
 */
export const settlements = {
  getSettlements: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/settlements`, {
      method: 'GET',
      token,
    }),
};

/**
 * Analytics API Endpoints
 */
export const analytics = {
  getAnalytics: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/analytics`, {
      method: 'GET',
      token,
    }),
};

/**
 * Itinerary API Endpoints
 */
export const itinerary = {
  getItinerary: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/itinerary`, {
      method: 'GET',
      token,
    }),

  addActivity: (token: string, tripId: string, activityData: any) =>
    apiCall(`/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: activityData,
      token,
    }),
};

/**
 * Packing API Endpoints
 */
export const packing = {
  getPackingList: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/packing`, {
      method: 'GET',
      token,
    }),

  addItem: (token: string, tripId: string, itemData: any) =>
    apiCall(`/trips/${tripId}/packing`, {
      method: 'POST',
      body: itemData,
      token,
    }),

  toggleItem: (token: string, tripId: string, itemData: any) =>
    apiCall(`/trips/${tripId}/packing`, {
      method: 'PUT',
      body: itemData,
      token,
    }),

  deleteItem: (token: string, tripId: string, itemId: string) =>
    apiCall(`/trips/${tripId}/packing?itemId=${itemId}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Chat API Endpoints
 */
export const chat = {
  getMessages: (token: string, tripId: string) =>
    apiCall(`/trips/${tripId}/chat`, {
      method: 'GET',
      token,
    }),

  sendMessage: (token: string, tripId: string, content: string) =>
    apiCall(`/trips/${tripId}/chat`, {
      method: 'POST',
      body: { content },
      token,
    }),
};

/**
 * Notification API Endpoints
 */
export const notifications = {
  getNotifications: (token: string) =>
    apiCall('/notifications', {
      method: 'GET',
      token,
    }),

  markAllAsRead: (token: string) =>
    apiCall('/notifications', {
      method: 'PUT',
      token,
    }),
};

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
