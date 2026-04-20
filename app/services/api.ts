const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signin`, {
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

  return response.json();
}

export async function signUp(userData: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign up");
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch current user");
  }

  return response.json() as Promise<CurrentUserResponse>;
}

export async function signOut() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign out");
  }

  return response.json();
}

export async function getFields() {
  const response = await fetch(`${API_URL}/field`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch fields");
  }

  return response.json() as Promise<FieldResponse>;
}

export async function addField(fieldData: {
  name: string;
  cropType: string;
  plantingDate: string;
  agentId: string;
}) {
  const response = await fetch(`${API_URL}/field/add`, {
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

export async function getFieldById(fieldId: string) {
  const response = await fetch(`${API_URL}/field/${fieldId}`, {
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

export async function addFieldUpdate(
  fieldId: string,
  updateData: { notes: string; stage: string }
) {
  const response = await fetch(`${API_URL}/stage/track/${fieldId}`, {
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

export async function updateFieldDetails(
  fieldId: string,
  details: {
    name?: string;
    cropType?: string;
    plantingDate?: string;
    agentId?: string;
  }
) {
  const response = await fetch(`${API_URL}/field/update/${fieldId}`, {
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

export async function deleteField(fieldId: string) {
  const response = await fetch(`${API_URL}/field/${fieldId}`, {
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

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`, {
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

export async function addUser(userData: {
  name: string;
  email: string;
  roleId: string;
}) {
  const response = await fetch(`${API_URL}/users`, {
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

export async function updateUser(
  userId: string,
  details: { name?: string; email?: string; roleId?: string }
) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
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

export async function deleteUser(userId: string) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
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
