import { Input } from "@/registry/new-york-v4/ui/input";
import { Label } from "@/registry/new-york-v4/ui/label";
// TAMBAHKAN impor dari react-hook-form
import { Controller, Control, FieldError, UseFormRegister } from "react-hook-form";

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  style?: React.CSSProperties;
  defaultValue?: string | number;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  required?: boolean;
  className?: string;
  register?: UseFormRegister<any>;
  control?: Control<any>;
};

const InputField = ({
  label,
  type = "text",
  name,
  defaultValue,
  error,
  style,
  hidden,
  inputProps,
  required = false,
  className = "",
  register,
  control,
}: InputFieldProps) => {
  const isControlled = !!control;

  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2"}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {isControlled ? (
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue || ""}
          render={({ field }) => (
            <Input
              className={className}
              style={style}
              type={type}
              {...field}
              {...inputProps}
              // defaultValue tidak diperlukan di sini karena 'field.value' mengaturnya
            />
          )}
        />
      ) : (
        <Input
          type={type}
          {...(register ? register(name) : {})}
          {...inputProps}
          className={className}
          defaultValue={defaultValue}
          style={style}
        />
      )}

      {error && <p className="text-xs text-red-400">{error.toString()}</p>}
    </div>
  );
};

export default InputField;
