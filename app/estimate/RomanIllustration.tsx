export default function RomanIllustration({ style, className = '' }: { style: 'flat' | 'classic'; className?: string }) {
  return <svg viewBox="0 0 180 200" role="img" aria-label={`${style === 'flat' ? 'Flat' : 'Classic'} Roman shade illustration`} className={className}>
    <g stroke="#303030" strokeWidth="1.6" fill="white" strokeLinejoin="round">
      <path d="M24 12h132v172H24z" /><path d="M30 18h120v160H30z" />
      <path d="M90 18v160M30 120h120" fill="none" stroke="#aaa" />
      <path d="M30 18h120v129H30z" />
      {style === 'classic' && <path d="M30 43h120M30 68h120M30 93h120M30 118h120" fill="none" />}
      <path d="M30 139h120v8H30zM30 147h120v6H30zM19 184h142v5H19z" />
    </g>
  </svg>;
}
