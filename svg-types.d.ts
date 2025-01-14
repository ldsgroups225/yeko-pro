declare module '*.svg' {
  import type * as React from 'react'

  const svg: React.FC<React.SVGProps<SVGSVGElement>>
  export default svg
}
