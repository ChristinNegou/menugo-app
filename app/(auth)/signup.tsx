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

const schema = z.object({
  first_name: z.string().min(2, "Prénom requis"),
  last_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  confirm_password: z.string(),
  phone: z.string().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions" }) }),
}).refine((d) => d.password === d.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false as unknown as true },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { first_name: data.first_name, last_name: data.last_name, phone: data.phone },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }
    Alert.alert("Compte créé !", "Vérifiez votre email pour confirmer votre compte.", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") },
    ]);
  };

  const Field = ({ name, label, placeholder, keyboardType, secureTextEntry, autoCapitalize }: {
    name: keyof FormData; label: string; placeholder: string;
    keyboardType?: "email-address" | "phone-pad" | "default";
    secureTextEntry?: boolean; autoCapitalize?: "none" | "words";
  }) => (
    <View>
      <Text className="text-text-secondary text-sm mb-1.5 font-semibold">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-text-primary text-base"
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            keyboardType={keyboardType ?? "default"}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize ?? "sentences"}
            onChangeText={onChange}
            value={value as string}
          />
        )}
      />
      {errors[name] && <Text className="text-red-500 text-sm mt-1">{errors[name]?.message as string}</Text>}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TouchableOpacity onPress={() => router.back()} className="px-6 pt-2 pb-0">
        <Ionicons name="arrow-back" size={24} color="#1A202C" />
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-4 gap-4" keyboardShouldPersistTaps="handled">
          <Text className="text-text-primary font-bold text-2xl mb-2">Créer un compte</Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field name="first_name" label="Prénom" placeholder="Jean" autoCapitalize="words" />
            </View>
            <View className="flex-1">
              <Field name="last_name" label="Nom" placeholder="Tremblay" autoCapitalize="words" />
            </View>
          </View>

          <Field name="email" label="Email" placeholder="exemple@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Field name="password" label="Mot de passe" placeholder="8 caractères minimum" secureTextEntry autoCapitalize="none" />
          <Field name="confirm_password" label="Confirmer le mot de passe" placeholder="••••••••" secureTextEntry autoCapitalize="none" />
          <Field name="phone" label="Téléphone (optionnel)" placeholder="(819) 555-0000" keyboardType="phone-pad" />

          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                className="flex-row items-start gap-3 mt-2"
                onPress={() => onChange(!value)}
              >
                <View className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${value ? "bg-primary border-primary" : "border-gray-300"}`}>
                  {value && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text className="flex-1 text-text-secondary text-sm">
                  J'accepte les{" "}
                  <Text className="text-primary font-semibold">conditions d'utilisation</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.terms && <Text className="text-red-500 text-sm">{errors.terms.message}</Text>}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className={`bg-primary rounded-2xl py-4 items-center mt-2 ${loading ? "opacity-70" : ""}`}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Création..." : "Créer mon compte"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center pb-8">
            <Text className="text-text-secondary text-base">Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text className="text-primary font-bold text-base">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
