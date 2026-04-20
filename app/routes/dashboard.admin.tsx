import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiEdit3,
  FiGrid,
  FiLogOut,
  FiMail,
  FiPlus,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import Button from "~/components/Button";
import FormField from "~/components/FormField";
import {
  addField,
  addUser,
  deleteUser,
  getCurrentUser,
  getFields,
  getUsers,
  signOut,
  type CurrentUser,
  type Field,
  type ManagedUser,
  type RoleOption,
  updateUser,
} from "~/services/api";
import FieldCard from "~/components/fieldCard";

type FieldFormState = {
  name: string;
  cropType: string;
  plantingDate: string;
  agentId: string;
};

type UserFormState = {
  name: string;
  email: string;
  roleId: string;
};

const EMPTY_FIELD_FORM: FieldFormState = {
  name: "",
  cropType: "",
  plantingDate: "",
  agentId: "",
};

const EMPTY_USER_FORM: UserFormState = {
  name: "",
  email: "",
  roleId: "",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: "default" | "warning" | "success" | "muted";
}) => {
  const iconClass =
    variant === "warning"
      ? "text-amber-600"
      : variant === "success"
        ? "text-emerald-600"
        : variant === "muted"
          ? "text-slate-500"
          : "text-primary";

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="stat-label">{label}</p>
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <p className="stat-value">{value}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = React.useState<CurrentUser | null>(null);
  const [fields, setFields] = React.useState<Field[]>([]);
  const [users, setUsers] = React.useState<ManagedUser[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [fieldsLoading, setFieldsLoading] = React.useState(true);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [signingOut, setSigningOut] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldsError, setFieldsError] = React.useState("");
  const [usersError, setUsersError] = React.useState("");

  const [showAddFieldModal, setShowAddFieldModal] = React.useState(false);
  const [showAddUserModal, setShowAddUserModal] = React.useState(false);
  const [showEditUserModal, setShowEditUserModal] = React.useState(false);
  const [fieldForm, setFieldForm] = React.useState<FieldFormState>(EMPTY_FIELD_FORM);
  const [userForm, setUserForm] = React.useState<UserFormState>(EMPTY_USER_FORM);
  const [fieldModalError, setFieldModalError] = React.useState<string | null>(null);
  const [userModalError, setUserModalError] = React.useState<string | null>(null);
  const [savingField, setSavingField] = React.useState(false);
  const [savingUser, setSavingUser] = React.useState(false);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = React.useState<string | null>(null);

  const loadFields = React.useCallback(async () => {
    try {
      setFieldsError("");
      setFieldsLoading(true);
      const data = await getFields();
      setFields(data.fields || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load fields";
      setFieldsError(message);
    } finally {
      setFieldsLoading(false);
    }
  }, []);

  const loadUsers = React.useCallback(async () => {
    try {
      setUsersError("");
      setUsersLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
      setRoles(data.roles || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setUsersError(message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setError("");
        const data = await getCurrentUser();

        if (data.user.role !== "Admin") {
          navigate("/dashboard/agent", { replace: true });
          return;
        }

        setAdmin(data.user);
      } catch {
        navigate("/auth/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void loadCurrentUser();
  }, [navigate]);

  useEffect(() => {
    void loadFields();
    void loadUsers();
  }, [loadFields, loadUsers]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setError("");
      await signOut();
      navigate("/auth/signin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      setError(message);
    } finally {
      setSigningOut(false);
    }
  };

  const agents = users.filter((user) => user.role === "Agent");
  const totalFields = fields.length;
  const totalUsers = users.length;
  const activeFields = fields.filter((field) => field.status === "active").length;
  const atRiskFields = fields.filter((field) => field.status === "atRisk").length;
  const completedFields = fields.filter((field) => field.status === "completed").length;
  const visibleFields = [...fields].sort((a, b) => a.name.localeCompare(b.name));
  const visibleUsers = [...users].sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));

  const openAddFieldModal = () => {
    setShowAddFieldModal(true);
    setFieldModalError(null);
    setFieldForm({
      ...EMPTY_FIELD_FORM,
      agentId: agents[0]?.id ?? "",
    });
  };

  const closeAddFieldModal = () => {
    setShowAddFieldModal(false);
    setFieldModalError(null);
    setSavingField(false);
    setFieldForm(EMPTY_FIELD_FORM);
  };

  const openAddUserModal = () => {
    setShowAddUserModal(true);
    setUserModalError(null);
    setTemporaryPassword(null);
    setUserForm({
      ...EMPTY_USER_FORM,
      roleId: roles[0]?.id ?? "",
    });
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setUserModalError(null);
    setSavingUser(false);
    setTemporaryPassword(null);
    setUserForm(EMPTY_USER_FORM);
  };

  const openEditUserModal = (user: ManagedUser) => {
    setEditingUserId(user.id);
    setShowEditUserModal(true);
    setUserModalError(null);
    setTemporaryPassword(null);
    setUserForm({
      name: user.name || "",
      email: user.email,
      roleId: user.roleId,
    });
  };

  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setEditingUserId(null);
    setUserModalError(null);
    setSavingUser(false);
    setUserForm(EMPTY_USER_FORM);
  };

  const handleFieldFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFieldForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSavingField(true);
      setFieldModalError(null);
      await addField(fieldForm);
      await loadFields();
      closeAddFieldModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save field";
      setFieldModalError(message);
      setSavingField(false);
    }
  };

  const handleUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSavingUser(true);
      setUserModalError(null);
      const response = await addUser(userForm);
      setTemporaryPassword(response.temporaryPassword);
      await loadUsers();
      setUserForm(EMPTY_USER_FORM);
      setSavingUser(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save user";
      setUserModalError(message);
      setSavingUser(false);
    }
  };

  const handleEditUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingUserId) return;

    try {
      setSavingUser(true);
      setUserModalError(null);
      await updateUser(editingUserId, userForm);
      await loadUsers();
      closeEditUserModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      setUserModalError(message);
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    if (deletingUserId) return;

    const shouldDelete = window.confirm(
      `Delete "${user.name || user.email}"?`
    );

    if (!shouldDelete) return;

    try {
      setDeletingUserId(user.id);
      setUsersError("");
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setUsersError(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-container space-y-8">
        <header className="dashboard-header">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FiUsers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {admin?.name || "Admin"}
              </h1>
              <p className="flex items-center gap-1 text-sm text-slate-500">
                <FiCalendar className="h-3 w-3" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <Button
            type="button"
            label={signingOut ? "Signing out..." : "Sign Out"}
            onClick={handleSignOut}
            disabled={signingOut || loading}
            variant="outline"
            icon={FiLogOut}
            size="sm"
          />
        </header>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FiAlertTriangle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {fieldsError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FiAlertTriangle className="h-5 w-5 shrink-0" />
            <p>{fieldsError}</p>
          </div>
        )}

        {usersError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FiAlertTriangle className="h-5 w-5 shrink-0" />
            <p>{usersError}</p>
          </div>
        )}

        <section className="space-y-4">
          <p className="text-2xl font-bold">Start</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total Fields" value={totalFields} icon={FiGrid} />
            <StatCard label="Users" value={totalUsers} icon={FiUsers} />
            <StatCard
              label="At Risk"
              value={atRiskFields}
              icon={FiAlertTriangle}
              variant="warning"
            />
            <StatCard
              label="Active"
              value={activeFields}
              icon={FiActivity}
              variant="success"
            />
            <StatCard
              label="Completed"
              value={completedFields}
              icon={FiCheckCircle}
              variant="muted"
            />
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Fields</h2>
              <p className="text-sm text-slate-500">
                Fields are listed with the basics only: name, crop type, and agent.
                Click any field to open the full details page.
              </p>
            </div>

            <Button
              type="button"
              label="Add Field"
              icon={FiPlus}
              onClick={openAddFieldModal}
              disabled={agents.length === 0}
            />
          </div>

          {fieldsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading fields...
            </div>
          ) : visibleFields.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleFields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <FiGrid className="empty-state-icon" />
              <p className="empty-state-text text-base font-medium">
                No fields have been added yet.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Users</h2>
              <p className="text-sm text-slate-500">
                Create users here, then assign agent users to fields.
              </p>
            </div>

            <Button
              type="button"
              label="Add User"
              icon={FiUserPlus}
              onClick={openAddUserModal}
              disabled={roles.length === 0}
            />
          </div>

          {usersLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading users...
            </div>
          ) : visibleUsers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {user.name || "No name"}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <FiMail className="h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                    <span className="badge badge-primary">{user.role}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      label="Edit"
                      icon={FiEdit3}
                      size="sm"
                      variant="outline"
                      onClick={() => openEditUserModal(user)}
                    />
                    <Button
                      type="button"
                      label={deletingUserId === user.id ? "Deleting..." : "Delete"}
                      icon={FiTrash2}
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleDeleteUser(user)}
                      disabled={admin?.id === user.id || deletingUserId === user.id}
                      className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <FiUsers className="empty-state-icon" />
              <p className="empty-state-text text-base font-medium">
                No users have been added yet.
              </p>
            </div>
          )}
        </section>
      </div>

      {showAddFieldModal && (
        <div className="modal-backdrop" onClick={closeAddFieldModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Add Field</h3>
                <p className="modal-text">
                  Create a field and assign it to an agent.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeAddFieldModal}
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleFieldSubmit}>
              <FormField
                label="Field Name"
                name="name"
                value={fieldForm.name}
                onChange={handleFieldFormChange}
                placeholder="North Plot"
                required
                disabled={savingField}
              />
              <FormField
                label="Crop Type"
                name="cropType"
                value={fieldForm.cropType}
                onChange={handleFieldFormChange}
                placeholder="Maize"
                required
                disabled={savingField}
              />
              <FormField
                label="Planting Date"
                name="plantingDate"
                type="date"
                value={fieldForm.plantingDate}
                onChange={handleFieldFormChange}
                required
                disabled={savingField}
              />
              <FormField
                label="Assigned Agent"
                name="agentId"
                type="select"
                value={fieldForm.agentId}
                onChange={handleFieldFormChange}
                options={agents.map((agent) => ({
                  label: agent.name || agent.email,
                  value: agent.id,
                }))}
                required
                disabled={savingField}
              />

              {fieldModalError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fieldModalError}
                </div>
              )}

              <div className="modal-actions">
                <Button
                  type="button"
                  label="Cancel"
                  variant="secondary"
                  onClick={closeAddFieldModal}
                  disabled={savingField}
                />
                <Button
                  type="submit"
                  label="Create Field"
                  loading={savingField}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-backdrop" onClick={closeAddUserModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Add User</h3>
                <p className="modal-text">
                  Create a user with a default password and assign a role.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeAddUserModal}
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleUserSubmit}>
              <FormField
                label="Name"
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                placeholder="Jane Doe"
                required
                disabled={savingUser}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                placeholder="jane@example.com"
                required
                disabled={savingUser}
              />
              <FormField
                label="Role"
                name="roleId"
                type="select"
                value={userForm.roleId}
                onChange={handleUserFormChange}
                options={roles.map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
                required
                disabled={savingUser}
              />

              {temporaryPassword && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  User created. Temporary password: <span className="font-semibold">{temporaryPassword}</span>
                </div>
              )}

              {userModalError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {userModalError}
                </div>
              )}

              <div className="modal-actions">
                <Button
                  type="button"
                  label="Cancel"
                  variant="secondary"
                  onClick={closeAddUserModal}
                  disabled={savingUser}
                />
                <Button
                  type="submit"
                  label="Create User"
                  loading={savingUser}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUserModal && (
        <div className="modal-backdrop" onClick={closeEditUserModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Update User</h3>
                <p className="modal-text">
                  Edit the user details and role.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeEditUserModal}
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleEditUserSubmit}>
              <FormField
                label="Name"
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                placeholder="Jane Doe"
                required
                disabled={savingUser}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                placeholder="jane@example.com"
                required
                disabled={savingUser}
              />
              <FormField
                label="Role"
                name="roleId"
                type="select"
                value={userForm.roleId}
                onChange={handleUserFormChange}
                options={roles.map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
                required
                disabled={savingUser}
              />

              {userModalError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {userModalError}
                </div>
              )}

              <div className="modal-actions">
                <Button
                  type="button"
                  label="Cancel"
                  variant="secondary"
                  onClick={closeEditUserModal}
                  disabled={savingUser}
                />
                <Button
                  type="submit"
                  label="Save Changes"
                  loading={savingUser}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
