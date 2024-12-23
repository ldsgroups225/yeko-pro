import type { ClassValue } from 'clsx'
import {
  createElement,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from './cn'

/**
 * Creates a styled HTML element component with ref support
 * @param tag - HTML tag name
 * @param classNames - Additional class names to apply
 * @returns Styled component
 */
export function se<
  T = HTMLElement,
  P extends HTMLAttributes<T> = HTMLAttributes<T>,
>(tag: ElementType, ...classNames: ClassValue[]) {
  // Use a more explicit type definition
  const StyledComponent = function ({
    className,
    ref,
    children,
    ...props
  }: P & { ref?: React.Ref<T>, children?: ReactNode }) {
    const combinedClassName = cn(...classNames, className)
    return createElement(tag, {
      ref,
      className: combinedClassName,
      ...props,
      children,
    })
  } as React.FC<P & { ref?: React.Ref<T>, children?: ReactNode }>

  // Generate a meaningful display name
  StyledComponent.displayName = `Styled${
    typeof tag === 'string'
      ? tag.charAt(0).toUpperCase() + tag.slice(1)
      : tag.toString()
  }`

  return StyledComponent
}
