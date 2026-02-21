"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slider } from "../ui/slider";
import { Label } from "@radix-ui/react-label";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "../ui/input";
import { FieldLabel } from "../ui/field";

interface IRangeHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  max?: number;
  min?: number;
  step?: number;
  defaultValue?: [number, number];
  required?: boolean;
}

function RangeHookForm<T extends FieldValues>({
  control,
  name,
  label,
  max = 500,
  min = 0,
  step = 1,
  defaultValue = [0, 500],
  required = false,
}: IRangeHookFormProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue as T[Path<T>]}
      render={({ field, fieldState }) => {
        const value = Array.isArray(field.value) ? field.value : defaultValue;
        const [from, to] = value;

        const handleInputChange = (index: 0 | 1, inputValue: string) => {
          // Permitir campo vazio
          // if (inputValue === '') {
          //     return;
          // }

          const numValue = parseInt(inputValue, 10);
          if (isNaN(numValue)) return;

          const newValue = [...value];
          newValue[index] = Math.max(min, Math.min(max, numValue));

          // Garantir que from <= to
          if (index === 0 && newValue[0] > newValue[1]) {
            newValue[1] = newValue[0];
          } else if (index === 1 && newValue[1] < newValue[0]) {
            newValue[0] = newValue[1];
          }

          field.onChange(newValue);
        };

        const handleInputBlur = (index: 0 | 1, inputValue: string) => {
          // Se o campo estiver vazio ao perder o foco, restaurar o valor mínimo ou máximo
          if (inputValue === "") {
            const newValue = [...value];
            newValue[index] = index === 0 ? min : max;
            field.onChange(newValue);
          }
        };

        return (
          <div className="w-full max-w-sm mx-auto space-y-2">
            {label && (
              <Label htmlFor={name} className="text-sm font-bold">
                {label} {required ? "*" : ""}
              </Label>
            )}
            <div className="w-full flex items-center justify-between gap-2 mt-2">
              <Input
                id={`${name}-from`}
                type="number"
                value={from ?? ""}
                onChange={(e) => handleInputChange(0, e.target.value)}
                onBlur={(e) => handleInputBlur(0, e.target.value)}
                min={min}
                max={max}
                className="w-15 h-8 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Slider
                value={value}
                onValueChange={(newValue) => {
                  field.onChange(newValue);
                }}
                max={max}
                min={min}
                step={step}
                className="flex-1"
              />
              <Input
                id={`${name}-to`}
                type="number"
                value={to ?? ""}
                onChange={(e) => handleInputChange(1, e.target.value)}
                onBlur={(e) => handleInputBlur(1, e.target.value)}
                min={min}
                max={max}
                className="w-15 h-8 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}

export { RangeHookForm };
