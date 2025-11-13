'use client';

import { forwardRef } from 'react';
import { PatternFormat, PatternFormatProps } from 'react-number-format';
import { Input } from '../ui/input';

export type MaskedInputChange = {
    value: string;
    formattedValue: string;
};

type MaskedInputProps = Omit<PatternFormatProps, 'customInput' | 'onValueChange' | 'type'> &
    React.ComponentPropsWithoutRef<typeof Input> & {
        type?: React.HTMLInputTypeAttribute;
        onValueChange?: (values: MaskedInputChange) => void;
    };

const CustomInput = forwardRef<HTMLInputElement>((props, ref) => {
    return <Input {...props} ref={ref} />;
});

CustomInput.displayName = 'CustomInput';

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ format, onValueChange, type, ...props }, ref) => {
        return (
            <PatternFormat
                customInput={CustomInput}
                format={format}
                getInputRef={ref}
                type={type as 'password' | 'tel' | 'text' | undefined}
                onValueChange={(values) => {
                    onValueChange?.({
                        value: values.value,
                        formattedValue: values.formattedValue,
                    });
                }}
                {...props}
            />
        );
    }
);

MaskedInput.displayName = 'MaskedInput';
