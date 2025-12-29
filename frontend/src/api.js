// src/api.js

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

if (!BASE_URL) {
  console.warn("REACT_APP_BACKEND_URL is not set");
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// ----------------------
// API functions
// ----------------------

export const api = {
  // GET /api/items
  getItems(search = "", status = "all") {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    const query = params.toString();
    return request(`/api/items${query ? `?${query}` : ""}`);
  },

  // POST /api/items
  createItem(name) {
    return request("/api/items", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  // GET /api/items/{barcode}
  getItem(barcode) {
    return request(`/api/items/${barcode}`);
  },

  // POST /api/items/{barcode}/checkin
  checkIn(barcode) {
    return request(`/api/items/${barcode}/checkin`, {
      method: "POST",
    });
  },

  // POST /api/items/{barcode}/checkout
  checkOut(barcode) {
    return request(`/api/items/${barcode}/checkout`, {
      method: "POST",
    });
  },

  // GET /api/items/{barcode}/barcode-image
  getBarcodeImage(barcode) {
    return request(`/api/items/${barcode}/barcode-image`);
  },
};
