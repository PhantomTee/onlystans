import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useHardware } from '../../context/HardwareContext'

export default function MotorModel3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { hardware } = useHardware()
  const hardwareRef = useRef(hardware)

  // Keep ref in sync without triggering re-render
  useEffect(() => {
    hardwareRef.current = hardware
  }, [hardware])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // --- Scene ---
    const scene = new THREE.Scene()
    scene.background = null

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 1.5, 4)
    camera.lookAt(0, 0, 0)

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)

    const accentLight = new THREE.PointLight(0x000000, 0, 10)
    accentLight.position.set(0, 0, 2)
    scene.add(accentLight)

    // --- Motor Group ---
    const motorGroup = new THREE.Group()
    scene.add(motorGroup)

    // Motor body — cylinder rotated 90deg on Z
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.8,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.rotation.z = Math.PI / 2
    motorGroup.add(bodyMesh)

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16)
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 1.0,
      roughness: 0.2,
    })
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.rotation.z = Math.PI / 2
    shaftMesh.position.x = 1.3
    motorGroup.add(shaftMesh)

    // Fan blades — 3 boxes at 120deg intervals
    const fanGroup = new THREE.Group()
    fanGroup.position.x = 1.85
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x555555 })

    for (let i = 0; i < 3; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05)
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat)
      const angle = (i / 3) * Math.PI * 2
      bladeMesh.position.y = Math.sin(angle) * 0.2
      bladeMesh.position.z = Math.cos(angle) * 0.2
      bladeMesh.rotation.x = angle
      fanGroup.add(bladeMesh)
    }
    motorGroup.add(fanGroup)

    // --- Animation state ---
    let animFrameId: number
    let currentSpeed = 0 // radians per frame

    const animate = () => {
      animFrameId = requestAnimationFrame(animate)

      const { motorStatus, currentRPM, direction } = hardwareRef.current
      const directionSign = direction === 'FORWARD' ? 1 : -1

      if (motorStatus === 'RUNNING') {
        // Target angular velocity in radians/frame at 60fps
        const targetSpeed = (currentRPM / 60) * (2 * Math.PI) * (1 / 60) * directionSign
        // Smoothly approach target speed
        currentSpeed += (targetSpeed - currentSpeed) * 0.1
      } else {
        // Decelerate to 0
        currentSpeed *= 0.95
        if (Math.abs(currentSpeed) < 0.0001) currentSpeed = 0
      }

      // Rotate around X axis (the shaft axis, after our Z rotation)
      motorGroup.rotation.x += currentSpeed
      fanGroup.rotation.x += currentSpeed

      // Update accent light based on motor status
      if (motorStatus === 'RUNNING') {
        accentLight.color.set(0x00c853)
        accentLight.intensity = 1.0
      } else if (motorStatus === 'ERROR') {
        accentLight.color.set(0xff1744)
        accentLight.intensity = 1.0
      } else {
        accentLight.intensity = 0
      }

      renderer.render(scene, camera)
    }

    animate()

    // --- Resize handler ---
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

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '200px',
        background: 'transparent',
      }}
    />
  )
}
