import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { AcceptInviteDialog } from "@/app/t/AcceptInviteDialog";
import { Notifications } from "@/app/t/Notifications";
import { TeamMenu } from "@/app/t/TeamMenu";
import { ProfileButton } from "@/app/t/[teamSlug]/ProfileButton";
import { StickyHeader } from "@/components/layout/sticky-header";
import { TeamSwitcher } from "@/app/t/TeamSwitcher";
import { Toaster } from "@/components/ui/toaster";
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
