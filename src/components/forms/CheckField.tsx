import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function CheckField({
  label,
  checked,
  onChange,
  hint,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 shadow-none transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-1" />
      <span className="text-base">
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}
