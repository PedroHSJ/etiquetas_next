"use client";

import { Label } from "@radix-ui/react-label";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type RadioGroupColSpan =
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

export type RadioGroupOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

interface RadioGroupHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: RadioGroupOption[];
  label?: string;
  helperText?: string;
  className?: string;
  optionClassName?: string;
  colSpan?: RadioGroupColSpan;
  direction?: "vertical" | "horizontal";
  disabled?: boolean;
  required?: boolean;
}

const GRID_COL_SPAN_CLASSES: Record<RadioGroupColSpan, string> = {
  "1": "sm:col-span-1 md:col-span-1",
  "2": "sm:col-span-2 md:col-span-2",
  "3": "sm:col-span-3 md:col-span-3",
  "4": "sm:col-span-4 md:col-span-4",
  "5": "sm:col-span-5 md:col-span-5",
  "6": "sm:col-span-6 md:col-span-6",
  "7": "sm:col-span-7 md:col-span-7",
  "8": "sm:col-span-8 md:col-span-8",
  "9": "sm:col-span-9 md:col-span-9",
  "10": "sm:col-span-10 md:col-span-10",
  "11": "sm:col-span-11 md:col-span-11",
  "12": "sm:col-span-12 md:col-span-12",
};

const RADIO_GROUP_LAYOUT: Record<
  NonNullable<RadioGroupHookFormProps<FieldValues>["direction"]>,
  string
> = {
  vertical: "flex flex-col gap-3",
  horizontal: "flex flex-wrap gap-3",
};

function RadioGroupHookForm<T extends FieldValues>({
  control,
  name,
  options,
  label,
  helperText,
  className,
  optionClassName,
  colSpan = "12",
  direction = "vertical",
  disabled = false,
  required = false,
}: RadioGroupHookFormProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error);
        const normalizedValue =
          field.value === undefined || field.value === null
            ? ""
            : String(field.value);

        return (
          <Field
            data-invalid={hasError || undefined}
            className={cn(
              "col-span-12 flex flex-col gap-2 p-0",
              GRID_COL_SPAN_CLASSES[colSpan],
              className,
            )}
          >
            {label && (
              <Label
                htmlFor={name}
                className="text-sm font-bold text-foreground"
              >
                {label} {required ? "*" : ""}
              </Label>
            )}

            {helperText && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}

            <RadioGroup
              value={normalizedValue}
              onValueChange={(value) => {
                if (disabled) return;
                field.onChange(value);
                field.onBlur();
              }}
              className={cn("mt-1", RADIO_GROUP_LAYOUT[direction])}
            >
              {options.map((option) => {
                const optionId = `${name}-${option.value}`;

                return (
                  <Label
                    key={option.value}
                    htmlFor={optionId}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-md border border-input bg-background/70 p-3 text-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary/5",
                      optionClassName,
                      (disabled || option.disabled) &&
                        "cursor-not-allowed opacity-60",
                    )}
                  >
                    <RadioGroupItem
                      id={optionId}
                      value={option.value}
                      disabled={disabled || option.disabled}
                      className="mt-1"
                    />

                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-none">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground leading-snug">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>

            {hasError && (
              <FieldError className="text-xs" errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}

export { RadioGroupHookForm };
