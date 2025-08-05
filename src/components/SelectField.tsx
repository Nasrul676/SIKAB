import { Label } from "@/registry/new-york-v4/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york-v4/ui/select";
// Add Controller and Control types
import { Controller, Control, FieldError, UseFormRegister } from "react-hook-form";

type SelectFieldProps = {
  label: string;
  name: string;
  data: { id: number | string; name: string }[];
  defaultValue?: string | number;
  error?: FieldError;
  required?: boolean;
  onChange?: (value: string) => void;
  // Make both props optional
  control?: Control<any>;
  register?: UseFormRegister<any>;
};

const SelectField = ({
  label,
  name,
  data,
  defaultValue,
  error,
  required = false,
  onChange,
  control, // Can be undefined
  register, // Can be undefined
}: SelectFieldProps) => {
  // NEW: The component now handles both patterns
  const isControlled = !!control;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {isControlled ? (
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue || ""}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                if (onChange) onChange(value);
              }}
              value={field.value}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {data.map((dt) => (
                  <SelectItem value={dt.id.toString()} key={dt.id}>
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <Select {...(register ? register(name) : {})} defaultValue={defaultValue?.toString()} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {data.map((dt) => (
              <SelectItem value={dt.id.toString()} key={dt.id}>
                {dt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-xs text-red-400">{error.toString()}</p>}
    </div>
  );
};

export default SelectField;
