"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDocuments } from "@/lib/api";

/**
 * Syncs the selected document from URL query param (?doc=<id>).
 * Returns [selectedDoc, setSelectedDoc]
 */
export function useDocumentSync(router) {
    const searchParams = useSearchParams();
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Use query param (?doc=)
    const docIdFromUrl = searchParams?.get("doc");

    useEffect(() => {
        if (docIdFromUrl) {
            getDocuments()
                .then(docs => {
                    const doc = docs.find(d => d.id === docIdFromUrl);
                    if (doc) setSelectedDoc(doc);
                    else router.push("/dashboard");
                })
                .catch(err => console.error("Sync error:", err));
        } else {
            setSelectedDoc(null);
        }
    }, [docIdFromUrl]);

    return [selectedDoc, setSelectedDoc];
}
