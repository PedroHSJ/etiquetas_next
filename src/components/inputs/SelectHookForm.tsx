import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { Field, FieldError } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  colSpan?:
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12";
  required?: boolean;
}

export function SelectHookForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled,
  className,
  triggerClassName,
  colSpan,
  required = false,
}: SelectHookFormProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error;
        const hasError = Boolean(error);
        const value = (field.value ?? "") as string;

        return (
          <Field
            className={cn(
              `flex flex-col gap-1 col-span-12 sm:col-span-${colSpan} md:col-span-${colSpan}`,
              className,
            )}
          >
            {label && (
              <Label htmlFor={name} className="text-sm font-bold">
                {label} {required ? "*" : ""}
              </Label>
            )}

            <Select
              value={value}
              onValueChange={(val) => {
                field.onChange(val);
                field.onBlur();
              }}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                className={cn(
                  "w-full",
                  triggerClassName,
                  hasError && "border-[1.5px] border-destructive",
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{label}</SelectLabel>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {hasError && (
              <div className="mt-2 inline-flex max-w-max items-center gap-2 rounded-sm bg-destructive px-2 py-1 text-xs text-white">
                <X className="h-3.5 w-3.5" />
                <FieldError className="text-white" errors={[error]} />
              </div>
            )}
          </Field>
        );
      }}
    />
  );
}
