const API_URL = import.meta.env.VITE_API_URL?.trim();

const SIGN_IN_PATH = "/auth/signin";

async function parseErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const errorData = await response.json();
    return errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error(
      "VITE_API_URL is missing. Set it in client/.env for local development."
    );
  }

  return API_URL.replace(/\/+$/, "");
}

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === SIGN_IN_PATH) return;

  window.location.replace(SIGN_IN_PATH);
}

async function handleApiError(response: Response, fallbackMessage: string) {
  const message = await parseErrorMessage(response, fallbackMessage);

  if (response.status === 401) {
    redirectToSignIn();
  }

  throw new Error(message);
}

async function apiRequest<T>(input: string, init: RequestInit, fallbackMessage: string) {
  let response: Response;

  try {
    response = await fetch(input, {
      credentials: "include",
      ...init,
    });
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      (error instanceof Error &&
        /fetch|network|failed|load|econnrefused/i.test(error.message));

    if (isNetworkError) {
      throw new Error(
        "Cannot reach the API server. Check that the backend is running and VITE_API_URL is correct."
      );
    }

    throw error;
  }

  if (!response.ok) {
    await handleApiError(response, fallbackMessage);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`${fallbackMessage}: server returned a non-JSON response.`);
  }

  return response.json() as Promise<T>;
}

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export type RoleOption = {
  id: string;
  name: string;
};

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  roleId: string;
  role: string;
  createdAt: string;
};

type CurrentUserResponse = {
  message: string;
  user: CurrentUser;
};

export type FieldUpdate = {
  id: string;
  notes: string | null;
  createdAt: string;
  stage: string;
  agent: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type Field = {
  id: string;
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  agentId: string | null;
  agent: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  updates: FieldUpdate[];
};

type FieldResponse = {
  message: string;
  fields: Field[];
};

type UsersResponse = {
  message: string;
  users: ManagedUser[];
  roles: RoleOption[];
};

// Authentication APIs
// sign in
export async function signIn(email: string, password: string) {
  const response = await apiRequest<{ user?: CurrentUser; message: string }>(`${getApiBaseUrl()}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
    credentials: "include",
  }, "Failed to sign in")

  if (!response.user) {
    throw new Error("Invalid response from server");
  }

  return response
}

// sign up (admin only)
export async function signUp(userData: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  return apiRequest(`${getApiBaseUrl()}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }, "Failed to sign up");
}

// Get current logged-in user
export async function getCurrentUser() {
  return apiRequest<CurrentUserResponse>(`${getApiBaseUrl()}/auth/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to fetch current user");
}

// sign out
export async function signOut() {
  return apiRequest(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
  }, "Failed to sign out");
}

// Field APIs
// get fields
export async function getFields() {
  return apiRequest<FieldResponse>(`${getApiBaseUrl()}/field`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to fetch fields");
}

// add field
export async function addField(fieldData: {
  name: string;
  cropType: string;
  plantingDate: string;
  agentId: string;
}) {
  return apiRequest(`${getApiBaseUrl()}/field/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fieldData),
  }, "Failed to add field");
}

// get field by id
export async function getFieldById(fieldId: string) {
  return apiRequest<{ message: string; field: Field }>(`${getApiBaseUrl()}/field/${fieldId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to fetch field details");
}

// add field update (notes and stage)
export async function addFieldUpdate(
  fieldId: string,
  updateData: { notes: string; stage: string }
) {
  return apiRequest(`${getApiBaseUrl()}/stage/track/${fieldId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  }, "Failed to add field update");
}

// update field details (name, crop type, planting date, agent)
export async function updateFieldDetails(
  fieldId: string,
  details: {
    name?: string;
    cropType?: string;
    plantingDate?: string;
    agentId?: string;
  }
) {
  return apiRequest(`${getApiBaseUrl()}/field/update/${fieldId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  }, "Failed to update field details");
}

// delete field
export async function deleteField(fieldId: string) {
  return apiRequest(`${getApiBaseUrl()}/field/${fieldId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to delete field");
}

// User Management APIs (Admin Only)
// get users and roles
export async function getUsers() {
  return apiRequest<UsersResponse>(`${getApiBaseUrl()}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to fetch users");
}

// add user (admin only)
export async function addUser(userData: {
  name: string;
  email: string;
  roleId: string;
}) {
  return apiRequest<{
    message: string;
    temporaryPassword: string;
    user: ManagedUser;
  }>(`${getApiBaseUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }, "Failed to add user");
}
// update user details (name, email, role)
export async function updateUser(
  userId: string,
  details: { name?: string; email?: string; roleId?: string }
) {
  return apiRequest(`${getApiBaseUrl()}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  }, "Failed to update user");
}

// delete user
export async function deleteUser(userId: string) {
  return apiRequest(`${getApiBaseUrl()}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Failed to delete user");
}
