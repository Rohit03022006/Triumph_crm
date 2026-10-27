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

export const fetchInventoryMasterData = async () => {
  const res = await fetch(`${API_URL}/inventory/master-data`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to load inventory master data"));
  }
  return (await res.json()).data;
};

export const fetchInventoryMetrics = async () => {
  const res = await fetch(`${API_URL}/inventory/metrics`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to load inventory metrics"));
  }
  return (await res.json()).data;
};

export const fetchProperties = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_URL}/inventory?${query.toString()}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch properties"));
  }
  return await res.json();
};

export const fetchPropertyById = async (id) => {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch property details"));
  }
  return (await res.json()).data;
};

export const createProperty = async (data) => {
  const res = await fetch(`${API_URL}/inventory`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to create property"));
  }
  return await res.json();
};

export const updateProperty = async ({ id, data }) => {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to update property"));
  }
  return await res.json();
};

export const deleteProperty = async (id) => {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to delete property"));
  }
  return await res.json();
};

export const approveProperty = async (id) => {
  const res = await fetch(`${API_URL}/inventory/${id}/approve`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to approve property"));
  }
  return await res.json();
};

export const rejectProperty = async (id, reason) => {
  const res = await fetch(`${API_URL}/inventory/${id}/reject`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to submit review feedback"));
  }
  return await res.json();
};

export const uploadInventoryFiles = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  const res = await fetch(`${API_URL}/inventory/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to upload files"));
  }
  return (await res.json()).data;
};

export const fetchProjectUnits = async (propertyId) => {
  const res = await fetch(`${API_URL}/inventory/${propertyId}/units`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch project units"));
  }
  return (await res.json()).data;
};

export const createProjectUnit = async ({ propertyId, data }) => {
  const res = await fetch(`${API_URL}/inventory/${propertyId}/units`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to create unit"));
  }
  return (await res.json()).data;
};

export const updateProjectUnit = async ({ unitId, data }) => {
  const res = await fetch(`${API_URL}/inventory/units/${unitId}`, {
    method: "PATCH",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to update unit"));
  }
  return (await res.json()).data;
};

export const deleteProjectUnit = async (unitId) => {
  const res = await fetch(`${API_URL}/inventory/units/${unitId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to delete unit"));
  }
  return await res.json();
};

export const tagUnitToLead = async ({ unitId, leadId }) => {
  const res = await fetch(`${API_URL}/inventory/units/${unitId}/tag`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ leadId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to tag unit to lead"));
  }
  return (await res.json()).data;
};

export const fetchInventoryLogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_URL}/inventory/logs?${query.toString()}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch inventory audit logs"));
  }
  return await res.json();
};

export const fetchPropertyLogs = async (propertyId) => {
  const res = await fetch(`${API_URL}/inventory/${propertyId}/logs`, {
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, "Failed to fetch property audit logs"));
  }
  return (await res.json()).data;
};

