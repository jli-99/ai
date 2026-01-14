// src/api.js

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const API_PREFIX = "/api";

if (!BASE_URL) {
  console.warn("⚠️ REACT_APP_BACKEND_URL is not set");
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      // credentials: "include", // enable later if needed
      ...options,
    });
  } catch (err) {
    throw new Error("Network error: backend is unreachable");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.blob();
}

/* ----------------------
   API methods
---------------------- */

export const api = {
  // GET /api/items
  getItems(search = "", status = "all") {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status !== "all") params.append("status", status);

    const query = params.toString();
    return request(`${API_PREFIX}/items${query ? `?${query}` : ""}`);
  },

  // POST /api/items
  createItem(name) {
    return request(`${API_PREFIX}/items`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  // GET /api/items/{barcode}
  getItem(barcode) {
    return request(`${API_PREFIX}/items/${barcode}`);
  },

  // POST /api/items/{barcode}/checkin
  checkIn(barcode) {
    return request(`${API_PREFIX}/items/${barcode}/checkin`, {
      method: "POST",
    });
  },

  // POST /api/items/{barcode}/checkout
  checkOut(barcode) {
    return request(`${API_PREFIX}/items/${barcode}/checkout`, {
      method: "POST",
    });
  },

  // DELETE /api/items/{barcode}
  deleteItem(barcode) {
    return request(`${API_PREFIX}/items/${barcode}`, {
      method: "DELETE",
    });
  },

  // GET /api/items/{barcode}/barcode-image
  getBarcodeImage(barcode) {
    return request(`${API_PREFIX}/items/${barcode}/barcode-image`);
  },
};

