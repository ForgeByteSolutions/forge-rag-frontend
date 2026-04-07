"use client";

import { useState } from "react";

export default function CreateWorkspaceModal({ 
    isOpen, 
    onClose, 
    onCreate, 
    creatingWorkspace,
    subtitle = "Upload multiple documents together"
}) {
    const [wsName, setWsName] = useState("");

    if (!isOpen) return null;

    const handleCreate = async () => {
        const name = wsName.trim();
        if (!name) return;
        
        await onCreate(name);
        setWsName("");
    };

    return (
        <div className="dh-overlay" onClick={onClose} style={{ zIndex: 100 }}>
            <div className="dh-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(18,184,205,.12), rgba(18,184,205,.24))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="dh-syne" style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>New Workspace</h3>
                        <p className="dh-dm" style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>{subtitle}</p>
                    </div>
                </div>
                <label className="dh-dm" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                    Workspace Name
                </label>
                <input
                    className="dh-input text-gray-700"
                    placeholder="e.g. Q4 Financial Reports"
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    autoFocus
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button
                        className="dh-btn-workspace"
                        style={{ padding: '10px 20px', fontSize: 13 }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="dh-btn"
                        style={{ padding: '10px 24px', fontSize: 13 }}
                        onClick={handleCreate}
                        disabled={!wsName.trim() || creatingWorkspace}
                    >
                        {creatingWorkspace ? "Creating..." : "Create & Open"}
                    </button>
                </div>
            </div>
        </div>
    );
}
