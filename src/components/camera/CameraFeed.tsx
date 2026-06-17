import { MOCK_MODE } from '../../config'

export default function CameraFeed() {
  return (
    <div style={{ padding: '8px' }}>
      {MOCK_MODE ? (
        <div
          style={{
            background: 'var(--rl-raised)',
            border: '1px solid var(--rl-border)',
            borderRadius: '8px',
            width: '100%',
            height: '160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Camera-off SVG icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--rl-border)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1l22 22" />
            <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34" />
            <circle cx="12" cy="13" r="3" />
          </svg>

          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: 'var(--rl-label)',
              textAlign: 'center',
              marginTop: '8px',
              padding: '0 16px',
            }}
          >
            Camera Offline — Awaiting Hardware
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              color: 'var(--rl-muted)',
              textAlign: 'center',
              marginTop: '4px',
              padding: '0 16px',
            }}
          >
            ESP32-CAM will connect automatically once hardware is deployed
          </span>
        </div>
      ) : (
        <img
          src={import.meta.env.VITE_ESP32_CAM_URL}
          alt="Motor Camera"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
