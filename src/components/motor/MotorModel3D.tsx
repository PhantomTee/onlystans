import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { useHardware } from '../../context/HardwareContext'

export default function MotorModel3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { hardware } = useHardware()
  const hardwareRef = useRef(hardware)

  // Keep hardware ref in sync without triggering re-render
  useEffect(() => {
    hardwareRef.current = hardware
  }, [hardware])

  // ── Orbit state ─────────────────────────────────────────────────────────────
  const orbitRef = useRef({
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    theta: 0.5,   // horizontal angle
    phi: 1.2,     // vertical angle (from top)
    radius: 5,
  })

  // Touch tracking (single finger)
  const touchRef = useRef({ x: 0, y: 0 })

  const handleResetView = useCallback(() => {
    orbitRef.current.theta = 0.5
    orbitRef.current.phi = 1.2
    orbitRef.current.radius = 5
  }, [])

  // ── Three.js scene ───────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // ── Scene ──
    const scene = new THREE.Scene()
    scene.background = null

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight.position.set(4, 6, 4)
    dirLight.castShadow = true
    scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-4, 2, -4)
    scene.add(fillLight)

    const accentLight = new THREE.PointLight(0x6D28D9, 1.2, 12)
    accentLight.position.set(0, 0, 3)
    scene.add(accentLight)

    // ── Materials ──
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.3,
      metalness: 0.85,
    })
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.25,
      metalness: 0.9,
    })
    const terminalMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.6,
    })
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.1,
      metalness: 1.0,
    })
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.4,
      metalness: 0.5,
    })
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
      metalness: 0.7,
    })
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.7,
    })

    // ── Motor Group ──
    const motorGroup = new THREE.Group()
    scene.add(motorGroup)

    // Motor body — cylinder on X axis
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.0, 32)
    const bodyMesh = new THREE.Mesh(bodyGeo, darkMat)
    bodyMesh.rotation.z = Math.PI / 2
    motorGroup.add(bodyMesh)

    // End cap — front
    const capFrontGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32)
    const capFrontMesh = new THREE.Mesh(capFrontGeo, darkMat)
    capFrontMesh.rotation.z = Math.PI / 2
    capFrontMesh.position.x = 1.04
    motorGroup.add(capFrontMesh)

    // End cap — rear
    const capRearGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32)
    const capRearMesh = new THREE.Mesh(capRearGeo, darkMat)
    capRearMesh.rotation.z = Math.PI / 2
    capRearMesh.position.x = -1.04
    motorGroup.add(capRearMesh)

    // Cooling fins — 8 thin boxes around the cylinder
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const finGeo = new THREE.BoxGeometry(2.0, 0.05, 0.02)
      const finMesh = new THREE.Mesh(finGeo, finMat)
      finMesh.rotation.x = angle
      // Offset the fin outward from center by roughly the cylinder radius
      finMesh.position.y = Math.sin(angle) * 0.62
      finMesh.position.z = Math.cos(angle) * 0.62
      motorGroup.add(finMesh)
    }

    // Terminal box on top
    const terminalGeo = new THREE.BoxGeometry(0.5, 0.3, 0.25)
    const terminalMesh = new THREE.Mesh(terminalGeo, terminalMat)
    terminalMesh.position.set(0, 0.75, 0)
    motorGroup.add(terminalMesh)

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16)
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.rotation.z = Math.PI / 2
    shaftMesh.position.x = 1.5
    motorGroup.add(shaftMesh)

    // Fan blades — 4 blades at 90deg intervals
    const fanGroup = new THREE.Group()
    fanGroup.position.x = 2.1
    motorGroup.add(fanGroup)

    const fanBlades: THREE.Mesh[] = []
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const bladeGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06)
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat.clone())
      bladeMesh.position.y = Math.sin(angle) * 0.22
      bladeMesh.position.z = Math.cos(angle) * 0.22
      bladeMesh.rotation.x = angle
      fanGroup.add(bladeMesh)
      fanBlades.push(bladeMesh)
    }

    // Fan guard (torus)
    const guardGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 24)
    const guardMesh = new THREE.Mesh(guardGeo, guardMat)
    guardMesh.rotation.z = Math.PI / 2
    guardMesh.position.x = 0.05 // slightly ahead of blades within group
    fanGroup.add(guardMesh)

    // Mounting foot
    const footGeo = new THREE.BoxGeometry(1.8, 0.15, 0.4)
    const footMesh = new THREE.Mesh(footGeo, footMat)
    footMesh.position.set(0, -0.65, 0)
    motorGroup.add(footMesh)

    // ── Animation state ──
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

      // Rotate body and fan
      motorGroup.rotation.x += currentSpeed
      fanGroup.rotation.x += currentSpeed

      // Fan blade color
      const bladeColor = motorStatus === 'RUNNING' ? 0x00c853 : 0x555555
      fanBlades.forEach(blade => {
        ;(blade.material as THREE.MeshStandardMaterial).color.set(bladeColor)
      })

      // Accent light color
      if (motorStatus === 'RUNNING') {
        accentLight.color.set(0x00c853)
      } else if (motorStatus === 'ERROR') {
        accentLight.color.set(0xff1744)
      } else {
        accentLight.color.set(0x6D28D9)
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

    // ── Resize observer ──
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

    // ── Mouse orbit controls ──
    const onMouseDown = (e: MouseEvent) => {
      orbitRef.current.isDragging = true
      orbitRef.current.lastMouseX = e.clientX
      orbitRef.current.lastMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!orbitRef.current.isDragging) return
      const deltaX = (e.clientX - orbitRef.current.lastMouseX) * 0.01
      const deltaY = (e.clientY - orbitRef.current.lastMouseY) * 0.01
      orbitRef.current.lastMouseX = e.clientX
      orbitRef.current.lastMouseY = e.clientY
      orbitRef.current.theta += deltaX
      orbitRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, orbitRef.current.phi + deltaY)
      )
    }

    const onMouseUp = () => {
      orbitRef.current.isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      orbitRef.current.radius = Math.max(
        2,
        Math.min(10, orbitRef.current.radius - e.deltaY * 0.01)
      )
    }

    // ── Touch orbit controls ──
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchRef.current.x = e.touches[0].clientX
        touchRef.current.y = e.touches[0].clientY
        orbitRef.current.isDragging = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!orbitRef.current.isDragging || e.touches.length !== 1) return
      const deltaX = (e.touches[0].clientX - touchRef.current.x) * 0.01
      const deltaY = (e.touches[0].clientY - touchRef.current.y) * 0.01
      touchRef.current.x = e.touches[0].clientX
      touchRef.current.y = e.touches[0].clientY
      orbitRef.current.theta += deltaX
      orbitRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, orbitRef.current.phi + deltaY)
      )
    }

    const onTouchEnd = () => {
      orbitRef.current.isDragging = false
    }

    // Container listeners (mousedown, wheel, touch)
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd)

    // Window listeners (mousemove, mouseup — so drag doesn't break on fast moves)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()

      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Cursor style while dragging
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDownCursor = () => setIsDragging(true)
  const handleMouseUpCursor = () => setIsDragging(false)

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '220px' }}
      onMouseDown={handleMouseDownCursor}
      onMouseUp={handleMouseUpCursor}
    >
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />

      {/* Reset View button overlay */}
      <button
        onClick={handleResetView}
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          color: '#888888',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          userSelect: 'none',
          lineHeight: 1.4,
        }}
      >
        &#x27F3; Reset
      </button>
    </div>
  )
}
