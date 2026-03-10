"use client";

import { useState } from "react";
import { analyzeRisk } from "@/lib/api";

/**
 * Manages risk analysis per document and the active risk tab state.
 * Returns { rightTab, setRightTab, riskLoading, selectedRiskDocId, setSelectedRiskDocId, contractPrompt, setContractPrompt, handleDocRiskClick, handleContractRisk }
 */
export function useWorkspaceRisk({ riskMap, setRiskMap }) {
    const [rightTab, setRightTab] = useState("chat");
    const [riskLoading, setRiskLoading] = useState(false);
    const [selectedRiskDocId, setSelectedRiskDocId] = useState(null);
    const [contractPrompt, setContractPrompt] = useState(null);

    // Called when user clicks the shield button on a saved doc
    const handleDocRiskClick = async (doc) => {
        if (riskMap[doc.id]) {
            setSelectedRiskDocId(doc.id);
            setRightTab("risk");
            return;
        }
        setRiskLoading(true);
        try {
            const analysis = await analyzeRisk({ doc_id: doc.id });
            if (analysis) {
                setRiskMap(prev => ({ ...prev, [doc.id]: { analysis, filename: doc.filename } }));
                setSelectedRiskDocId(doc.id);
                setRightTab("risk");
            } else {
                alert(`Risk analysis returned no data for "${doc.filename}".`);
            }
        } catch (e) {
            console.warn("Risk analysis failed:", e);
            alert(`⚠️ Risk analysis failed for "${doc.filename}". Please try again.`);
        } finally {
            setRiskLoading(false);
        }
    };

    // Called when user clicks "Risk Analysis" from the ContractPromptModal
    const handleContractRisk = async ({ doc_id, docName }) => {
        setContractPrompt(null);
        setRiskLoading(true);
        try {
            const analysis = await analyzeRisk({ doc_id });
            setRiskMap(prev => ({ ...prev, [doc_id]: { analysis, filename: docName } }));
            setSelectedRiskDocId(doc_id);
            setRightTab("risk");
        } catch (e) {
            console.warn("Risk analysis failed:", e);
            alert("⚠️ Risk analysis failed. Please try again.");
        } finally {
            setRiskLoading(false);
        }
    };

    return {
        rightTab, setRightTab,
        riskLoading,
        selectedRiskDocId, setSelectedRiskDocId,
        contractPrompt, setContractPrompt,
        handleDocRiskClick, handleContractRisk,
    };
}
