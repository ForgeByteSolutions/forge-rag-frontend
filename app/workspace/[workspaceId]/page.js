import WorkspacePage from "@/components/WorkspacePage";

export async function generateStaticParams() {
  return [{ workspaceId: "default" }];
}

export default function Page() {
    return <WorkspacePage />;
}
