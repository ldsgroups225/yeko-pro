import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type BaseInputProps = Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'autoComplete' | 'onBlur' | 'onFocus' | 'style'
>

type BasePhoneInputProps = Omit<
  RPNInput.Props<typeof RPNInput.default>,
  'onChange' | 'ref' | 'autoComplete' | 'onBlur' | 'onFocus' | 'style'
>

export interface PhoneInputProps extends BaseInputProps, BasePhoneInputProps {
  onChange?: (value: RPNInput.Value) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  style?: React.CSSProperties
}

export function PhoneInput({ ref, className, onChange, ...props }: PhoneInputProps & { ref: React.RefObject<React.ElementRef<typeof RPNInput.default>> }) {
  return (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      onChange={value => onChange?.(value || ('' as RPNInput.Value))}
      {...props}
    />
  )
}

PhoneInput.displayName = 'PhoneInput'

function InputComponent(
  { ref, className, ...props }: React.ComponentProps<'input'> & { ref: React.RefObject<HTMLInputElement> },
) {
  return (
    <Input
      ref={ref}
      className={cn('rounded-e-lg rounded-s-none', className)}
      {...props}
    />
  )
}
InputComponent.displayName = 'InputComponent'

interface CountryEntry {
  label: string
  value: RPNInput.Country | undefined
}

interface CountrySelectProps {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

function CountrySelect({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown
            className={cn(
              '-mr-2 w-4 h-4 opacity-50',
              disabled ? 'hidden' : 'opacity-100',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value
                    ? (
                        <CountrySelectOption
                          key={value}
                          country={value}
                          countryName={label}
                          selectedCountry={selectedCountry}
                          onChange={onChange}
                        />
                      )
                    : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
}: CountrySelectOptionProps) {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">
        {`+${RPNInput.getCountryCallingCode(country)}`}
      </span>
      <CheckIcon
        className={`ml-auto size-4 ${
          country === selectedCountry ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </CommandItem>
  )
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
  const Flag = flags[country]
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

export default PhoneInput
