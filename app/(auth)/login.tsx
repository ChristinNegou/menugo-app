import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
      return;
    }
    router.replace("/(tabs)");
  };

  const handleForgotPassword = async () => {
    Alert.prompt("Mot de passe oublié", "Entrez votre email :", async (email) => {
      if (email) {
        await supabase.auth.resetPasswordForEmail(email);
        Alert.alert("Envoyé", "Un lien de réinitialisation a été envoyé à votre adresse email.");
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-4">
              <Ionicons name="fast-food" size={40} color="white" />
            </View>
            <Text className="text-text-primary font-bold text-3xl">MenuGo</Text>
            <Text className="text-text-secondary text-base mt-1">Commandez local, mangez bien</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-text-secondary text-sm mb-1.5 font-semibold">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-text-primary text-base"
                    placeholder="exemple@email.com"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>}
            </View>

            <View>
              <Text className="text-text-secondary text-sm mb-1.5 font-semibold">Mot de passe</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-text-primary text-base pr-12"
                      placeholder="••••••••"
                      placeholderTextColor="#A0AEC0"
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#718096" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
            </View>

            <TouchableOpacity onPress={handleForgotPassword} className="self-end">
              <Text className="text-primary text-sm font-semibold">Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className={`bg-primary rounded-2xl py-4 items-center mt-2 ${loading ? "opacity-70" : ""}`}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Connexion..." : "Se connecter"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3 my-2">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-text-secondary text-sm">ou</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity
              onPress={() => { setGuest(true); router.replace("/(tabs)"); }}
              className="border border-gray-200 bg-white rounded-2xl py-4 items-center"
            >
              <Text className="text-text-secondary font-semibold text-base">Continuer sans compte</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-secondary text-base">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-primary font-bold text-base">Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
