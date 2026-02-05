"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import PdfViewer from "@/components/PdfViewer";

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
            <PdfViewer
              citation={activeCitation}
              docId={activeCitation.doc_id}
              docName={activeCitation.source}
              onClose={handleClosePdf}
            />
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
