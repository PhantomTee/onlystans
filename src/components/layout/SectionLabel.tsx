interface SectionLabelProps {
  children: React.ReactNode
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '11px',
        fontWeight: 600,
        color: '#888888',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  )
}
