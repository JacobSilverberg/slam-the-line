const C = { amb: '#f59e0b', mut: '#94a3b8', d2: '#1a2d4a', bor: '#1e3354', txt: '#e2e8f0' } as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

export const Spinner = ({ full }: { full?: boolean }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: full ? 0 : 48, ...(full ? { minHeight: '60vh' } : {}),
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 99,
      border: `3px solid ${C.d2}`, borderTopColor: C.amb,
      animation: 'stl-spin 0.8s linear infinite',
    }} />
  </div>
);

export const ErrorState = ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '48px 24px', textAlign: 'center' }}>
    <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      Couldn't load data
    </div>
    <div style={{ fontFamily: FFb, fontSize: 14, color: C.mut, maxWidth: 320 }}>
      {message || 'Something went wrong talking to the server. Check your connection and try again.'}
    </div>
    <button
      onClick={onRetry}
      style={{
        padding: '12px 28px', borderRadius: 10, background: C.amb, border: 'none',
        color: '#000', fontFamily: FF, fontSize: 16, fontWeight: 900,
        letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', minHeight: 44,
      }}
    >
      Retry
    </button>
  </div>
);
