import { View } from "react-native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

function SkeletonBox({ width, height, className }: { width?: number | string; height: number; className?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity, width: width as number, height }}
      className={`bg-gray-200 rounded-lg ${className ?? ""}`}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl overflow-hidden mr-4 w-56 shadow-sm">
      <SkeletonBox height={140} width="100%" className="rounded-none" />
      <View className="p-3 gap-2">
        <SkeletonBox height={16} width={140} />
        <SkeletonBox height={12} width={90} />
        <SkeletonBox height={12} width={110} />
      </View>
    </View>
  );
}

export function MenuItemSkeleton() {
  return (
    <View className="flex-row items-center px-4 py-3 gap-3">
      <SkeletonBox height={72} width={72} className="rounded-xl" />
      <View className="flex-1 gap-2">
        <SkeletonBox height={14} width={160} />
        <SkeletonBox height={12} width={200} />
        <SkeletonBox height={12} width={60} />
      </View>
    </View>
  );
}
