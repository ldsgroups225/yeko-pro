'use client';

import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { SchoolProvider } from "@/providers/SchoolProvider";
import { Suspense } from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ConvexClientProvider>
        <SchoolProvider>
          {children}
        </SchoolProvider>
      </ConvexClientProvider>
    </Suspense>
  )
}
