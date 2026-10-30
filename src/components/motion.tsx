"use client"

import { useEffect, useRef } from "react"
import {
  animate,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

// Fade + rise into place once, when scrolled into view.
export function Reveal({
  delay = 0,
  y = 16,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      {...props}
    />
  )
}

// Container that staggers its StaggerItem children.
export function Stagger({
  stagger = 0.08,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
      {...props}
    />
  )
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      {...props}
    />
  )
}

// Counts up to `to` when scrolled into view. `format` renders the number.
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const value = useMotionValue(0)
  const text = useTransform(
    value,
    (v) =>
      `${prefix}${v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`
  )

  useEffect(() => {
    if (!inView) return
    const controls = animate(value, to, { duration, ease: EASE })
    return () => controls.stop()
  }, [inView, to, duration, value])

  return <motion.span ref={ref}>{text}</motion.span>
}

// Wrap the app once. "never" keeps animations on even if the OS has animations
// turned off; switch to "user" to follow the OS reduced-motion setting.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>
}
