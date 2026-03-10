"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getWorkspaces } from "@/lib/api";

/**
 * Loads the workspace name and handles auth redirect.
 * Returns { workspaceName }
 */
export function useWorkspace(workspaceId) {
    const router = useRouter();
    const [workspaceName, setWorkspaceName] = useState("");

    useEffect(() => {
        if (!isLoggedIn()) { router.push("/login"); return; }
        if (!workspaceId) return;
        getWorkspaces()
            .then(data => {
                const ws = data.workspaces?.find(w => w.id === workspaceId);
                setWorkspaceName(ws ? ws.name : "Workspace");
            })
            .catch(() => setWorkspaceName("Workspace"));
    }, [workspaceId]);

    return { workspaceName };
}
