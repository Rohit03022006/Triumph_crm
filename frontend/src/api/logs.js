const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const extractErrorMessage = (error, defaultMsg) => {
  if (!error) return defaultMsg;
  if (typeof error === "string") return error;
  return error.error?.message || error.message || defaultMsg;
};

/**
 * Fetch paginated audit logs with search, action, dealType, date filters
 */
export const fetchLogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_URL}/logs?${query.toString()}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch audit logs"));
  }
  return await res.json();
};

/**
 * Fetch summary stats for logs
 */
export const fetchLogStats = async () => {
  const res = await fetch(`${API_URL}/logs/stats`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch log statistics"));
  }
  return (await res.json()).data;
};

/**
 * Fetch audit logs specifically for a property
 */
export const fetchPropertyLogs = async (propertyId) => {
  const res = await fetch(`${API_URL}/logs/property/${propertyId}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch property audit logs"));
  }
  return (await res.json()).data;
};

