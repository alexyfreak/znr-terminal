import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'rounded-zn-btn px-6 py-3 font-sans font-semibold text-sm transition-opacity duration-150 disabled:opacity-40'
  const variants = {
    primary: 'bg-[#EDEDED] text-zn-page',
    outline: 'border border-white/20 bg-transparent text-zn-text',
    ghost: 'bg-zn-elevated text-zn-text-muted',
    danger: 'bg-zn-error-text text-white',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
