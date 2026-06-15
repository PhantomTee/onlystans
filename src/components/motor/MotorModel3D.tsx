import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useHardware } from '../../context/HardwareContext'

export type ShaftAttachment = 'fan' | 'propeller' | 'flywheel' | 'grinding' | 'impeller'

interface Props {
  attachment: ShaftAttachment
}

export default function MotorModel3D({ attachment }: Props) {
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

  // ── Rotating group ref (so attachment effect can reach it) ───────────────────
  const rotatingGroupRef = useRef<THREE.Group | null>(null)

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

    // ── Motor Group (static — does NOT rotate) ───────────────────────────────
    const motorGroup = new THREE.Group()
    scene.add(motorGroup)

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.0, 32)
    const bodyMesh = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshStandardMaterial({ color: 0x252030, roughness: 0.3, metalness: 0.85 })
    )
    bodyMesh.rotation.z = Math.PI / 2
    motorGroup.add(bodyMesh)

    // End cap — front
    const capFrontGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32)
    const capFrontMesh = new THREE.Mesh(
      capFrontGeo,
      new THREE.MeshStandardMaterial({ color: 0x1a1528, metalness: 0.9 })
    )
    capFrontMesh.rotation.z = Math.PI / 2
    capFrontMesh.position.x = 1.04
    motorGroup.add(capFrontMesh)

    // End cap — rear
    const capRearGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32)
    const capRearMesh = new THREE.Mesh(
      capRearGeo,
      new THREE.MeshStandardMaterial({ color: 0x1a1528, metalness: 0.9 })
    )
    capRearMesh.rotation.z = Math.PI / 2
    capRearMesh.position.x = -1.04
    motorGroup.add(capRearMesh)

    // Cooling fins — 8 fins radially
    for (let i = 0; i < 8; i++) {
      const angle = i * (Math.PI / 4)
      const finGeo = new THREE.BoxGeometry(2.0, 0.06, 0.03)
      const finMesh = new THREE.Mesh(
        finGeo,
        new THREE.MeshStandardMaterial({ color: 0x1a1528, metalness: 0.9, roughness: 0.3 })
      )
      finMesh.rotation.x = angle
      finMesh.position.y = Math.sin(angle) * 0.64
      finMesh.position.z = Math.cos(angle) * 0.64
      motorGroup.add(finMesh)
    }

    // Terminal box
    const terminalGeo = new THREE.BoxGeometry(0.6, 0.3, 0.28)
    const terminalMesh = new THREE.Mesh(
      terminalGeo,
      new THREE.MeshStandardMaterial({ color: 0x2a2040, metalness: 0.6 })
    )
    terminalMesh.position.set(0, 0.75, 0)
    motorGroup.add(terminalMesh)

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.5, 16)
    const shaftMesh = new THREE.Mesh(
      shaftGeo,
      new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 1.0, roughness: 0.1 })
    )
    shaftMesh.rotation.z = Math.PI / 2
    shaftMesh.position.x = 1.5
    motorGroup.add(shaftMesh)

    // Shaft coupling
    const couplingGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16)
    const couplingMesh = new THREE.Mesh(
      couplingGeo,
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 })
    )
    couplingMesh.rotation.z = Math.PI / 2
    couplingMesh.position.x = 2.2
    motorGroup.add(couplingMesh)

    // ── Rotating Group (attachment lives here) ───────────────────────────────
    const rotatingGroup = new THREE.Group()
    rotatingGroup.position.x = 2.3
    scene.add(rotatingGroup)
    rotatingGroupRef.current = rotatingGroup

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
      rotatingGroupRef.current = null
    }
  }, [])

  // ── Attachment rebuild ───────────────────────────────────────────────────────
  useEffect(() => {
    const rg = rotatingGroupRef.current
    if (!rg) return

    // Dispose and clear existing children
    while (rg.children.length > 0) {
      const child = rg.children[0]
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose()
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else (mat as THREE.Material).dispose()
      }
      rg.remove(child)
    }

    if (attachment === 'fan') {
      // 4 blades at 90° intervals
      for (let i = 0; i < 4; i++) {
        const angle = i * (Math.PI / 2)
        const bladeGeo = new THREE.BoxGeometry(0.07, 0.52, 0.07)
        const bladeMesh = new THREE.Mesh(
          bladeGeo,
          new THREE.MeshStandardMaterial({ color: 0x7C3AED, metalness: 0.6 })
        )
        bladeMesh.rotation.x = angle
        bladeMesh.position.y = Math.sin(angle) * 0.26
        bladeMesh.position.z = Math.cos(angle) * 0.26
        rg.add(bladeMesh)
      }
      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16)
      const hubMesh = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      )
      hubMesh.rotation.z = Math.PI / 2
      rg.add(hubMesh)
      // Guard
      const guardGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 24)
      const guardMesh = new THREE.Mesh(
        guardGeo,
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      )
      guardMesh.rotation.z = Math.PI / 2
      rg.add(guardMesh)
    }

    else if (attachment === 'propeller') {
      // 3 long blades at 120° intervals
      for (let i = 0; i < 3; i++) {
        const angle = i * (2 * Math.PI / 3)
        const bladeGeo = new THREE.BoxGeometry(0.04, 1.6, 0.18)
        const bladeMesh = new THREE.Mesh(
          bladeGeo,
          new THREE.MeshStandardMaterial({ color: 0x9333ea, metalness: 0.5, roughness: 0.3 })
        )
        bladeMesh.rotation.x = angle
        bladeMesh.position.y = Math.sin(angle) * 0.8
        bladeMesh.position.z = Math.cos(angle) * 0.8
        bladeMesh.rotation.z = -0.3
        rg.add(bladeMesh)
      }
      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16)
      const hubMesh = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0x666666 })
      )
      hubMesh.rotation.z = Math.PI / 2
      rg.add(hubMesh)
    }

    else if (attachment === 'flywheel') {
      // Heavy disc
      const discGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.28, 48)
      const discMesh = new THREE.Mesh(
        discGeo,
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.95, roughness: 0.15 })
      )
      discMesh.rotation.z = Math.PI / 2
      rg.add(discMesh)
      // Spokes — 4 boxes at 90° intervals
      for (let i = 0; i < 4; i++) {
        const angle = i * (Math.PI / 2)
        const spokeGeo = new THREE.BoxGeometry(0.6, 0.06, 0.06)
        const spokeMesh = new THREE.Mesh(
          spokeGeo,
          new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9 })
        )
        spokeMesh.rotation.x = angle
        rg.add(spokeMesh)
      }
      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.32, 16)
      const hubMesh = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1.0 })
      )
      hubMesh.rotation.z = Math.PI / 2
      rg.add(hubMesh)
    }

    else if (attachment === 'grinding') {
      // Thin abrasive disc
      const discGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.06, 48)
      const discMesh = new THREE.Mesh(
        discGeo,
        new THREE.MeshStandardMaterial({ color: 0x888866, metalness: 0.2, roughness: 0.9 })
      )
      discMesh.rotation.z = Math.PI / 2
      rg.add(discMesh)
      // Rim
      const rimGeo = new THREE.TorusGeometry(0.72, 0.04, 6, 48)
      const rimMesh = new THREE.Mesh(
        rimGeo,
        new THREE.MeshStandardMaterial({ color: 0x777755 })
      )
      rimMesh.rotation.z = Math.PI / 2
      rg.add(rimMesh)
      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16)
      const hubMesh = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
      )
      hubMesh.rotation.z = Math.PI / 2
      rg.add(hubMesh)
    }

    else if (attachment === 'impeller') {
      // 6 curved blades at 60° intervals
      for (let i = 0; i < 6; i++) {
        const angle = i * (Math.PI / 3)
        const bladeGeo = new THREE.BoxGeometry(0.08, 0.4, 0.32)
        const bladeMesh = new THREE.Mesh(
          bladeGeo,
          new THREE.MeshStandardMaterial({ color: 0x6D28D9, metalness: 0.7 })
        )
        bladeMesh.rotation.x = angle
        bladeMesh.position.y = Math.sin(angle) * 0.2
        bladeMesh.position.z = Math.cos(angle) * 0.2
        bladeMesh.rotation.z = 0.4
        rg.add(bladeMesh)
      }
      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.14, 16)
      const hubMesh = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      )
      hubMesh.rotation.z = Math.PI / 2
      rg.add(hubMesh)
      // Shroud ring
      const shroudGeo = new THREE.TorusGeometry(0.48, 0.04, 8, 32)
      const shroudMesh = new THREE.Mesh(
        shroudGeo,
        new THREE.MeshStandardMaterial({ color: 0x5B21B6 })
      )
      shroudMesh.rotation.z = Math.PI / 2
      rg.add(shroudMesh)
    }
  }, [attachment])

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
