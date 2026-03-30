"use client";

import { useState } from "react";
import { uploadDocumentToWorkspace, getDocumentStatus } from "@/lib/api";

/**
 * Handles file selection, OCR detection, and upload queue.
 * Returns { uploadedFiles, pendingUploadFiles, setPendingUploadFiles, dragOver, setDragOver, addFiles, handleFilePick, handleDrop, processFileSelection }
 */
export function useWorkspaceUpload({ workspaceId, onUploadSuccess, onContractDetected }) {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pendingUploadFiles, setPendingUploadFiles] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const addFiles = (newFiles, ocr_engine = "tesseract") => {
        const entries = Array.from(newFiles).map((file, idx) => ({
            id: `${Date.now()}-${idx}-${file.name}`,
            file,
            ocr_engine,
            status: "pending",
            result: null,
            error: null,
        }));
        setUploadedFiles(prev => [...prev, ...entries]);
        entries.forEach(entry => startUpload(entry));
    };

    const startUpload = async (entry) => {
        setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "uploading" } : f));
        try {
            const result = await uploadDocumentToWorkspace(entry.file, workspaceId, entry.ocr_engine);
            const newDocId = result?.doc_id || result?.id;
            
            if (newDocId) {
                // Poll backend every 3 seconds to wait for BackgroundTask to finish
                let isDone = false;
                while (!isDone) {
                    await new Promise(r => setTimeout(r, 3000));
                    try {
                        const statusData = await getDocumentStatus(newDocId);
                        if (statusData.status === "completed" || statusData.status === "failed") {
                            isDone = true;
                            if (statusData.status === "failed") {
                                throw new Error("Document processing failed on server.");
                            }
                        }
                    } catch (e) {
                        console.log("Polling error (might be momentary):", e);
                    }
                }
            }

            setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "done", result } : f));
            setTimeout(() => {
                setUploadedFiles(prev => prev.filter(f => f.id !== entry.id));
            }, 4000);
            if (onUploadSuccess) onUploadSuccess();
            if (result?.is_contract && result?.doc_id) {
                onContractDetected?.({ docName: entry.file.name, doc_id: result.doc_id });
            }
        } catch (err) {
            setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error", error: err.message || "Upload failed" } : f));
        }
    };

    const processFileSelection = async (filesArray) => {
        if (!filesArray || filesArray.length === 0) return;

        const checkPdf = async (f) => {
            try {
                const { pdfjs } = await import("react-pdf");
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                const arrayBuffer = await f.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const pagesToCheck = Math.min(pdf.numPages, 5);
                for (let i = 1; i <= pagesToCheck; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const text = textContent.items.map(item => item.str).join(' ').trim();
                    if (text.length < 50) return true;
                }
                return false;
            } catch (err) {
                console.error("PDF parsing error:", err);
                return true;
            }
        };

        const checks = filesArray.map(async f => {
            const ext = f.name.split(".").pop().toLowerCase();
            if (["jpg", "jpeg", "png", "webp", "jfif"].includes(ext)) {
                return true;
            } else if (ext === "pdf") {
                return await checkPdf(f);
            }
            return false;
        });

        const results = await Promise.all(checks);
        const needsOcr = results.includes(true);

        if (needsOcr) {
            setPendingUploadFiles(filesArray);
        } else {
            addFiles(filesArray, "none");
        }
    };

    const handleFilePick = (e) => {
        processFileSelection(Array.from(e.target.files));
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        processFileSelection(Array.from(e.dataTransfer.files));
    };

    return {
        uploadedFiles,
        pendingUploadFiles,
        setPendingUploadFiles,
        dragOver,
        setDragOver,
        addFiles,
        handleFilePick,
        handleDrop,
        processFileSelection,
    };
}
