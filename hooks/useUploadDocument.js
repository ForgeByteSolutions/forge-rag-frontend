"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";

/**
 * Handles file upload with OCR detection.
 * Returns { executeUpload, handleFileUpload, uploading, pendingFile, setPendingFile }
 */
export function useUploadDocument({ onSuccess, router }) {
    const [uploading, setUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    const executeUpload = async (file, ocrEngine) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("workspace_id", "none");
            formData.append("ocr_engine", ocrEngine);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/documents/upload`,
                { method: "POST", headers: { Authorization: `Bearer ${await getToken()}` }, body: formData }
            );
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            const newDocId = data.doc_id || data.id;
            if (!newDocId) throw new Error("No doc id returned");
            if (onSuccess) onSuccess();
            if (data.is_contract) {
                router.push(`/dashboard/${newDocId}?tab=choice`);
            } else {
                router.push(`/dashboard/${newDocId}`);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["pdf", "docx", "txt", "csv", "xlsx", "xls", "png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
            alert("❌ Invalid file type!"); return;
        }

        e.target.value = "";

        let needsOcr = false;
        if (["png", "jpg", "jpeg", "webp", "jfif"].includes(ext)) {
            needsOcr = true;
        } else if (ext === "pdf") {
            setUploading(true);
            try {
                const { pdfjs } = await import("react-pdf");
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const pagesToCheck = Math.min(pdf.numPages, 5);
                for (let i = 1; i <= pagesToCheck; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const text = textContent.items.map(item => item.str).join(' ').trim();
                    if (text.length < 50) { needsOcr = true; break; }
                }
            } catch (err) {
                console.error("PDF parsing error:", err);
                needsOcr = true;
            }
            setUploading(false);
        }

        if (needsOcr) {
            setPendingFile(file);
        } else {
            executeUpload(file, "none");
        }
    };

    return { executeUpload, handleFileUpload, uploading, pendingFile, setPendingFile };
}
