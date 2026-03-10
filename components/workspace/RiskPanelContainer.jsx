"use client";

import RiskPanel from "@/components/RiskPanel";
import "@/styles/workspace.css";

export default function RiskPanelContainer({ contractDocs, selectedRiskDocId, setSelectedRiskDocId, riskMap }) {
    const activeRisk = selectedRiskDocId ? riskMap[selectedRiskDocId] : null;

    return (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Doc selector when multiple contracts */}
            {contractDocs.length > 1 && (
                <div style={{
                    padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,.07)",
                    background: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>Viewing:</span>
                    <select
                        value={selectedRiskDocId || ""}
                        onChange={e => setSelectedRiskDocId(e.target.value)}
                        style={{
                            flex: 1, fontSize: 12, fontWeight: 600, color: "#374151",
                            border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 8,
                            padding: "5px 10px", background: "#f8fafc", outline: "none", cursor: "pointer"
                        }}
                    >
                        {contractDocs.map(([docId, { filename }]) => (
                            <option key={docId} value={docId}>{filename}</option>
                        ))}
                    </select>
                </div>
            )}
            {activeRisk
                ? <RiskPanel analysis={activeRisk.analysis} docName={activeRisk.filename} />
                : <div style={{ padding: 24, color: "#9ca3af", fontSize: 13 }}>Select a contract above to view its risk analysis.</div>
            }
        </div>
    );
}
