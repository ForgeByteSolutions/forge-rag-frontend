"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getUsage, getDocuments } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const TextViewer = dynamic(() => import("@/components/TextViewer"), { ssr: false });
const DocxViewer = dynamic(() => import("@/components/DocxViewer"), { ssr: false });
const SpreadsheetViewer = dynamic(() => import("@/components/SpreadsheetViewer"), { ssr: false });

function DashboardHome({ usage }) {
    if (!usage) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">System Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Current Plan</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-gray-900">{usage.billing.plan}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                                {usage.billing.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {usage.billing.openai_enabled
                                ? "You have full access to OpenAI and Local models."
                                : "Using high-performance local models (Llama-3/E5)."}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Savings Estimate</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-3xl font-bold text-[#10a37f]">${usage.billing.savings_usd}</span>
                        </div>
                        <p className="text-sm text-gray-500">Estimated cumulative savings from using Open Source models vs Paid APIs.</p>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                        <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1">Documents</span>
                        <span className="text-xl font-bold">{usage.metrics.total_documents}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                        <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1">Total Size</span>
                        <span className="text-xl font-bold">{usage.metrics.total_size_kb} KB</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                        <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1">Total Chunks</span>
                        <span className="text-xl font-bold">{usage.metrics.total_chunks}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                        <span className="text-gray-400 text-[10px] font-semibold uppercase block mb-1">Queries</span>
                        <span className="text-xl font-bold">{usage.metrics.queries_performed}</span>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-[#10a37f]/5 border border-[#10a37f]/20 rounded-xl">
                    <h3 className="text-[#10a37f] font-bold mb-2">Pro Tip</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Select a specific document from the sidebar to chat directly with its content for more accurate citations.
                        Use the "Dashboard" view for cross-document searches and general system management.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function DashboardMain() {
    const router = useRouter();
    const params = useParams();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [refreshSidebar, setRefreshSidebar] = useState(0);
    const [activeCitation, setActiveCitation] = useState(null);
    const [usageData, setUsageData] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
        } else {
            fetchUsage();
            syncSelectedDoc();
        }
    }, [router, params?.docId]);

    const syncSelectedDoc = async () => {
        const docIdFromUrl = params?.docId;
        if (docIdFromUrl) {
            try {
                const { documents } = await getDocuments();
                const doc = documents.find(d => d.id === docIdFromUrl);
                if (doc) {
                    setSelectedDoc(doc);
                } else {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error("Sync error:", err);
            }
        } else {
            setSelectedDoc(null);
        }
    };

    const fetchUsage = async () => {
        try {
            const data = await getUsage();
            setUsageData(data);
        } catch (err) {
            console.error("Failed to fetch usage:", err);
        }
    };

    const handleSelectDoc = (doc) => {
        if (doc) {
            router.push(`/dashboard/${doc.id}`);
        } else {
            router.push("/dashboard");
        }
        setActiveCitation(null);
    };

    const handleUploadSuccess = () => {
        setRefreshSidebar(prev => prev + 1);
        fetchUsage();
    };

    const handleViewCitation = (citation) => {
        setActiveCitation(citation);
    };

    const handleClosePdf = () => {
        setActiveCitation(null);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white">
            <Sidebar
                key={`sidebar-${refreshSidebar}`}
                selectedDocId={selectedDoc?.id || null}
                onSelectDoc={handleSelectDoc}
                onUploadSuccess={handleUploadSuccess}
            />

            <div className="flex-1 flex overflow-hidden">
                <div
                    className={`h-full border-r border-black/5 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${activeCitation ? "flex-[1.2] opacity-100" : "flex-0 w-0 opacity-0 invisible"
                        }`}
                >
                    {activeCitation && (
                        (() => {
                            const fileName = activeCitation.source || "";
                            const lowerName = fileName.toLowerCase();

                            if (lowerName.endsWith(".pdf")) {
                                return <PdfViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                            }
                            if (lowerName.endsWith(".docx")) {
                                return <DocxViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                            }
                            if (lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
                                return <SpreadsheetViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                            }
                            const textExtensions = [".txt", ".md", ".json", ".xml", ".py", ".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".log"];
                            if (textExtensions.some(ext => lowerName.endsWith(ext))) {
                                return <TextViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                            }
                            return (
                                <div className="flex flex-col h-full bg-white relative">
                                    <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white">
                                        <h3 className="text-sm font-bold text-gray-900 truncate">{activeCitation.source}</h3>
                                        <button onClick={handleClosePdf} className="p-2 hover:bg-gray-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                                        <h3 className="text-gray-900 font-bold mb-2">Preview Not Available</h3>
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </div>

                <main className={`h-full flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out flex-1`}>
                    {selectedDoc ? (
                        <ChatBox
                            selectedDocId={selectedDoc?.id || null}
                            selectedDocName={selectedDoc?.filename || null}
                            onViewCitation={handleViewCitation}
                        />
                    ) : (
                        <DashboardHome usage={usageData} />
                    )}
                </main>
            </div>
        </div>
    );
}
