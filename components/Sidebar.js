"use client";

import { useState } from "react";
import DocumentList from "./DocumentList";
import { uploadDocument } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Sidebar({ selectedDocId, onSelectDoc, onUploadSuccess }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please select a PDF file");
            return;
        }

        try {
            setUploading(true);
            setError("");
            await uploadDocument(file);
            onUploadSuccess?.();
            // Reset input
            e.target.value = "";
        } catch (err) {
            console.error(err);
            setError("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="w-[260px] bg-[#202123] text-[#ececf1] flex flex-col h-full border-r border-white/20">


            {/* Document List */}
            <DocumentList
                key={uploading ? "uploading" : "idle"} // Force refresh after upload
                selectedDocId={selectedDocId}
                onSelectDoc={onSelectDoc}
            />

            {/* New Chat / Upload */}
            <div className="p-2 space-y-2">
                <label className="flex items-center gap-3 px-3 py-3 border border-white/20 rounded-md hover:bg-[#2b2c2f] transition-colors cursor-pointer text-base mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="flex-1">Upload PDF</span>
                    {uploading && (
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>

                {error && (
                    <div className="px-3 py-2 text-xs text-red-400 bg-red-400/10 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* User Menu */}
            <div className="mt-auto p-2 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2b2c2f] transition-colors text-base text-left"
                >
                    <div className="h-5 w-5 rounded-full bg-[#10a37f] flex items-center justify-center text-[10px] font-bold">
                        U
                    </div>
                    <span className="flex-1 font-medium">Log out</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>

        </aside>
    );
}
