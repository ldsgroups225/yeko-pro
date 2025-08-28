// app/inscriptions/components/FormFieldWrapper.tsx

import type { ReactNode } from 'react'
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form' // Adjust path as needed

// Define the props for the wrapper component
// Make it generic using the form values (TFieldValues) and field name (TName)
interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** react-hook-form control object */
  control: Control<TFieldValues>
  /** Unique name/key for the field within the form */
  name: TName
  /** Label text or node to display above the input */
  label: ReactNode
  /** Optional description text or node displayed below the input */
  description?: ReactNode
  /** Optional className to apply to the FormItem container */
  className?: string
  /**
   * A function that receives the react-hook-form field and fieldState objects
   * and returns the actual input element (e.g., <Input />, <Select />, <RadioGroup />).
   * You typically spread {...field} onto your input component.
   */
  children: (renderProps: {
    field: ControllerRenderProps<TFieldValues, TName>
    fieldState: ControllerFieldState
  }) => ReactNode
}

/**
 * A generic wrapper around react-hook-form's FormField and shadcn/ui's Form components.
 * Simplifies creating form fields by handling the boilerplate for FormItem, FormLabel,
 * FormControl, FormDescription, and FormMessage.
 *
 * @example Basic Input
 * <FormFieldWrapper control={form.control} name="username" label="Username">
 *   {({ field }) => <Input placeholder="Enter username" {...field} />}
 * </FormFieldWrapper>
 *
 * @example Select
 * <FormFieldWrapper control={form.control} name="role" label="Role">
 *   {({ field }) => (
 *     <Select onValueChange={field.onChange} defaultValue={field.value}>
 *       <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="admin">Admin</SelectItem>
 *         <SelectItem value="user">User</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   )}
 * </FormFieldWrapper>
 */
export function FormFieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  children,
}: FormFieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {/* Render Label */}
          <FormLabel>{label}</FormLabel>

          {/* Render Control (Input) */}
          <FormControl>
            {/* Call the children function, passing field and fieldState */}
            {/* The child function is responsible for rendering the actual input */}
            {children({ field, fieldState })}
          </FormControl>

          {/* Render Description if provided */}
          {description && <FormDescription>{description}</FormDescription>}

          {/* Render Message (for validation errors) */}
          {/* FormMessage automatically connects via FormField context */}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
