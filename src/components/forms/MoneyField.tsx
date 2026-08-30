import { Input } from "@/components/ui/input";
import { formatRwf } from "@/utils/financing";
import { Field } from "./Field";

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  error,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  className?: string;
}) {
  const preview = Number(value) > 0 ? formatRwf(Number(value)) : null;
  return (
    <Field label={label} hint={preview ?? hint} error={error} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          RWF
        </span>
        <Input
          type="number"
          min={0}
          value={value}
          inputMode="numeric"
          aria-invalid={!!error}
          className="pl-12"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Field>
  );
}
