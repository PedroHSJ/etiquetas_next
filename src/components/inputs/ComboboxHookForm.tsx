"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Field } from "../ui/field";
import { Label } from "../ui/label";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface IComboboxHookFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
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
  service?: (search: string) => Promise<T[]>;
  options?: ComboboxOption[];
  fieldLabel?: keyof T;
  fieldValue?: keyof T;
  displayFields?: (keyof T)[];
  width?: string;
  onSelectOption?: (option: T | ComboboxOption | null) => void;
  required?: boolean;
}

const GRID_COL_SPAN_CLASSES: Record<
  NonNullable<IComboboxHookFormProps<FieldValues>["colSpan"]>,
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

function ComboboxHookForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  colSpan = "12",
  service,
  options,
  fieldLabel,
  fieldValue,
  displayFields,
  width = "100%",
  onSelectOption,
  required = false,
}: IComboboxHookFormProps<T>) {
  const [comboOpen, setComboOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [remoteSearch, setRemoteSearch] = React.useState("");
  const [buttonWidth, setButtonWidth] = React.useState<number | undefined>(
    undefined,
  );
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const queryKey = [name, "options"] as const;
  const hasService = typeof service === "function";

  const {
    data: remoteOptions = [],
    isLoading,
    isError,
    isFetching,
    isRefetching,
  } = useQuery<T[]>({
    queryKey: hasService ? [...queryKey, remoteSearch] : queryKey,
    queryFn: async () => {
      if (!hasService || !service) return [];
      const newOptions = await service(remoteSearch);
      const cachedData = queryClient.getQueryData<T[]>(queryKey);

      if (cachedData && cachedData.length > 0) {
        const map = new Map<string, T>();
        cachedData.forEach((o) => map.set(String(o[fieldValue!]), o));
        newOptions.forEach((o) => map.set(String(o[fieldValue!]), o));
        const merged = Array.from(map.values());
        queryClient.setQueryData(queryKey, merged);
        return merged;
      }

      queryClient.setQueryData(queryKey, newOptions);
      return newOptions;
    },
    enabled: hasService,
  });

  const allOptions = React.useMemo<(T | ComboboxOption)[]>(() => {
    if (hasService) return remoteOptions;
    return options ?? [];
  }, [hasService, options, remoteOptions]);

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return allOptions;

    const term = searchTerm.toLowerCase();

    return allOptions.filter((option) => {
      if ("label" in option) {
        return option.label.toLowerCase().includes(term);
      }

      const data = option as T;

      if (displayFields && displayFields.length > 0) {
        return displayFields.some((field) => {
          const value = data[field];
          return value && String(value).toLowerCase().includes(term);
        });
      }

      if (fieldLabel && data[fieldLabel]) {
        return String(data[fieldLabel]).toLowerCase().includes(term);
      }

      return false;
    });
  }, [allOptions, searchTerm, fieldLabel, displayFields]);

  React.useEffect(() => {
    if (
      hasService &&
      searchTerm.trim() &&
      filteredOptions.length === 0 &&
      !isLoading &&
      !isFetching
    ) {
      const timeout = setTimeout(() => setRemoteSearch(searchTerm), 500);
      return () => clearTimeout(timeout);
    }
  }, [searchTerm, filteredOptions.length, hasService, isLoading, isFetching]);

  React.useEffect(() => {
    if (comboOpen) {
      setSearchTerm("");
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    }
  }, [comboOpen]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const normalizedValue = String(field.value ?? "");
        const selectedOption = allOptions.find((option) => {
          const value =
            "value" in option
              ? option.value
              : fieldValue
                ? String((option as T)[fieldValue])
                : "";
          return String(value) === normalizedValue;
        });

        const buildDisplayText = (option: T | ComboboxOption | undefined) => {
          if (!option) return "";
          if ("label" in option) return option.label;
          const data = option as T;
          if (displayFields && displayFields.length > 0) {
            return displayFields
              .map((f) => String(data[f] ?? ""))
              .filter(Boolean)
              .join(" - ");
          }
          if (fieldLabel && data[fieldLabel]) {
            return String(data[fieldLabel]);
          }
          return "";
        };

        const displayLabel = buildDisplayText(
          selectedOption as T | ComboboxOption,
        );
        const buttonLabel =
          field.value && displayLabel
            ? displayLabel
            : placeholder || "Selecione...";
        const showLoading =
          hasService && (isLoading || isFetching || isRefetching);
        const showError = hasService && isError;

        return (
          <Field
            className={cn(
              "col-span-12 flex flex-col gap-1 p-0",
              GRID_COL_SPAN_CLASSES[colSpan],
            )}
          >
            {label && (
              <Label htmlFor={name} className="text-sm font-bold text-black">
                {label} {required ? "*" : ""}
              </Label>
            )}
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={buttonRef}
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  aria-label={label || placeholder || "Selecione..."}
                  className={cn("flex flex-row justify-start p-2")}
                  style={width ? { width } : undefined}
                >
                  {buttonLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                onWheel={(e) => e.stopPropagation()}
                className="p-0"
                style={{ width: buttonWidth ? `${buttonWidth}px` : width }}
              >
                <Command>
                  <CommandInput
                    placeholder={placeholder || "Buscar..."}
                    className="h-9"
                    autoFocus
                    onValueChange={setSearchTerm}
                  />
                  <CommandList onWheelCapture={(e) => e.stopPropagation()}>
                    {showLoading && <CommandEmpty>Carregando...</CommandEmpty>}
                    {showError && !showLoading && (
                      <CommandEmpty>Erro ao buscar opções.</CommandEmpty>
                    )}
                    {!showLoading &&
                      !showError &&
                      filteredOptions.length === 0 && (
                        <CommandEmpty>Opções não encontradas.</CommandEmpty>
                      )}
                    <CommandGroup>
                      {filteredOptions.map((option) => {
                        const value =
                          "value" in option
                            ? option.value
                            : fieldValue
                              ? String((option as T)[fieldValue])
                              : "";
                        const labelText = buildDisplayText(
                          option as T | ComboboxOption,
                        );
                        const isSelected = normalizedValue === value;

                        return (
                          <CommandItem
                            key={`${value}-${labelText}`}
                            value={labelText}
                            onSelect={() => {
                              field.onChange(value);
                              setComboOpen(false);
                              onSelectOption?.(option);
                            }}
                            className={cn(
                              isSelected && "bg-accent text-accent-foreground",
                            )}
                          >
                            {labelText}
                            <Check
                              className={cn(
                                "ml-auto",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        );
      }}
    />
  );
}

export { ComboboxHookForm };
