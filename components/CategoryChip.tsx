import { TouchableOpacity, Text } from "react-native";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${selected ? "bg-primary" : "bg-white border border-gray-200"}`}
    >
      <Text className={`text-sm font-semibold ${selected ? "text-white" : "text-text-secondary"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
