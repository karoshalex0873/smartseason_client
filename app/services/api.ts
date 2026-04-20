const API_URL = import.meta.env.VITE_API_URL?.trim();

const baseUrl = API_URL;

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

type SignInResponse = {
  message: string;
  user: CurrentUser | { role?: string | { name?: string } };
};

// api to signIn
async function signIn(email: string, password: string) {
  const response = await fetch(`${baseUrl}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign in");
  }
  const data = (await response.json()) as SignInResponse;
  if (!data.user) {
    throw new Error("Invalid response from server");
  }
  return data;
}

// api to signOut
async function signOut() {
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign out");
  }
  return response.json();
}

// api to get current user
async function getCurrentUser() {
  const response = await fetch(`${baseUrl}/auth/current`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch current user");
  }
  return response.json() as Promise<CurrentUserResponse>;
}

// api to get fields
async function getFields() {
  const response = await fetch(`${baseUrl}/field`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch fields");
  }
  return response.json() as Promise<FieldResponse>;
}

// add field
async function addField(fieldData: {
  name: string;
  cropType: string;
  plantingDate: string;
  agentId: string;
}) {
  const response = await fetch(`${baseUrl}/field/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(fieldData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add field");
  }
  return response.json();
}

// get field by id
async function getFieldById(fieldId: string) {
  const response = await fetch(`${baseUrl}/field/${fieldId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch field details");
  }
  return response.json() as Promise<{ message: string; field: Field }>;
}

// add field update (notes and stage)
async function addFieldUpdate(
  fieldId: string,
  updateData: { notes: string; stage: string }
) {
  const response = await fetch(`${baseUrl}/stage/track/${fieldId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add field update");
  }
  return response.json();
}

// update field details (name, crop type, planting date, agent)
async function updateFieldDetails(
  fieldId: string,
  details: {
    name?: string;
    cropType?: string;
    plantingDate?: string;
    agentId?: string;
  }
) {
  const response = await fetch(`${baseUrl}/field/update/${fieldId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update field details");
  }
  return response.json();
}

// delete field
async function deleteField(fieldId: string) {
  const response = await fetch(`${baseUrl}/field/${fieldId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete field");
  }
  return response.json();
}

// User Management APIs (Admin Only)
// get users and roles
async function getUsers() {
  const response = await fetch(`${baseUrl}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch users");
  }
  return response.json() as Promise<UsersResponse>;
}

// add user (admin only)
async function addUser(userData: {
  name: string;
  email: string;
  roleId: string;
}) {
  const response = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add user");
  }
  return response.json() as Promise<{
    message: string;
    temporaryPassword: string;
    user: ManagedUser;
  }>;
}

// update user details (name, email, role)
async function updateUser(
  userId: string,
  details: { name?: string; email?: string; roleId?: string }
) {
  const response = await fetch(`${baseUrl}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user");
  }
  return response.json();
}

// delete user
async function deleteUser(userId: string) {
  const response = await fetch(`${baseUrl}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user");
  }
  return response.json();
}

export {
  signIn,
  signOut,
  getCurrentUser,
  getFields,
  addField,
  getFieldById,
  addFieldUpdate,
  updateFieldDetails,
  deleteField,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
};
