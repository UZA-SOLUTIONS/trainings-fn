import { Textarea } from "@/components/ui/textarea";
import { Field } from "./Field";

export function AreaField({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Textarea maxLength={300} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
