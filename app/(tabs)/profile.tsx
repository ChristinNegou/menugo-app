import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { EmptyState } from "@/components/EmptyState";

function MenuItem({ icon, label, onPress, danger }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 bg-white border-b border-gray-50"
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={danger ? "#E53E3E" : "#718096"} />
      <Text className={`flex-1 ml-3 text-base ${danger ? "text-red-500 font-semibold" : "text-text-primary"}`}>
        {label}
      </Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />}
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest px-4 py-3 mt-4">
      {title}
    </Text>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, setGuest } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert("Se déconnecter", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          setGuest(false);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-4 pt-6 pb-4">
          <Text className="text-text-primary font-bold text-2xl">Profil</Text>
        </View>
        <EmptyState
          icon="person-outline"
          title="Bonjour !"
          subtitle="Connectez-vous pour accéder à vos commandes et favoris"
        >
          <View className="gap-3 w-full px-4">
            <TouchableOpacity
              className="bg-primary rounded-2xl py-3.5 items-center"
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-white font-bold text-base">Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-primary rounded-2xl py-3.5 items-center"
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text className="text-primary font-bold text-base">Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </EmptyState>
      </SafeAreaView>
    );
  }

  const displayName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
    : user.email?.split("@")[0] ?? "Utilisateur";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-4">
          <Text className="text-text-primary font-bold text-2xl">Profil</Text>
        </View>

        {/* Avatar */}
        <View className="items-center py-6 bg-white">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-3">
            <Text className="text-white font-bold text-2xl">{initials}</Text>
          </View>
          <Text className="text-text-primary font-bold text-xl">{displayName}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">{user.email}</Text>
        </View>

        <SectionTitle title="Mon compte" />
        <View className="rounded-2xl overflow-hidden mx-0">
          <MenuItem icon="person-outline" label="Informations personnelles" onPress={() => {}} />
          <MenuItem icon="location-outline" label="Adresses sauvegardées" onPress={() => {}} />
          <MenuItem icon="card-outline" label="Méthodes de paiement" onPress={() => {}} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
        </View>

        <SectionTitle title="Préférences" />
        <View className="rounded-2xl overflow-hidden">
          <MenuItem icon="language-outline" label="Langue — Français" onPress={() => {}} />
          <MenuItem icon="moon-outline" label="Thème — Clair" onPress={() => {}} />
        </View>

        <SectionTitle title="Support" />
        <View className="rounded-2xl overflow-hidden">
          <MenuItem icon="help-circle-outline" label="FAQ" onPress={() => {}} />
          <MenuItem icon="chatbubble-outline" label="Nous contacter" onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Conditions d'utilisation" onPress={() => {}} />
        </View>

        <View className="mx-4 mt-6 mb-10 bg-white rounded-2xl overflow-hidden">
          <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={handleSignOut} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
