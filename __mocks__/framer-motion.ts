import React from 'react'

const ForwardedMotionDiv = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { initial, animate, exit, transition, layout, whileHover, whileTap, ...rest } = props
  return React.createElement('div', { ...rest, ref })
})
ForwardedMotionDiv.displayName = 'MotionDiv'

const createMotionComponent = (tag: string) => {
  const Component = React.forwardRef<any, any>((props, ref) => {
    const { initial, animate, exit, transition, layout, whileHover, whileTap, ...rest } = props
    return React.createElement(tag, { ...rest, ref })
  })
  Component.displayName = `motion.${tag}`
  return Component
}

const motion = new Proxy({}, {
  get: (_target, prop: string) => {
    if (prop === 'div') return ForwardedMotionDiv
    return createMotionComponent(prop)
  },
}) as any

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
export { motion }
export default motion
