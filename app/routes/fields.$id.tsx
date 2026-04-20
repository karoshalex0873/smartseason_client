import React, {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiInfo,
  FiMapPin,
  FiMessageSquare,
  FiTrash2,
  FiTrendingUp,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";

import Button from "~/components/Button";
import FormField from "~/components/FormField";
import {
  addFieldUpdate,
  deleteField,
  getCurrentUser,
  getFieldById,
  getUsers,
  type CurrentUser,
  type Field,
  type ManagedUser,
  updateFieldDetails,
} from "~/services/api";

const STAGE_OPTIONS = [
  { label: "Planted", value: "planted" },
  { label: "Growing", value: "growing" },
  { label: "Ready", value: "ready" },
  { label: "Harvested", value: "harvested" },
];

const STAGES = ["planted", "growing", "ready", "harvested"] as const;
type Stage = (typeof STAGES)[number];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Helper to compute days since planting
const getDaysSincePlanting = (plantingDate: string) => {
  const planted = new Date(plantingDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - planted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    active: { icon: FiActivity, color: "emerald", label: "Active" },
    atRisk: { icon: FiAlertTriangle, color: "amber", label: "At Risk" },
    completed: { icon: FiCheckCircle, color: "slate", label: "Completed" },
  };
  const { icon: Icon, color, label } = config[status as keyof typeof config] || config.active;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-${color}-100 text-${color}-700`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

// Stage Stepper Component
const StageStepper = ({ currentStage }: { currentStage: string }) => {
  const currentIndex = STAGES.indexOf(currentStage as Stage);

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 bg-slate-200" />
      <div className="relative space-y-6">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = stage === currentStage;
          const isPending = index > currentIndex;

          return (
            <div key={stage} className="flex items-start gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                {isCompleted ? (
                  <FiCheck className="h-5 w-5 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium capitalize ${isCurrent ? 'text-primary' : 'text-slate-700'}`}>
                  {stage}
                </p>
                <p className="text-xs text-slate-500">
                  {isCompleted ? 'Completed' : isCurrent ? 'Current stage' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function FieldDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [agents, setAgents] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [fieldForm, setFieldForm] = useState({
    name: "",
    cropType: "",
    plantingDate: "",
    agentId: "",
  });
  const [progressForm, setProgressForm] = useState({
    stage: "",
    notes: "",
  });

  const [fieldFormMessage, setFieldFormMessage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [fieldSaving, setFieldSaving] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [deletingField, setDeletingField] = useState(false);

  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(true);

  const canEditField = user?.role === "Admin" || user?.role === "Agent";
  const canDeleteField = user?.role === "Admin";
  const daysSincePlanting = field ? getDaysSincePlanting(field.plantingDate) : 0;

  const syncForms = (nextField: Field) => {
    setFieldForm({
      name: nextField.name,
      cropType: nextField.cropType,
      plantingDate: nextField.plantingDate.slice(0, 10),
      agentId: nextField.agent?.id ?? "",
    });
    setProgressForm((prev) => ({
      stage: nextField.currentStage,
      notes: prev.notes,
    }));
  };

  useEffect(() => {
    if (!id) {
      setPageError("Field id is missing.");
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        setPageError(null);

        const [userData, fieldData] = await Promise.all([
          getCurrentUser(),
          getFieldById(id),
        ]);

        setUser(userData.user);
        setField(fieldData.field);
        syncForms(fieldData.field);

        if (userData.user.role === "Admin") {
          const usersData = await getUsers();
          setAgents(usersData.users.filter((item) => item.role === "Agent"));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load field details";
        setPageError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [id]);

  const refreshField = async () => {
    if (!id) return;

    const fieldData = await getFieldById(id);
    setField(fieldData.field);
    syncForms(fieldData.field);
  };

  const handleFieldFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFieldForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setProgressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!id) return;

    try {
      setFieldSaving(true);
      setFieldFormMessage(null);

      await updateFieldDetails(id, {
        name: fieldForm.name,
        cropType: fieldForm.cropType,
        plantingDate: fieldForm.plantingDate,
        ...(user?.role === "Admin" ? { agentId: fieldForm.agentId } : {}),
      });
      await refreshField();
      setFieldFormMessage("Field details updated.");
      setShowFieldForm(false);
    } catch (error) {
      setFieldFormMessage(
        error instanceof Error ? error.message : "Failed to update field."
      );
    } finally {
      setFieldSaving(false);
    }
  };

  const handleProgressSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!id) return;

    try {
      setProgressSaving(true);
      setProgressMessage(null);

      await addFieldUpdate(id, progressForm);
      await refreshField();
      setProgressForm((prev) => ({ ...prev, notes: "" }));
      setProgressMessage("Stage progress saved.");
    } catch (error) {
      setProgressMessage(
        error instanceof Error ? error.message : "Failed to save progress."
      );
    } finally {
      setProgressSaving(false);
    }
  };

  const handleDeleteField = async () => {
    if (!id || !canDeleteField || deletingField) return;

    const shouldDelete = window.confirm(
      `Delete "${field?.name}"? This will also remove its progress history.`
    );

    if (!shouldDelete) return;

    try {
      setDeletingField(true);
      setPageError(null);
      await deleteField(id);
      navigate("/dashboard/admin");
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to delete field."
      );
      setDeletingField(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="flex h-64 items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading field details...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !field) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container space-y-4">
          <Button
            type="button"
            label="Back to Dashboard"
            variant="outline"
            icon={FiArrowLeft}
            onClick={() => navigate(user?.role === "Admin" ? "/dashboard/admin" : "/dashboard/agent")}
          />
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-4 font-medium text-red-700">
              {pageError || "Field not found."}
            </p>
            <Button
              className="mt-6"
              label="Return to Dashboard"
              onClick={() => navigate(user?.role === "Admin" ? "/dashboard/admin" : "/dashboard/agent")}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page pb-12">
      <div className="dashboard-container space-y-6">
        {/* Breadcrumb and Header */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to={user?.role === "Admin" ? "/dashboard/admin" : "/dashboard/agent"}
            className="text-slate-500 hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <FiChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{field.name}</span>
        </div>

        {/* Hero Card */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-white shadow-sm ring-1 ring-slate-200/60">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <FiMapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {field.name}
                    </h1>
                    <p className="text-sm text-slate-500">
                      {field.cropType} • Day {daysSincePlanting} of season
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={field.status} />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    <FiUser className="h-3.5 w-3.5" />
                    {field.agent?.name || field.agent?.email || "Unassigned"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <FiCalendar className="h-3.5 w-3.5" />
                    Planted {formatDate(field.plantingDate)}
                  </span>
                </div>
              </div>

              <Button
                label="Back to Dashboard"
                variant="outline"
                icon={FiArrowLeft}
                onClick={() => navigate(user?.role === "Admin" ? "/dashboard/admin" : "/dashboard/agent")}
              />

              {canDeleteField && (
                <Button
                  label={deletingField ? "Deleting..." : "Delete Field"}
                  variant="secondary"
                  icon={FiTrash2}
                  onClick={handleDeleteField}
                  disabled={deletingField}
                  className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Stage Tracking & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stage Progress Tracker */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <FiTrendingUp className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Growth Stage</h2>
                    <p className="text-sm text-slate-500">Track field progression</p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-900">Current: </span>
                  <span className="capitalize text-primary">{field.currentStage}</span>
                </div>
              </div>
              <StageStepper currentStage={field.currentStage} />
            </div>

            {/* Update Progress Card (Primary Action for Agents) */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <FiMessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Update Progress</h2>
                  <p className="text-sm text-slate-500">Record new stage and observations</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleProgressSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Stage"
                    name="stage"
                    type="select"
                    value={progressForm.stage}
                    onChange={handleProgressChange}
                    options={STAGE_OPTIONS}
                    required
                    disabled={progressSaving}
                  />
                  <div className="flex items-end">
                    <p className="text-sm text-slate-500">
                      {progressForm.stage === field.currentStage
                        ? "Same as current stage"
                        : "Will advance to next stage"}
                    </p>
                  </div>
                </div>
                <FormField
                  label="Observation Notes"
                  name="notes"
                  type="textarea"
                  value={progressForm.notes}
                  onChange={handleProgressChange}
                  placeholder="What's the condition? Moisture level? Pest presence?"
                  disabled={progressSaving}
                />

                {progressMessage && (
                  <p
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${progressMessage.includes("saved")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                      }`}
                  >
                    {progressMessage}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    label="Save Progress"
                    loading={progressSaving}
                    size="lg"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Field Details & History */}
          <div className="space-y-6">
            {/* Field Information Card */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiInfo className="h-5 w-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-900">Field Details</h3>
                </div>
                {canEditField && (
                  <button
                    onClick={() => setShowFieldForm(!showFieldForm)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors"
                  >
                    <FiEdit3 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showFieldForm && canEditField ? (
                <form className="space-y-4" onSubmit={handleFieldSubmit}>
                  <FormField
                    label="Field Name"
                    name="name"
                    value={fieldForm.name}
                    onChange={handleFieldFormChange}
                    required
                    disabled={fieldSaving}
                  />
                  <FormField
                    label="Crop Type"
                    name="cropType"
                    value={fieldForm.cropType}
                    onChange={handleFieldFormChange}
                    required
                    disabled={fieldSaving}
                  />
                  <FormField
                    label="Planting Date"
                    name="plantingDate"
                    type="date"
                    value={fieldForm.plantingDate}
                    onChange={handleFieldFormChange}
                    required
                    disabled={fieldSaving}
                  />

                  {user?.role === "Admin" && (
                    <div className="flex items-center gap-2">
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
                        disabled={fieldSaving}
                      />
                      <p className="text-xs text-slate-500">
                        Leave the agent selection blank to unassign this field.
                      </p>
                    </div>
                  )}

                  {fieldFormMessage && (
                    <p
                      className={`rounded-xl px-4 py-2 text-sm ${fieldFormMessage.includes("updated")
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                        }`}
                    >
                      {fieldFormMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" label="Save" loading={fieldSaving} size="sm" />
                    <Button
                      type="button"
                      label="Cancel"
                      variant="outline"
                      onClick={() => setShowFieldForm(false)}
                      size="sm"
                    />
                  </div>
                </form>
              ) : (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Crop Type</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{field.cropType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Planting Date</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(field.plantingDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Days Since Planting</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{daysSincePlanting} days</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Agent</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">
                      {field.agent?.name || field.agent?.email || "Unassigned"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Updates</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{field.updates.length}</dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Status Explanation Card */}
            {field.status === "atRisk" && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Why is this field at risk?</h4>
                    <p className="mt-1 text-sm text-amber-800">
                      {daysSincePlanting > 45
                        ? `Field has been in ${field.currentStage} stage for over 45 days since planting.`
                        : "Field may need attention due to lack of recent updates."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress History */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-4 flex items-center gap-2">
                <FiClock className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Update History</h3>
              </div>

              <div className="space-y-3">
                {field.updates.length > 0 ? (
                  [...field.updates]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((update) => (
                      <div
                        key={update.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                                {update.stage}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDate(update.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">
                              {update.notes || "No notes provided."}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          by {update.agent?.name || update.agent?.email}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <FiMessageSquare className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">No updates recorded yet</p>
                    <p className="text-xs text-slate-400">Updates will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
