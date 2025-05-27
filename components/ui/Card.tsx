import type React from "react"
import { View, Text } from "react-native"

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <View className={`card ${className}`}>
      {(title || subtitle) && (
        <View className="mb-3">
          {title && <Text className="text-title mb-1">{title}</Text>}
          {subtitle && <Text className="text-sm text-secondary-400">{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  )
}
