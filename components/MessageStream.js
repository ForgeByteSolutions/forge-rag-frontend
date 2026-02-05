export default function MessageStream({ content }) {
  if (!content) return null;

  return (
    <div className="text-sm text-gray-800 whitespace-pre-wrap">
      {content}
    </div>
  );
}
