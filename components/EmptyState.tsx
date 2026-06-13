import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, children }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name={icon} size={64} color="#CBD5E0" />
      <Text className="text-text-primary font-bold text-xl mt-4 text-center">{title}</Text>
      {subtitle && (
        <Text className="text-text-secondary text-base mt-2 text-center">{subtitle}</Text>
      )}
      {children && <View className="mt-6">{children}</View>}
    </View>
  );
}
