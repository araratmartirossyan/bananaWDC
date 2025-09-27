"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { LiquidGlass } from "./liquid-glass"
import type { Filter } from "./camera-app"

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

const SwitchCameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string, facingMode: "user" | "environment") => void
  selectedFilter: Filter
  onFilterSelect: (index: number) => void
  filterIndex: number
  filters: Filter[]
}

export function CameraCapture({ onCapture, selectedFilter, onFilterSelect, filterIndex, filters }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isDesktop, setIsDesktop] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const hasEverTakenPhoto = localStorage.getItem("banana-camera-photo-taken")
        const hasEverTakenPhotoAlt = localStorage.getItem("banana_camera_photo_taken") // Alternative key
        const sessionFlag = sessionStorage.getItem("banana-camera-photo-taken")

        console.log("[v0] Initializing showSwipeHint - localStorage value:", hasEverTakenPhoto)
        console.log("[v0] Initializing showSwipeHint - alternative key:", hasEverTakenPhotoAlt)
        console.log("[v0] Initializing showSwipeHint - sessionStorage value:", sessionFlag)
        console.log("[v0] Initializing showSwipeHint - all localStorage keys:", Object.keys(localStorage))

        // Check if any of the storage methods indicate a photo was taken
        const photoWasTaken = hasEverTakenPhoto === "true" || hasEverTakenPhotoAlt === "true" || sessionFlag === "true"
        console.log("[v0] Photo was taken before:", photoWasTaken)

        return !photoWasTaken
      } catch (error) {
        console.log("[v0] Error reading localStorage:", error)
        return true // Default to showing hint if there's an error
      }
    }
    return true
  })
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const lastScrollTime = useRef(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout>()

  const [momentum, setMomentum] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const momentumRef = useRef(0)
  const velocityRef = useRef(0)
  const lastTouchTime = useRef(0)
  const animationFrameRef = useRef<number>()
  const touchHistory = useRef<Array<{ x: number; time: number }>>([])

  const [wheelRotation, setWheelRotation] = useState(0)
  const wheelRotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const isWheelAnimatingRef = useRef(false)
  const autoCenterTimeoutRef = useRef<NodeJS.Timeout>()

  const startCamera = useCallback(
    async (facing: "user" | "environment" = facingMode) => {
      try {
        setIsLoading(true)
        setError(null)

        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }

        setStream(newStream)
        setFacingMode(facing)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access camera. Please check permissions.")
      } finally {
        setIsLoading(false)
      }
    },
    [stream, facingMode],
  )

  const compressImage = useCallback(
    (imageDataUrl: string, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            resolve(imageDataUrl)
            return
          }

          let { width, height } = img

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
          resolve(compressedDataUrl)
        }
        img.src = imageDataUrl
      })
    },
    [],
  )

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (facingMode === "user") {
      context.scale(-1, 1)
      context.translate(-canvas.width, 0)
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
    const compressedImageUrl = await compressImage(imageDataUrl)

    console.log("[v0] Photo captured - hiding hint and saving to localStorage")
    setShowSwipeHint(false)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("banana-camera-photo-taken", "true")
        localStorage.setItem("banana_camera_photo_taken", "true") // Alternative key
        sessionStorage.setItem("banana-camera-photo-taken", "true")
        console.log("[v0] localStorage set - banana-camera-photo-taken: true")
        console.log("[v0] All storage locations updated")
      } catch (error) {
        console.log("[v0] Error saving to localStorage:", error)
      }
    }

    onCapture(compressedImageUrl, facingMode)
  }, [onCapture, compressImage, facingMode])

  const switchCamera = useCallback(() => {
    const newFacing = facingMode === "user" ? "environment" : "user"
    startCamera(newFacing)
  }, [facingMode, startCamera])

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string
        if (imageDataUrl) {
          const compressedImageUrl = await compressImage(imageDataUrl)

          console.log("[v0] Image uploaded - hiding hint and saving to localStorage")
          setShowSwipeHint(false)
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("banana-camera-photo-taken", "true")
              localStorage.setItem("banana_camera_photo_taken", "true") // Alternative key
              sessionStorage.setItem("banana-camera-photo-taken", "true")
              console.log("[v0] localStorage set - banana-camera-photo-taken: true")
              console.log("[v0] All storage locations updated")
            } catch (error) {
              console.log("[v0] Error saving to localStorage:", error)
            }
          }

          onCapture(compressedImageUrl, "environment")
        }
      }
      reader.readAsDataURL(file)
    },
    [onCapture, compressImage],
  )

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (autoCenterTimeoutRef.current) {
      clearTimeout(autoCenterTimeoutRef.current)
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    // Reset all animation states to prevent erratic movement
    wheelRotationRef.current = 0
    targetRotationRef.current = 0
    velocityRef.current = 0
    momentumRef.current = 0
    isWheelAnimatingRef.current = false

    setWheelRotation(0)
    setMomentum(0)
    setVelocity(0)
    setIsTransitioning(false)

    lastTouchTime.current = Date.now()
    touchHistory.current = [{ x: touch.clientX, time: Date.now() }]
  }, [])

  const autoCenter = useCallback(() => {
    console.log("[v0] Auto-centering from rotation:", wheelRotationRef.current)

    const startRotation = wheelRotationRef.current
    const startTime = Date.now()
    const duration = 200

    const animateToCenter = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 2) // Smooth easing

      wheelRotationRef.current = startRotation * (1 - easeOut)
      setWheelRotation(wheelRotationRef.current)
      setMomentum(wheelRotationRef.current)

      if (progress < 1) {
        requestAnimationFrame(animateToCenter)
      } else {
        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        console.log("[v0] Auto-center complete")
      }
    }

    requestAnimationFrame(animateToCenter)
  }, [])

  const animateMomentum = useCallback(() => {
    const friction = 0.96 // Increased from 0.92 for more control
    const snapThreshold = 0.1

    velocityRef.current *= friction
    wheelRotationRef.current += velocityRef.current * 0.4 // Reduced from 0.7 for slower movement

    const rotationThreshold = 20 // Reduced from 30 for quicker response
    if (Math.abs(wheelRotationRef.current) > rotationThreshold) {
      const direction = wheelRotationRef.current > 0 ? 1 : -1
      let newIndex

      if (direction > 0) {
        newIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0
      } else {
        newIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
      }

      console.log(
        "[v0] Momentum filter change from",
        filterIndex,
        "to",
        newIndex,
        "rotation:",
        wheelRotationRef.current,
      )
      onFilterSelect(newIndex)
      setShowSwipeHint(false)

      wheelRotationRef.current = 0
      targetRotationRef.current = 0
      velocityRef.current = 0
      setWheelRotation(0)
      setMomentum(0)
      setVelocity(0)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (autoCenterTimeoutRef.current) {
        clearTimeout(autoCenterTimeoutRef.current)
      }

      return
    }

    if (Math.abs(velocityRef.current) > 0.05 || Math.abs(wheelRotationRef.current) > 0.3) {
      isWheelAnimatingRef.current = true
      animationFrameRef.current = requestAnimationFrame(animateMomentum)
    } else {
      isWheelAnimatingRef.current = false
      console.log("[v0] Momentum stopped - starting auto-center")
      if (autoCenterTimeoutRef.current) {
        clearTimeout(autoCenterTimeoutRef.current)
      }
      autoCenterTimeoutRef.current = setTimeout(autoCenter, 50)
    }

    setWheelRotation(wheelRotationRef.current)
    setMomentum(wheelRotationRef.current)
    setVelocity(velocityRef.current)
  }, [filterIndex, filters.length, onFilterSelect, autoCenter])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return

      const touch = e.touches[0]
      const currentTime = Date.now()
      const deltaX = touch.clientX - touchStart.x

      wheelRotationRef.current = deltaX * 0.3 // Reduced from 0.5 for slower movement
      setWheelRotation(wheelRotationRef.current)
      setMomentum(wheelRotationRef.current)

      touchHistory.current.push({ x: touch.clientX, time: currentTime })
      touchHistory.current = touchHistory.current.filter((t) => currentTime - t.time < 100)

      const rotationThreshold = 18 // Reduced from 25 for quicker response
      if (Math.abs(wheelRotationRef.current) > rotationThreshold) {
        const direction = wheelRotationRef.current > 0 ? -1 : 1 // Inverted for natural feel
        let newIndex

        if (direction > 0) {
          newIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0
        } else {
          newIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
        }

        console.log(
          "[v0] Touch drag filter change from",
          filterIndex,
          "to",
          newIndex,
          "rotation:",
          wheelRotationRef.current,
        )
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setTouchStart({ x: touch.clientX, y: touch.clientY }) // Reset touch start for continuous dragging
      }
    },
    [touchStart, filterIndex, filters.length, onFilterSelect],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const currentTime = Date.now()

      const recentTouches = touchHistory.current.filter((t) => currentTime - t.time < 100)
      if (recentTouches.length >= 2) {
        const firstTouch = recentTouches[0]
        const lastTouch = recentTouches[recentTouches.length - 1]
        const timeDiff = lastTouch.time - firstTouch.time

        if (timeDiff > 0) {
          velocityRef.current = ((lastTouch.x - firstTouch.x) / timeDiff) * 5 // Reduced from 8
        }
      }

      const swipeThreshold = 20 // Reduced from 30 for quicker response
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        let newIndex

        if (deltaX > 0) {
          newIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
        } else {
          newIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0
        }

        console.log("[v0] Touch swipe filter change from", filterIndex, "to", newIndex, "deltaX:", deltaX)
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        velocityRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setVelocity(0)
      } else if (Math.abs(deltaX) > 5 && Math.abs(velocityRef.current) > 0.3) {
        animateMomentum()
      } else {
        console.log("[v0] Touch end - starting auto-center")
        if (autoCenterTimeoutRef.current) {
          clearTimeout(autoCenterTimeoutRef.current)
        }
        autoCenterTimeoutRef.current = setTimeout(autoCenter, 100)
      }

      setTouchStart(null)
      touchHistory.current = []
    },
    [touchStart, filterIndex, filters.length, onFilterSelect, animateMomentum, autoCenter],
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isTransitioning) return

      const now = Date.now()
      if (now - lastScrollTime.current < 16) {
        return
      }
      lastScrollTime.current = now

      const deltaY = Math.abs(e.deltaY)
      const deltaX = Math.abs(e.deltaX)

      if (deltaY < 1 && deltaX < 1) return

      const scrollIntensity = Math.min(Math.max(deltaY + deltaX, 5), 50)
      const direction = (deltaX > deltaY ? e.deltaX : e.deltaY) > 0 ? 1 : -1

      wheelRotationRef.current += direction * scrollIntensity * 0.15 // Reduced from 0.25
      velocityRef.current = direction * scrollIntensity * 0.05 // Reduced from 0.08

      console.log("[v0] Wheel event, rotation:", wheelRotationRef.current, "direction:", direction)

      if (Math.abs(wheelRotationRef.current) > 25) {
        // Reduced from 35
        let newIndex

        if (wheelRotationRef.current > 0) {
          newIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0
        } else {
          newIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
        }

        console.log("[v0] Wheel filter change from", filterIndex, "to", newIndex)
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        velocityRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setVelocity(0)

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (autoCenterTimeoutRef.current) {
          clearTimeout(autoCenterTimeoutRef.current)
        }

        return
      }

      if (autoCenterTimeoutRef.current) {
        clearTimeout(autoCenterTimeoutRef.current)
      }

      animateMomentum()
    },
    [filterIndex, filters.length, onFilterSelect, isTransitioning, animateMomentum],
  )

  const handleFilterChange = useCallback(
    (newIndex: number) => {
      if (newIndex !== filterIndex && !isTransitioning) {
        setIsTransitioning(true)
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        velocityRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setVelocity(0)

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false)
        }, 500)
      }
    },
    [filterIndex, onFilterSelect, isTransitioning],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isTransitioning) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        const newIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
        setIsTransitioning(true)
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        velocityRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setVelocity(0)

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false)
        }, 600)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        const newIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0
        setIsTransitioning(true)
        onFilterSelect(newIndex)
        setShowSwipeHint(false)

        wheelRotationRef.current = 0
        targetRotationRef.current = 0
        velocityRef.current = 0
        setWheelRotation(0)
        setMomentum(0)
        setVelocity(0)

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current)
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false)
        }, 600)
      }
    },
    [filterIndex, filters.length, onFilterSelect, isTransitioning],
  )

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768 && !("ontouchstart" in window))
    }

    checkIsDesktop()
    window.addEventListener("resize", checkIsDesktop)

    return () => window.removeEventListener("resize", checkIsDesktop)
  }, [])

  useEffect(() => {
    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (autoCenterTimeoutRef.current) {
        clearTimeout(autoCenterTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    console.log("[v0] Camera state - isLoading:", isLoading, "error:", error)
  }, [isLoading, error])

  useEffect(() => {
    console.log("[v0] showSwipeHint state changed to:", showSwipeHint)
  }, [showSwipeHint])

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4 px-8">
          <CameraIcon className="w-16 h-16 mx-auto text-white/60" />
          <div>
            <h3 className="text-xl font-medium">Camera Error</h3>
            <p className="text-white/60 mt-2">{error}</p>
          </div>
          <LiquidGlass variant="button" intensity="medium" onClick={() => startCamera()} className="text-white">
            Retry
          </LiquidGlass>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative bg-black touch-none select-none border-0"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Starting camera...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
        }}
        onLoadedMetadata={() => setIsLoading(false)}
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/banana-camera-logo.png"
              alt="Banana Camera"
              className="w-12 h-12 md:w-24 md:h-24 object-contain"
            />
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={triggerImageUpload}
              className="text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <UploadIcon className="w-4 h-4" />
            </LiquidGlass>

            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={switchCamera}
              className="text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <SwitchCameraIcon className="w-5 h-5" />
            </LiquidGlass>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-12 md:pb-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto z-20">
        <div className="flex justify-center items-center">
          <LiquidGlass
            variant="panel"
            intensity="medium"
            rippleEffect={false}
            flowOnHover={false}
            stretchOnDrag={false}
            className={`${isDesktop ? "w-16 h-16" : "w-20 h-20"} flex items-center justify-center cursor-pointer`}
            style={{ borderRadius: "50%" }}
            onClick={capturePhoto}
          >
            <CameraIcon className={`${isDesktop ? "w-6 h-6" : "w-8 h-8"} text-white`} />
          </LiquidGlass>
        </div>

        <div className="flex justify-center mt-4 md:mt-6">
          <div
            className="px-6 md:px-8 py-3 relative overflow-hidden bg-black/20 backdrop-blur-sm"
            style={{
              borderRadius: "24px",
              width: "min(280px, calc(100vw - 48px))",
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

            <div className="flex items-center justify-center relative" style={{ height: "28px" }}>
              <div
                className="flex items-center"
                style={{
                  transform: `translateX(${wheelRotation === 0 ? 0 : wheelRotation * (window.innerWidth < 768 ? 0.25 : 0.35)}px)`,
                  transition: isTransitioning
                    ? "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    : wheelRotation === 0
                      ? "transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                      : "none",
                  width: "100%",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {(() => {
                  const prevIndex = filterIndex > 0 ? filterIndex - 1 : filters.length - 1
                  const nextIndex = filterIndex < filters.length - 1 ? filterIndex + 1 : 0

                  const visibleFilters = [
                    { filter: filters[prevIndex], index: prevIndex, position: "prev" },
                    { filter: filters[filterIndex], index: filterIndex, position: "current" },
                    { filter: filters[nextIndex], index: nextIndex, position: "next" },
                  ]

                  return visibleFilters.map(({ filter, index, position }) => {
                    const isCurrent = position === "current"

                    return (
                      <button
                        key={`${filter.id}-${position}`}
                        onClick={() => handleFilterChange(index)}
                        className={`font-mono text-sm font-medium flex-shrink-0 text-center transition-all duration-300 whitespace-nowrap relative px-4 py-2 rounded-full ${
                          isCurrent
                            ? "text-yellow-400 bg-white/10 backdrop-blur-sm border border-white/20"
                            : "text-white/60 hover:text-white/80"
                        }`}
                        style={{
                          transition: isTransitioning
                            ? "all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            : "all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                      >
                        <span className="relative z-10">{filter.name}</span>
                      </button>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSwipeHint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <LiquidGlass
            variant="panel"
            intensity="medium"
            rippleEffect={false}
            flowOnHover={false}
            stretchOnDrag={false}
            className="px-4 py-2 animate-pulse"
            style={{ borderRadius: "16px" }}
          >
            <div className="flex items-center space-x-2 text-white/80 font-mono text-sm">
              <span>←</span>
              <span className="whitespace-nowrap">{isDesktop ? "scroll & capture" : "swipe & capture"}</span>
              <span>→</span>
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  )
}
