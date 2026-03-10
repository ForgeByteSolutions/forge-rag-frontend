export default function SidebarToggle({ open, sidebarWidth, onClick }) {
    return (
        <button
            className="sb-toggle"
            style={{ left: open ? `${sidebarWidth + 14}px` : '14px' }}
            onClick={onClick}
            title={open ? "Hide sidebar" : "Show documents"}
        >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <rect x="1" y="1" width="15" height="15" rx="3.5" stroke="#4B5563" strokeWidth="1.4" />
                <line x1="5.5" y1="1" x2="5.5" y2="16" stroke="#4B5563" strokeWidth="1.4" />
                {open && <rect x="1" y="1" width="4.5" height="15" rx="2.5" fill="rgba(18,184,205,.2)" />}
            </svg>
        </button>
    );
}
