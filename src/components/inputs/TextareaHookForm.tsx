"use client";

import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

interface TextareaHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
  textareaClassName?: string;
  colSpan?: GridColSpan;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  tip?: string;
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

function TextareaHookForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helperText,
  className,
  textareaClassName,
  colSpan = "12",
  rows = 4,
  maxLength,
  showCounter = false,
  tip,
  disabled = false,
  required = false,
}: TextareaHookFormProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error);
        const value = field.value ?? "";
        const characterCount = String(value ?? "").length;
        const showTip = Boolean(tip && isFocused);

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

            <div className="relative">
              <Textarea
                {...field}
                id={name}
                placeholder={placeholder}
                rows={rows}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={(event) => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                onChange={(event) => field.onChange(event.target.value)}
                maxLength={maxLength}
                disabled={disabled}
                aria-invalid={hasError}
                className={cn(
                  hasError
                    ? "border-2 border-destructive"
                    : showTip
                      ? "border-2 border-info"
                      : "",
                  textareaClassName,
                )}
              />

              {showCounter && maxLength && (
                <span className="text-muted-foreground absolute bottom-2 right-3 text-xs">
                  {characterCount}/{maxLength}
                </span>
              )}
            </div>

            <AnimatePresence>
              {showTip && (
                <motion.div
                  key="textarea-tip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="inline-flex max-w-max items-center gap-1 rounded-sm bg-info p-1 text-xs text-white"
                >
                  <AlertCircle size={14} strokeWidth={3} />
                  <span>{tip}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {hasError && (
              <div className="inline-flex max-w-max items-center gap-1 rounded-sm bg-destructive/90 p-1 text-xs text-white">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
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

export { TextareaHookForm };
