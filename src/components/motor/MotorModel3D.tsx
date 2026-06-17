import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useHardware } from '../../context/HardwareContext'

export default function MotorModel3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { hardware } = useHardware()
  const hardwareRef = useRef(hardware)
  const [isDragging, setIsDragging] = useState(false)

  // Keep hardware ref in sync without triggering re-render
  useEffect(() => {
    hardwareRef.current = hardware
  }, [hardware])

  // ── Orbit state ──────────────────────────────────────────────────────────────
  const orbitRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    theta: 0.6,
    phi: 1.1,
    radius: 5.5,
  })

  const handleReset = () => {
    orbitRef.current = {
      isDragging: false,
      lastX: 0,
      lastY: 0,
      theta: 0.6,
      phi: 1.1,
      radius: 5.5,
    }
  }

  // ── Main Three.js scene setup ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.background = null

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight.position.set(4, 6, 4)
    scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-4, 2, -4)
    scene.add(fillLight)

    const accentLight = new THREE.PointLight(0x7C3AED, 1.2, 12)
    accentLight.position.set(0, 0, 3)
    scene.add(accentLight)

    // ── Motor body group (static — does NOT rotate) ──────────────────────────
    const motorGroup = new THREE.Group()
    scene.add(motorGroup)

    // Motor can (cylindrical body, JGB37-520 style)
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 32)
    const bodyMesh = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshStandardMaterial({ color: 0x252030, roughness: 0.3, metalness: 0.85 })
    )
    bodyMesh.rotation.z = Math.PI / 2
    bodyMesh.position.x = -0.6
    motorGroup.add(bodyMesh)

    // End cap — rear of motor can
    const capRearGeo = new THREE.CylinderGeometry(0.57, 0.57, 0.07, 32)
    const capRearMesh = new THREE.Mesh(
      capRearGeo,
      new THREE.MeshStandardMaterial({ color: 0x1a1528, metalness: 0.9 })
    )
    capRearMesh.rotation.z = Math.PI / 2
    capRearMesh.position.x = -1.43
    motorGroup.add(capRearMesh)

    // Cooling fins — 8 fins radially around the motor can
    for (let i = 0; i < 8; i++) {
      const angle = i * (Math.PI / 4)
      const finGeo = new THREE.BoxGeometry(1.5, 0.05, 0.03)
      const finMesh = new THREE.Mesh(
        finGeo,
        new THREE.MeshStandardMaterial({ color: 0x1a1528, metalness: 0.9, roughness: 0.3 })
      )
      finMesh.rotation.x = angle
      finMesh.position.x = -0.6
      finMesh.position.y = Math.sin(angle) * 0.59
      finMesh.position.z = Math.cos(angle) * 0.59
      motorGroup.add(finMesh)
    }

    // Gearbox housing — squarish metal box between motor can and shaft
    const gearboxGeo = new THREE.BoxGeometry(0.75, 0.78, 0.78)
    const gearboxMesh = new THREE.Mesh(
      gearboxGeo,
      new THREE.MeshStandardMaterial({ color: 0x6b6b6b, metalness: 0.85, roughness: 0.35 })
    )
    gearboxMesh.position.x = 0.45
    motorGroup.add(gearboxMesh)

    // Gearbox mounting bracket holes (small dark cylinders, cosmetic detail)
    const boltPositions = [
      [0.1, 0.27, 0.27], [0.1, -0.27, 0.27], [0.1, 0.27, -0.27], [0.1, -0.27, -0.27],
    ]
    for (const [bx, by, bz] of boltPositions) {
      const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8)
      const boltMesh = new THREE.Mesh(
        boltGeo,
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })
      )
      boltMesh.rotation.z = Math.PI / 2
      boltMesh.position.set(bx, by, bz)
      motorGroup.add(boltMesh)
    }

    // Terminal box (power leads) on top of motor can
    const terminalGeo = new THREE.BoxGeometry(0.4, 0.22, 0.2)
    const terminalMesh = new THREE.Mesh(
      terminalGeo,
      new THREE.MeshStandardMaterial({ color: 0x2a2040, metalness: 0.6 })
    )
    terminalMesh.position.set(-0.6, 0.66, 0)
    motorGroup.add(terminalMesh)

    // ── Rotating group (shaft + encoder disc — spins with the motor) ─────────
    const rotatingGroup = new THREE.Group()
    rotatingGroup.position.x = 0.83
    scene.add(rotatingGroup)

    // Short output shaft protruding from the gearbox face
    const shaftGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.55, 16)
    const shaftMesh = new THREE.Mesh(
      shaftGeo,
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.1 })
    )
    shaftMesh.rotation.z = Math.PI / 2
    shaftMesh.position.x = 0.275
    rotatingGroup.add(shaftMesh)

    // Flat key-cut on the shaft tip (small box, cosmetic)
    const keyGeo = new THREE.BoxGeometry(0.12, 0.025, 0.065)
    const keyMesh = new THREE.Mesh(
      keyGeo,
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1.0 })
    )
    keyMesh.position.x = 0.48
    keyMesh.position.y = 0.045
    rotatingGroup.add(keyMesh)

    // Encoder disc — slotted disc mounted near the gearbox face for speed sensing
    const discMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.04, 48),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 })
    )
    discMesh.rotation.z = Math.PI / 2
    discMesh.position.x = 0.06
    rotatingGroup.add(discMesh)

    // Radial encoder slots around the disc rim
    const slotMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.3 })
    const slotCount = 20
    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2
      const slotGeo = new THREE.BoxGeometry(0.05, 0.07, 0.012)
      const slotMesh = new THREE.Mesh(slotGeo, slotMat)
      slotMesh.position.x = 0.06
      slotMesh.position.y = Math.sin(angle) * 0.29
      slotMesh.position.z = Math.cos(angle) * 0.29
      slotMesh.rotation.x = angle
      rotatingGroup.add(slotMesh)
    }

    // Hub at the disc center
    const hubMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9 })
    )
    hubMesh.rotation.z = Math.PI / 2
    hubMesh.position.x = 0.06
    rotatingGroup.add(hubMesh)

    // ── Animation state ──────────────────────────────────────────────────────
    let animFrameId: number
    let currentSpeed = 0

    const animate = () => {
      animFrameId = requestAnimationFrame(animate)

      const { motorStatus, currentRPM, direction } = hardwareRef.current
      const dirSign = direction === 'FORWARD' ? 1 : -1

      // Speed update
      if (motorStatus === 'RUNNING') {
        const targetSpeed = (currentRPM / 60) * (2 * Math.PI) * (1 / 60) * dirSign
        currentSpeed += (targetSpeed - currentSpeed) * 0.1
      } else {
        currentSpeed *= 0.92
        if (Math.abs(currentSpeed) < 0.0001) currentSpeed = 0
      }

      rotatingGroup.rotation.x += currentSpeed

      // Accent light color per status
      if (motorStatus === 'RUNNING') {
        accentLight.color.set(0x00c853)
      } else if (motorStatus === 'ERROR') {
        accentLight.color.set(0xff1744)
      } else {
        accentLight.color.set(0x7C3AED)
      }
      accentLight.intensity = 1.2

      // Camera from spherical coords
      const { theta, phi, radius } = orbitRef.current
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      )
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize observer ──────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // ── Touch tracking ───────────────────────────────────────────────────────
    const touchRef = { x: 0, y: 0 }

    // ── Event handlers ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      if (!orbitRef.current.isDragging) return
      orbitRef.current.theta += (e.clientX - orbitRef.current.lastX) * 0.01
      orbitRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI - 0.15, orbitRef.current.phi + (e.clientY - orbitRef.current.lastY) * 0.01)
      )
      orbitRef.current.lastX = e.clientX
      orbitRef.current.lastY = e.clientY
    }

    const onMouseUp = () => {
      orbitRef.current.isDragging = false
      setIsDragging(false)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!orbitRef.current.isDragging || e.touches.length !== 1) return
      orbitRef.current.theta += (e.touches[0].clientX - touchRef.x) * 0.01
      orbitRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI - 0.15, orbitRef.current.phi + (e.touches[0].clientY - touchRef.y) * 0.01)
      )
      touchRef.x = e.touches[0].clientX
      touchRef.y = e.touches[0].clientY
    }

    const onTouchEnd = () => {
      orbitRef.current.isDragging = false
      setIsDragging(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // ── Container event handlers (react synthetic) ───────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    orbitRef.current.isDragging = true
    orbitRef.current.lastX = e.clientX
    orbitRef.current.lastY = e.clientY
    setIsDragging(true)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    orbitRef.current.radius = Math.max(
      2.5,
      Math.min(9, orbitRef.current.radius - e.deltaY * 0.008)
    )
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      orbitRef.current.isDragging = true
      orbitRef.current.lastX = e.touches[0].clientX
      orbitRef.current.lastY = e.touches[0].clientY
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      style={{
        width: '100%',
        height: 240,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'transparent',
        userSelect: 'none',
      }}
    >
      <button
        onClick={handleReset}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'var(--rl-raised)',
          border: '1px solid var(--rl-border)',
          color: 'var(--rl-muted)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          padding: '4px 8px',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        ⟳ Reset
      </button>
    </div>
  )
}
