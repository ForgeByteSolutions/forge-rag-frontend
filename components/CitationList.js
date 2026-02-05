export default function CitationList({ citations }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 border-t pt-3">
      <h3 className="text-xs font-semibold text-gray-500 mb-2">
        Sources
      </h3>
      <ul className="space-y-1">
        {citations.map((c, idx) => (
          <li
            key={idx}
            className="text-xs text-gray-600"
          >
            {c.source} — page {c.page}
          </li>
        ))}
      </ul>
    </div>
  );
}
