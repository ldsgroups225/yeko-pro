import type { NumericFormatProps } from 'react-number-format'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { Button } from './ui/button'
import { Input } from './ui/input'

export interface NumberInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  stepper?: number
  thousandSeparator?: string
  placeholder?: string
  defaultValue?: number
  min?: number
  max?: number
  value?: number
  suffix?: string
  prefix?: string
  onValueChange?: (value: number | undefined) => void
  fixedDecimalScale?: boolean
  decimalScale?: number
}

export function NumberInput({ ref, stepper, thousandSeparator, placeholder, defaultValue, min = -Infinity, max = Infinity, onValueChange, fixedDecimalScale = false, decimalScale = 0, suffix, prefix, value: controlledValue, ...props }: NumberInputProps & { ref: React.RefObject<HTMLInputElement> }) {
  // Use controlled value if provided, otherwise fall back to internal state
  const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue)
  const displayValue = controlledValue !== undefined ? controlledValue : internalValue

  const handleIncrement = useCallback(() => {
    const currentValue = controlledValue ?? internalValue ?? 0
    const stepValue = stepper ?? 1
    const newValue = Math.min(currentValue + stepValue, max)
    
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [stepper, max, controlledValue, internalValue, onValueChange, min])

  const handleDecrement = useCallback(() => {
    const currentValue = controlledValue ?? internalValue ?? 0
    const stepValue = stepper ?? 1
    const newValue = Math.max(currentValue - stepValue, min)
    
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [stepper, min, controlledValue, internalValue, onValueChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement
        === (ref as React.RefObject<HTMLInputElement>).current
      ) {
        if (e.key === 'ArrowUp') {
          handleIncrement()
        }
        else if (e.key === 'ArrowDown') {
          handleDecrement()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleIncrement, handleDecrement, ref])

  const handleChange = (values: {
    value: string
    floatValue: number | undefined
  }) => {
    const newValue = values.floatValue === undefined ? undefined : values.floatValue
    
    // Only update internal state if not controlled
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    
    // Always call onValueChange if provided
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  const handleBlur = () => {
    if (internalValue !== undefined) {
      if (internalValue < min) {
        setInternalValue(min);
        (ref as React.RefObject<HTMLInputElement>).current!.value = String(min)
      }
      else if (internalValue > max) {
        setInternalValue(max);
        (ref as React.RefObject<HTMLInputElement>).current!.value = String(max)
      }
    }
  }

  return (
    <div className="flex items-center">
      <NumericFormat
        value={displayValue}
        onValueChange={handleChange}
        thousandSeparator={thousandSeparator}
        decimalScale={decimalScale}
        fixedDecimalScale={fixedDecimalScale}
        allowNegative={min < 0}
        valueIsNumericString
        onBlur={handleBlur}
        max={max}
        min={min}
        suffix={suffix}
        prefix={prefix}
        customInput={Input}
        placeholder={placeholder}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
        getInputRef={ref}
        allowLeadingZeros
        {...props}
      />

      <div className="flex flex-col">
        <Button
          aria-label="Increase value"
          className="px-2 h-5 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
          variant="outline"
          onClick={handleIncrement}
          disabled={internalValue === max}
        >
          <ChevronUp size={15} />
        </Button>
        <Button
          aria-label="Decrease value"
          className="px-2 h-5 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
          variant="outline"
          onClick={handleDecrement}
          disabled={internalValue === min}
        >
          <ChevronDown size={15} />
        </Button>
      </div>
    </div>
  )
}
NumberInput.displayName = 'NumberInput'
