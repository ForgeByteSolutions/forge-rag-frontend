"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const TextViewer = dynamic(() => import("@/components/TextViewer"), { ssr: false });
const DocxViewer = dynamic(() => import("@/components/DocxViewer"), { ssr: false });
const SpreadsheetViewer = dynamic(() => import("@/components/SpreadsheetViewer"), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState(null); // { id, filename }
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [activeCitation, setActiveCitation] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    // When switching docs, close the PDF viewer to avoid confusion
    setActiveCitation(null);
  };

  const handleUploadSuccess = () => {
    // Increment to trigger DocumentList refresh
    setRefreshSidebar(prev => prev + 1);
  };

  const handleViewCitation = (citation) => {
    setActiveCitation(citation);
  };

  const handleClosePdf = () => {
    setActiveCitation(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar - Fixed Width */}
      <Sidebar
        key={`sidebar-${refreshSidebar}`}
        selectedDocId={selectedDoc?.id || null}
        onSelectDoc={handleSelectDoc}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF View Column - Expandable */}
        <div
          className={`h-full border-r border-black/5 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${activeCitation ? "flex-[1.2] opacity-100" : "flex-0 w-0 opacity-0 invisible"
            }`}
        >
          {activeCitation && (
            (() => {
              const fileName = activeCitation.source || "";
              const lowerName = fileName.toLowerCase();

              if (lowerName.endsWith(".pdf")) {
                return (
                  <PdfViewer
                    citation={activeCitation}
                    docId={activeCitation.doc_id}
                    docName={activeCitation.source}
                    onClose={handleClosePdf}
                  />
                );
              }

              if (lowerName.endsWith(".docx")) {
                return (
                  <DocxViewer
                    citation={activeCitation}
                    docId={activeCitation.doc_id}
                    docName={activeCitation.source}
                    onClose={handleClosePdf}
                  />
                );
              }

              if (lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
                return (
                  <SpreadsheetViewer
                    citation={activeCitation}
                    docId={activeCitation.doc_id}
                    docName={activeCitation.source}
                    onClose={handleClosePdf}
                  />
                );
              }

              const textExtensions = [".txt", ".md", ".json", ".xml", ".py", ".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".log"];
              if (textExtensions.some(ext => lowerName.endsWith(ext))) {
                return (
                  <TextViewer
                    citation={activeCitation}
                    docId={activeCitation.doc_id}
                    docName={activeCitation.source}
                    onClose={handleClosePdf}
                  />
                );
              }

              // Fallback for unsupported files
              return (
                <div className="flex flex-col h-full bg-white relative">
                  <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {activeCitation.source}
                      </h3>
                    </div>
                    <button onClick={handleClosePdf} className="p-2 hover:bg-gray-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                    <div className="bg-gray-200 p-4 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-gray-900 font-bold mb-2">Preview Not Available</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      This file format cannot be previewed directly. The backend content is available for search and chat, but visual preview is currently limited to PDFs and text files.
                    </p>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Chat Area Column - Fixed/Flexible */}
        <main className={`h-full flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${activeCitation ? "flex-1" : "flex-1"
          }`}>
          <ChatBox
            selectedDocId={selectedDoc?.id || null}
            selectedDocName={selectedDoc?.filename || null}
            onViewCitation={handleViewCitation}
          />
        </main>
      </div>
    </div>
  );
}
