import { View, Text, FlatList, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Découvrez les restaurants\nde votre quartier",
    description: "Explorez des dizaines de restaurants locaux québécois, triés par popularité et distance.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    bg: "#FFF3EE",
  },
  {
    id: "2",
    title: "Commandez en\nquelques secondes",
    description: "Naviguez dans les menus, ajoutez vos plats préférés au panier et validez en un clic.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600",
    bg: "#EEFAF5",
  },
  {
    id: "3",
    title: "Prêt en 20 minutes,\nà emporter !",
    description: "Suivez l'avancement de votre commande en temps réel et récupérez-la quand c'est prêt.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    bg: "#EEF4FF",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_done", "1");
    router.replace("/(auth)/login");
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem("onboarding_done", "1");
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
          <Text className="text-text-secondary text-base">Passer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 px-6 items-center justify-center">
            <View className="w-full h-64 rounded-3xl overflow-hidden mb-8">
              <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="text-text-primary font-bold text-3xl text-center leading-snug mb-4">
              {item.title}
            </Text>
            <Text className="text-text-secondary text-base text-center leading-relaxed">
              {item.description}
            </Text>
          </View>
        )}
      />

      <View className="px-6 pb-8">
        <View className="flex-row justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === currentIndex ? "w-6 bg-primary" : "w-2 bg-gray-200"}`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {currentIndex < SLIDES.length - 1 ? "Suivant" : "Commencer"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
