"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldError } from "../ui/field";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MaskedInput } from "./MaskedInput";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface IInputHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
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
  format?: string;
  tip?: string;
  required?: boolean;
}

const GRID_COL_SPAN_CLASSES: Record<
  NonNullable<IInputHookFormProps<FieldValues>["colSpan"]>,
  string
> = {
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

function InputHookForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type,
  colSpan = "12",
  format,
  tip,
  required = false,
}: IInputHookFormProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const showTip = !!tip && isFocused;
        const hasError = !!fieldState.error;

        return (
          <Field
            className={cn(
              "col-span-12 flex flex-col gap-1 p-0",
              GRID_COL_SPAN_CLASSES[colSpan]
            )}
          >
            {label && (
              <Label htmlFor={name} className="text-sm font-bold">
                {label}{" "}
                {required && <span className="text-destructive">*</span>}
              </Label>
            )}

            {format ? (
              <MaskedInput
                {...field}
                format={format}
                value={field.value || ""}
                onValueChange={field.onChange}
                id={name}
                type={type}
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "w-full transition-colors",
                  hasError
                    ? "border-2 border-destructive"
                    : showTip
                    ? "border-2 border-info"
                    : ""
                )}
              />
            ) : (
              <Input
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                value={field.value || ""}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "w-full transition-colors",
                  hasError
                    ? "border-2 border-destructive"
                    : showTip
                    ? "border-2 border-info"
                    : ""
                )}
              />
            )}

            <AnimatePresence>
              {showTip && (
                <motion.div
                  key="tip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="inline-flex items-center gap-1 max-w-max bg-info rounded-sm p-1 my-1 text-xs text-white"
                >
                  <AlertCircle size={15} strokeWidth={3} />
                  <span>{tip}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {hasError && (
              <div className="inline-flex items-center gap-1 max-w-max bg-destructive/90 rounded-sm p-1 my-1 text-xs">
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

export { InputHookForm };
