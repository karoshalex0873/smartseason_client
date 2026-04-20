import { useState, type ChangeEvent } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

export type Option = {
  label: string;
  value: string;
};

export type FormFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "select" | "number" | "textarea" | "date";
  value?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  options?: Option[];
  error?: string;
  placeholder?: string;
  icon?: IconType;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
};

const FormField = ({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  options = [],
  error,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
}: FormFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const isPasswordField = type === "password";
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;
  const hasTrailingControl = isPasswordField || !!error;

  const inputClasses = `
    form-input
    ${Icon ? "pl-10" : ""}
    ${hasTrailingControl ? "pr-11" : ""}
    ${error ? "error" : ""}
  `;

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-label-required">*</span>}
      </label>

      <div className="form-input-wrapper">
        {Icon && (
          <div className="form-input-icon">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {type === "select" ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${inputClasses} min-h-[120px] resize-none`}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            autoComplete={autoComplete}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            autoComplete={autoComplete}
          />
        )}

        {isPasswordField && (
          <button
            type="button"
            className="form-input-toggle"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        )}

        {error && (
          <div className={`form-input-error-icon ${isPasswordField ? "with-toggle" : ""}`}>
            <FiAlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="error-text">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
