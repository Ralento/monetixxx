import { TouchableOpacity, Text, ActivityIndicator } from "react-native"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "danger" | "outline"
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function Button({
                         title,
                         onPress,
                         variant = "primary",
                         loading = false,
                         disabled = false,
                         className = "",
                       }: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "btn-primary"
      case "secondary":
        return "btn-secondary"
      case "danger":
        return "btn-danger"
      case "outline":
        return "btn-outline"
      default:
        return "btn-primary"
    }
  }

  const buttonClasses = `${getVariantClasses()} ${disabled || loading ? "opacity-50" : ""} ${className}`

  return (
    <TouchableOpacity className={buttonClasses} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#333333" : "#ffd166"} size="small" />
      ) : (
        <Text
          className={`text-center font-medium ${
            variant === "primary" ? "text-secondary-900" : variant === "secondary" ? "text-primary-300" : "text-white"
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
