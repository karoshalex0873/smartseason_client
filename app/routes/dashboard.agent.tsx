import React from "react";
import { useNavigate } from "react-router";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiGrid,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

import Button from "~/components/Button";
import {
  getCurrentUser,
  getFields,
  signOut,
  type CurrentUser,
  type Field,
} from "~/services/api";
import FieldCard from "~/components/fieldCard";

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

const AgentDashboard = () => {
  const navigate = useNavigate();

  const [agent, setAgent] = React.useState<CurrentUser | null>(null);
  const [fields, setFields] = React.useState<Field[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [fieldsLoading, setFieldsLoading] = React.useState(true);
  const [signingOut, setSigningOut] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldsError, setFieldsError] = React.useState("");

  React.useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setError("");
        const data = await getCurrentUser();

        if (data.user.role !== "Agent") {
          navigate("/dashboard/admin", { replace: true });
          return;
        }

        setAgent(data.user);
      } catch {
        navigate("/auth/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void loadCurrentUser();
  }, [navigate]);

  React.useEffect(() => {
    if (!agent) return;

    const loadFields = async () => {
      try {
        setFieldsError("");
        setFieldsLoading(true);

        // Backend already filters fields for the signed-in agent.
        const data = await getFields();
        const sortedFields = [...(data.fields || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setFields(sortedFields);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load fields";
        setFieldsError(message);
      } finally {
        setFieldsLoading(false);
      }
    };

    void loadFields();
  }, [agent]);

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

  const totalFields = fields.length;
  const activeFields = fields.filter((field) => field.status === "active").length;
  const atRiskFields = fields.filter((field) => field.status === "atRisk").length;
  const completedFields = fields.filter((field) => field.status === "completed").length;

  return (
    <main className="dashboard-page">
      <div className="dashboard-container space-y-8">
        <header className="dashboard-header">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FiUser className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {agent?.name || "Agent"}
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

        <section className="space-y-4">
          <p className="text-2xl font-bold">Start</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Assigned Fields" value={totalFields} icon={FiGrid} />
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
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Done</h2>
            <p className="text-sm text-slate-500">
              Only fields assigned to you are shown here. Open any field to update progress and manage its stage.
            </p>
          </div>

          {fieldsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading fields...
            </div>
          ) : fields.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <FieldCard key={field.id} field={field} showAssignedAgent={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <FiGrid className="empty-state-icon" />
              <p className="empty-state-text text-base font-medium">
                No fields are assigned to you yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AgentDashboard;
