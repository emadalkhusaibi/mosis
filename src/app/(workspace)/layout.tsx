import { WorkspaceProvider } from "@/state/workspace";
import { AppShell } from "@/components/shell/app-shell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
