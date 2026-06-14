import { MOCK_MODE } from '../../config'

export default function CameraFeed() {
  return (
    <div style={{ padding: '8px' }}>
      {MOCK_MODE ? (
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            width: '100%',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {/* Camera-off SVG icon */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#333333"
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
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#444444',
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            Camera Offline — Awaiting Hardware
          </span>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '180px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#0d0d0d',
          }}
        >
          <img
            src={import.meta.env.VITE_ESP32_CAM_URL}
            alt="Motor Camera"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  )
}
