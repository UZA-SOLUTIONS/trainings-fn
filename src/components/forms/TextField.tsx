import { Input } from "@/components/ui/input";
import { Field } from "./Field";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  hint,
  error,
  optional,
  placeholder,
  inputMode,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      <Input
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
