"use client";

import { useState } from "react";
import "@/styles/dashboard.css";

export default function OcrEngineModal({ file, onCancel, onSubmit }) {
    const [selectedOcrEngine, setSelectedOcrEngine] = useState("tesseract");

    if (!file) return null;

    return (
        <div className="dh-overlay" onClick={onCancel} style={{ zIndex: 99999 }}>
            <div style={{
                background: "#fff", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "500px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column"
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,rgba(18,184,205,.15),rgba(18,184,205,.30))",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="dh-syne" style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Configure OCR Integration</h3>
                        <p className="dh-dm" style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>Select extraction engine for image/PDF files</p>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                    {/* Tesseract Option */}
                    <div onClick={() => setSelectedOcrEngine("tesseract")} style={{
                        padding: "16px 20px", borderRadius: 12, border: selectedOcrEngine === "tesseract" ? "2px solid #12b8cd" : "1px solid rgba(0,0,0,0.1)",
                        background: selectedOcrEngine === "tesseract" ? "rgba(18,184,205,0.05)" : "#fff",
                        cursor: "pointer", transition: "all 0.2s"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span className="dh-syne" style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Tesseract OCR</span>
                            {selectedOcrEngine === "tesseract" && <span style={{ color: "#12b8cd" }}>✔</span>}
                        </div>
                        <p className="dh-dm" style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>Fast, local text extraction. Completely private and cost-free. Best for standard documents.</p>
                    </div>

                    {/* Textract Option */}
                    <div onClick={() => setSelectedOcrEngine("textract")} style={{
                        padding: "16px 20px", borderRadius: 12, border: selectedOcrEngine === "textract" ? "2px solid #12b8cd" : "1px solid rgba(0,0,0,0.1)",
                        background: selectedOcrEngine === "textract" ? "rgba(18,184,205,0.05)" : "#fff",
                        cursor: "pointer", transition: "all 0.2s"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span className="dh-syne" style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>AWS Textract</span>
                            {selectedOcrEngine === "textract" && <span style={{ color: "#12b8cd" }}>✔</span>}
                        </div>
                        <p className="dh-dm" style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>High accuracy cloud OCR. Superior table extraction and handwriting recognition.</p>
                    </div>

                    {/* EasyOCR Option */}
                    <div onClick={() => setSelectedOcrEngine("easyocr")} style={{
                        padding: "16px 20px", borderRadius: 12, border: selectedOcrEngine === "easyocr" ? "2px solid #12b8cd" : "1px solid rgba(0,0,0,0.1)",
                        background: selectedOcrEngine === "easyocr" ? "rgba(18,184,205,0.05)" : "#fff",
                        cursor: "pointer", transition: "all 0.2s"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span className="dh-syne" style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>EasyOCR</span>
                            {selectedOcrEngine === "easyocr" && <span style={{ color: "#12b8cd" }}>✔</span>}
                        </div>
                        <p className="dh-dm" style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>Excellent for multilingual text and stylized fonts. Balanced speed and accuracy.</p>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button onClick={onCancel} style={{
                        padding: "10px 20px", borderRadius: 10, border: "none", background: "#f3f4f6",
                        color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14
                    }}>Cancel</button>
                    <button onClick={() => onSubmit(selectedOcrEngine)} style={{
                        padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                        color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 14px rgba(18,184,205,.35)"
                    }}>Start Processing</button>
                </div>
            </div>
        </div>
    );
}
