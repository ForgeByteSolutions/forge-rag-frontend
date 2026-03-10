"use client";

import { useEffect, useState } from "react";
import { analyzeRisk } from "@/lib/api";

/**
 * Handles risk analysis for the current doc (auto-triggered on ?tab=risk).
 * Also handles the global Risk Dashboard modal.
 * Returns { riskData, riskLoading, showRiskDashboard, allRisksData, loadingAllRisks, handleOpenRiskDashboard, setShowRiskDashboard }
 */
export function useRiskAnalysis(searchParams, selectedDoc) {
    const [riskData, setRiskData] = useState(null);
    const [riskLoading, setRiskLoading] = useState(false);

    const [showRiskDashboard, setShowRiskDashboard] = useState(false);
    const [allRisksData, setAllRisksData] = useState([]);
    const [loadingAllRisks, setLoadingAllRisks] = useState(false);

    // Auto-trigger risk analysis when ?tab=risk is present
    useEffect(() => {
        const tab = searchParams?.get("tab");
        if (tab === "risk" && selectedDoc) {
            setRiskData(null);
            setRiskLoading(true);
            analyzeRisk({ doc_id: selectedDoc.id })
                .then(data => setRiskData(data))
                .catch(err => console.error("Risk analysis failed:", err))
                .finally(() => setRiskLoading(false));
        } else if (tab !== "risk") {
            setRiskData(null);
        }
    }, [searchParams, selectedDoc]);

    const handleOpenRiskDashboard = async () => {
        try {
            setShowRiskDashboard(true);
            setLoadingAllRisks(true);
            const { getAllRisks } = await import("@/lib/api");
            const data = await getAllRisks();
            setAllRisksData(data?.risks || []);
        } catch (err) {
            console.error("Failed to load risks:", err);
        } finally {
            setLoadingAllRisks(false);
        }
    };

    return {
        riskData,
        riskLoading,
        showRiskDashboard,
        setShowRiskDashboard,
        allRisksData,
        loadingAllRisks,
        handleOpenRiskDashboard,
    };
}
