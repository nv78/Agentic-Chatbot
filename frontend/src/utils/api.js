/**
 * Centralized API utility for making HTTP requests
 * Handles credentials, base URL, and consistent error handling
 */
/// <reference path="../types/chat.d.ts" />

const API_BASE_URL = "http://localhost:5000/api";
export const API_SERVER_URL = "http://localhost:5000";

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, data = undefined) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic fetch wrapper with consistent configuration
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: "include", // Always include cookies for session management
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Try to parse response body
    let data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || "An error occurred";
      throw new APIError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    // Re-throw APIErrors
    if (error instanceof APIError) {
      throw error;
    }
    // Handle network errors
    if (error instanceof TypeError && error.message === "Load failed") {
      throw new APIError("Unable to complete request. Please try again later.");
    }

    // Handle other errors
    throw new APIError(error.message || "An unexpected error occurred");
  }
}

/**
 * Auth API methods
 */
export const authAPI = {
  /**
   * Check current authentication status
   * @returns {Promise<{username: string, email: string}>}
   */
  checkAuth: () => apiRequest("/auth/me"),

  /**
   * Login with credentials
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{username: string, email: string}>}
   */
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Sign up new user
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{username: string, email: string}>}
   */
  signup: (username, email, password) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  /**
   * Logout current user
   * @returns {Promise<{message: string}>}
   */
  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  /**
   * Delete user account (deactivates account)
   * @returns {Promise<{message: string}>}
   */
  deleteAccount: () =>
    apiRequest("/auth/account", {
      method: "DELETE",
    }),
};

/**
 * Chat API methods
 */
export const chatAPI = {
  /**
   * Create a new chat
   * @param {string} name - Optional chat name
   * @returns {Promise<import("../types/chat").CreateChatResponse>}
   */
  createChat: (name = "New Chat") =>
    apiRequest("/chats", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  /**
   * Get all user chats
   * @returns {Promise<import("../types/chat").GetUserChatsResponse>}
   */
  getUserChats: () => apiRequest("/chats"),

  /**
   * Get a specific chat with messages
   * @param {string} chatUuid
   * @returns {Promise<import("../types/chat").GetChatResponse>}
   */
  getChat: (chatUuid) => apiRequest(`/chats/${chatUuid}`),

  /**
   * Add a message to a chat
   * @param {string} chatUuid
   * @param {string} content
   * @param {"user" | "assistant"} role - 'user' or 'assistant'
   * @returns {Promise<import("../types/chat").AddMessageResponse>}
   */
  addMessage: (chatUuid, content, role = "user") =>
    apiRequest(`/chats/${chatUuid}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, role }),
    }),

  /**
   * Delete a chat
   * @param {string} chatUuid
   * @returns {Promise<import("../types/chat").DeleteChatResponse>}
   */
  deleteChat: (chatUuid) =>
    apiRequest(`/chats/${chatUuid}`, {
      method: "DELETE",
    }),

  /**
   * Update chat name
   * @param {string} chatUuid
   * @param {string} name
   * @returns {Promise<import("../types/chat").UpdateChatResponse>}
   */
  updateChat: (chatUuid, name) =>
    apiRequest(`/chats/${chatUuid}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  /**
   * Get the current share link status for a chat
   * @param {string} chatUuid
   * @returns {Promise<import("../types/chat").ShareLinkStatus>}
   */
  getShareLink: (chatUuid) => apiRequest(`/chats/${chatUuid}/share`),

  /**
   * Create a shareable link for a chat
   * @param {string} chatUuid
   * @returns {Promise<import("../types/chat").CreateShareLinkResponse>}
   */
  createShareLink: (chatUuid, regenerate = false) =>
    apiRequest(`/chats/${chatUuid}/share`, {
      method: "POST",
      body: JSON.stringify({ regenerate }),
    }),

  /**
   * Delete/deactivate a shareable link for a chat
   * @param {string} chatUuid
   * @returns {Promise<import("../types/chat").DeleteShareLinkResponse>}
   */
  deleteShareLink: (chatUuid) =>
    apiRequest(`/chats/${chatUuid}/share`, {
      method: "DELETE",
    }),

  /**
   * Get a shared chat by share UUID (public endpoint)
   * @param {string} shareUuid
   * @returns {Promise<import("../types/chat").SharedChatResponse>}
   */
  getSharedChat: (shareUuid) => apiRequest(`/shared/${shareUuid}`),
};

/**
 * File API methods
 */
export const fileAPI = {
  /**
   * Upload a file
   * @param {File} file
   * @returns {Promise<object>}
   */
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest("/files/upload", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
  },
};

export default {
  authAPI,
  chatAPI,
  fileAPI,
  APIError,
};
