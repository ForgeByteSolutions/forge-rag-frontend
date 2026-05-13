import { Suspense } from "react";
import WorkspacePage from "@/components/WorkspacePage";

export default function Page() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-10 w-10 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin" /></div>}>
            <WorkspacePage />
        </Suspense>
    );
}
