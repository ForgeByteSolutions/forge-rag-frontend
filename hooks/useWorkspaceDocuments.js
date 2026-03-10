"use client";

import { useEffect, useState } from "react";
import { getWorkspaceDocuments } from "@/lib/api";

/**
 * Loads workspace documents and builds the riskMap from stored analyses.
 * Returns { workspaceDocs, riskMap, setRiskMap, docsRefreshKey, setDocsRefreshKey, selectedDocIds, setSelectedDocIds }
 */
export function useWorkspaceDocuments(workspaceId) {
    const [workspaceDocs, setWorkspaceDocs] = useState([]);
    const [riskMap, setRiskMap] = useState({});
    const [docsRefreshKey, setDocsRefreshKey] = useState(0);
    const [selectedDocIds, setSelectedDocIds] = useState(new Set());

    useEffect(() => {
        if (!workspaceId) return;
        getWorkspaceDocuments(workspaceId)
            .then(data => {
                const docs = Array.isArray(data) ? data : (data?.documents || []);
                setWorkspaceDocs(docs);

                // Populate riskMap from stored analyses
                const newRiskMap = {};
                docs.forEach(d => {
                    if (d.risk_analysis) {
                        try {
                            newRiskMap[d.id] = {
                                analysis: typeof d.risk_analysis === 'string' ? JSON.parse(d.risk_analysis) : d.risk_analysis,
                                filename: d.filename
                            };
                        } catch (e) { /* malformed JSON — skip */ }
                    }
                });
                setRiskMap(prev => ({ ...prev, ...newRiskMap }));
            })
            .catch(err => console.error("Failed to load workspace docs:", err));
    }, [workspaceId, docsRefreshKey]);

    return { workspaceDocs, riskMap, setRiskMap, docsRefreshKey, setDocsRefreshKey, selectedDocIds, setSelectedDocIds };
}
