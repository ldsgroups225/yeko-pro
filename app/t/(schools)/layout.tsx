'use client';

import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { Suspense } from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ConvexClientProvider>
          {children}
      </ConvexClientProvider>
    </Suspense>
  )
}
