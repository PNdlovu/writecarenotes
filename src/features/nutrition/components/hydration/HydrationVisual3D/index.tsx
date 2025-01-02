import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water2'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { type HydrationVisual3DProps } from './types'

export const HydrationVisual3D: React.FC<HydrationVisual3DProps> = ({
  container,
  currentAmount,
  interactive = true,
  onAmountChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const waterRef = useRef<Water>()
  const controlsRef = useRef<OrbitControls>()
  const frameIdRef = useRef<number>()

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0xf0f0f0)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    cameraRef.current = camera
    camera.position.set(0, 2, 3)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    rendererRef.current = renderer
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2
    controls.minDistance = 2
    controls.maxDistance = 7

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 2, 3)
    scene.add(directionalLight)

    // Container geometry
    const containerGeometry = new THREE.CylinderGeometry(
      container.dimensions.width / 100,
      container.dimensions.width / 100,
      container.dimensions.height / 100,
      32
    )
    const containerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
    })
    const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial)
    scene.add(containerMesh)

    // Water setup
    const waterGeometry = new THREE.CircleGeometry(
      container.dimensions.width / 100 * 0.95,
      32
    )
    const water = new Water(waterGeometry, {
      color: new THREE.Color(container.fillColor),
      scale: 1,
      flowDirection: new THREE.Vector2(1, 1),
      textureWidth: 1024,
      textureHeight: 1024,
    })
    water.rotation.x = -Math.PI / 2
    water.position.y = -container.dimensions.height / 200
    waterRef.current = water
    scene.add(water)

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      if (water) {
        water.material.uniforms['time'].value += 1.0 / 60.0
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [container.dimensions.height, container.dimensions.width, container.fillColor])

  // Update water level based on amount
  useEffect(() => {
    if (!waterRef.current) return

    const fillPercentage = currentAmount / container.capacity
    const newPosition = -container.dimensions.height / 200 +
      (container.dimensions.height / 100) * fillPercentage

    waterRef.current.position.y = newPosition
  }, [currentAmount, container.capacity, container.dimensions.height])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={mountRef}
      className={`relative ${className}`}
      style={{
        height: container.dimensions.height,
        width: container.dimensions.width,
      }}
    />
  )
}

export default HydrationVisual3D
