import { useNavigate } from "react-router";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

import type { Field } from "~/services/api";

type FieldCardProps = {
  field: Field;
  showAssignedAgent?: boolean;
};

const formatStatus = (status: string) => {
  if (status === "atRisk") return "At Risk";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "atRisk":
      return <FiAlertTriangle className="h-5 w-5 text-amber-600" />;
    case "completed":
      return <FiCheckCircle className="h-5 w-5 text-emerald-600" />;
    default:
      return <FiActivity className="h-5 w-5 text-emerald-600" />;
  }
};

const FieldCard = ({
  field,
  showAssignedAgent = true,
}: FieldCardProps) => {
  const navigate = useNavigate();
  const isAtRisk = field.status === "atRisk";
  const isCompleted = field.status === "completed";

  const cardClass = isAtRisk
    ? "field-card field-card-warning"
    : isCompleted
      ? "field-card field-card-completed"
      : "field-card field-card-active";

  const badgeClass = isAtRisk
    ? "badge badge-warning"
    : isCompleted
      ? "badge badge-muted"
      : "badge badge-primary";

  const handleCardClick = () => {
    navigate(`/fields/${field.id}`);
  };

  return (
    <article
      className={cardClass}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
    >
      <div className="field-card-header">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <FiMapPin className="h-5 w-5 shrink-0 text-primary/60" />
            <h3 className="field-card-title truncate">{field.name}</h3>
          </div>
          <p className="text-sm font-medium text-slate-600">{field.cropType}</p>
        </div>

        <span className={`${badgeClass} flex items-center gap-1.5 shrink-0`}>
          {getStatusIcon(field.status)}
          <span className="text-xs font-bold">{formatStatus(field.status)}</span>
        </span>
      </div>

      {showAssignedAgent && (
        <div className="mt-4 flex items-start gap-2">
          <FiUser className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="dashboard-label">Agent</p>
            <p className="dashboard-value truncate text-sm">
              {field.agent?.name || field.agent?.email || "Unassigned"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2">
        <FiActivity className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="dashboard-label">Stage</p>
          <p className="dashboard-value text-sm capitalize">{field.currentStage}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>Open field details</span>
        <FiChevronRight className="field-card-chevron shrink-0" />
      </div>
    </article>
  );
};

export default FieldCard;
