import { InputHTMLAttributes, forwardRef } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, ...props }, ref) => {
    return (
      <div className="form-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} ref={ref} {...props} />
        {error ? <small className="field-error">{error}</small> : null}
      </div>
    );
  }
);

FormField.displayName = "FormField";



