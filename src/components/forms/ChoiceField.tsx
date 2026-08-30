import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "./Field";

export function ChoiceField({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  optional,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-invalid={!!error}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
