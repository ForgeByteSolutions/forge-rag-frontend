"use client";

import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";

/**
 * Syncs the selected document from URL params.
 * Returns [selectedDoc, setSelectedDoc]
 */
export function useDocumentSync(params, router) {
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const docIdFromUrl = params?.docId;
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
    }, [params?.docId]);

    return [selectedDoc, setSelectedDoc];
}
