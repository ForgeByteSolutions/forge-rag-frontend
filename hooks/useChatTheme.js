"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "forge_chat_theme";

/**
 * Manages the active chat background theme with localStorage persistence.
 * Returns { activeTheme, setActiveTheme }
 */
export function useChatTheme() {
    const [activeTheme, setActiveTheme] = useState(null);

    // Load saved theme on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setActiveTheme(saved === "__none__" ? null : saved);
        } catch { /* SSR / private browsing — ignore */ }
    }, []);

    // Persist whenever theme changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, activeTheme ?? "__none__");
        } catch { /* ignore */ }
    }, [activeTheme]);

    return { activeTheme, setActiveTheme };
}
