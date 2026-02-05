import ThinkingLoader from "./ThinkingLoader";

export default function ChatMessage({ message, onViewCitation }) {
    const isAi = message.type === "ai";

    return (
        <div className={`w-full py-8 border-b border-black/10 ${isAi ? "bg-gray-50" : "bg-white"}`}>
            <div className="max-w-2xl mx-auto px-4 flex gap-4 md:gap-6">
                {/* Avatar */}
                <div className={`h-8 w-8 shrink-0 rounded flex items-center justify-center text-white text-xs font-bold ${isAi ? "bg-[#10a37f]" : "bg-[#5436da]"}`}>
                    {isAi ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9108 6.0462 6.0462 0 0 0-4.7443-3.2243 6.072 6.072 0 0 0-5.2922 1.4286 6.0586 6.0586 0 0 0-5.6074 1.7014 6.0456 6.0456 0 0 0-2.0358 4.8895 6.0437 6.0437 0 0 0 2.1285 5.4671 5.981 5.981 0 0 0 .515 4.9103 6.0462 6.0462 0 0 0 4.743 3.2243 6.072 6.072 0 0 0 5.2925-1.4289 6.0581 6.0581 0 0 0 5.6071-1.7014 6.0456 6.0456 0 0 0 2.0358-4.8892 6.0423 6.0423 0 0 0-2.127-5.4668ZM18.3307 15.5561a1.2149 1.2149 0 0 1-1.807 1.2827 4.8569 4.8569 0 0 0-2.6846-.794 4.8465 4.8465 0 0 0-4.8447 4.8469c0 1.5639.76 3.0127 2.0496 3.9014a1.2152 1.2152 0 0 1-.678 2.2244 1.2154 1.2154 0 0 1-1.2154-1.2154c0-2.4855-2.0145-4.5-4.5-4.5a1.2152 1.2152 0 1 1 0-2.4304c1.5364 0 2.9608-.7712 3.826-2.0645a1.2151 1.2151 0 0 1 2.0464 1.3407 4.8569 4.8569 0 0 0 .7942 2.6843 4.8465 4.8465 0 0 0 4.8446-4.8469c0-1.5639-.76-3.0127-2.0496-3.9014a1.2152 1.2152 0 1 1 1.3561-2.009 6.07 6.07 0 0 0 1.6214 2.8943Z" />
                        </svg>
                    ) : "Y"}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div className="prose prose-base max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {isAi && !message.content ? <ThinkingLoader /> : message.content}
                    </div>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap gap-2">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-full mb-1">
                                Sources
                            </span>
                            {message.citations.map((cite, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onViewCitation?.(cite)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] text-gray-600 transition-colors cursor-pointer border border-black/5 flex items-center gap-1.5"
                                    title={cite.snippet}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{cite.source} (p.{cite.page})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
