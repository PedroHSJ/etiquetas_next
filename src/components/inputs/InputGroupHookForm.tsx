"use client";

import { Children, Fragment, ReactNode, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Label } from "@radix-ui/react-label";

import { cn } from "@/lib/utils";
import { Field, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

type GridColSpan =
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

interface InputGroupHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  tip?: string;
  className?: string;
  groupClassName?: string;
  inputClassName?: string;
  startAddons?: ReactNode | ReactNode[];
  endAddons?: ReactNode | ReactNode[];
  colSpan?: GridColSpan;
  disabled?: boolean;
  required?: boolean;
}

const GRID_COL_SPAN_CLASSES: Record<GridColSpan, string> = {
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

function InputGroupHookForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helperText,
  type = "text",
  tip,
  className,
  groupClassName,
  inputClassName,
  startAddons,
  endAddons,
  colSpan = "12",
  disabled = false,
  required = false,
}: InputGroupHookFormProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const renderAddons = (
    addons: ReactNode | ReactNode[],
    position: "start" | "end",
  ) => {
    if (!addons) return null;
    return Children.toArray(addons).map((addon, index) => (
      <Fragment key={`${position}-addon-${index}`}>{addon}</Fragment>
    ));
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error);
        const showTip = Boolean(tip && isFocused);
        const value = field.value ?? "";

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

            <InputGroup className={cn(groupClassName)}>
              {renderAddons(startAddons, "start")}
              <InputGroupInput
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                aria-invalid={hasError}
                className={cn(
                  hasError
                    ? "border-2 border-destructive"
                    : showTip
                      ? "border-2 border-info"
                      : "",
                  inputClassName,
                )}
                onFocus={() => {
                  setIsFocused(true);
                }}
                onBlur={(event) => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                onChange={(event) => field.onChange(event)}
              />
              {renderAddons(endAddons, "end")}
            </InputGroup>

            <AnimatePresence>
              {showTip && (
                <motion.div
                  key="input-group-tip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="inline-flex items-center gap-1 max-w-max bg-info rounded-sm p-1 text-xs text-white"
                >
                  <AlertCircle size={15} strokeWidth={3} />
                  <span>{tip}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {hasError && (
              <div className="inline-flex items-center gap-1 max-w-max bg-destructive/90 rounded-sm p-1 text-xs text-white">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white">
                  <X className="text-destructive" size={10} strokeWidth={5} />
                </div>
                <FieldError
                  className="text-white text-xs"
                  errors={[fieldState.error]}
                />
              </div>
            )}
          </Field>
        );
      }}
    />
  );
}

export { InputGroupHookForm };
