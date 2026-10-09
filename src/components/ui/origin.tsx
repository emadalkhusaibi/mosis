/** The selected 02 / ORIGIN mark. Geometry is unchanged from the original brand component. */
export function Origin({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path fill="currentColor" d="M60 8H48C23 8 8 25 8 50s17 42 42 42 42-17 42-42V34H72v16c0 14-8 22-22 22s-22-8-22-22 8-22 22-22h10Z" />
      <rect fill="currentColor" x="72" y="8" width="20" height="20" rx="1.5" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="wordmark">
      <Origin className="wordmark-mark" />
      {!compact && (
        <span className="wordmark-text">
          <span className="wordmark-en" lang="en">moasis</span>
          <span className="wordmark-ar" lang="ar" dir="rtl">مؤسس</span>
        </span>
      )}
    </span>
  );
}
