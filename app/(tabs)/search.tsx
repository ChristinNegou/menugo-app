import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRestaurantSearch } from "@/hooks/useRestaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { MenuItemSkeleton } from "@/components/LoadingSkeleton";

const HISTORY_KEY = "search_history";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const { data: results, isLoading } = useRestaurantSearch(debouncedQuery);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((val) => {
      if (val) setHistory(JSON.parse(val));
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const saveHistory = useCallback(async (term: string) => {
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 8);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [history]);

  const handleSelect = (term: string) => {
    setQuery(term);
    saveHistory(term);
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-text-primary font-bold text-2xl mb-4">Rechercher</Text>
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 gap-2">
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            className="flex-1 text-text-primary text-base"
            placeholder="Restaurant, cuisine..."
            placeholderTextColor="#A0AEC0"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => query && saveHistory(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          )}
          <TouchableOpacity className="ml-1">
            <Ionicons name="options-outline" size={20} color="#718096" />
          </TouchableOpacity>
        </View>
      </View>

      {query.length === 0 ? (
        <View className="px-4">
          {history.length > 0 && (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-primary font-bold text-base">Recherches récentes</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text className="text-primary text-sm">Effacer</Text>
                </TouchableOpacity>
              </View>
              {history.map((term) => (
                <TouchableOpacity
                  key={term}
                  className="flex-row items-center gap-3 py-3 border-b border-gray-50"
                  onPress={() => handleSelect(term)}
                >
                  <Ionicons name="time-outline" size={18} color="#718096" />
                  <Text className="text-text-primary text-base flex-1">{term}</Text>
                  <Ionicons name="arrow-back-outline" size={16} color="#A0AEC0" />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      ) : isLoading ? (
        <View>{[1, 2, 3].map((i) => <MenuItemSkeleton key={i} />)}</View>
      ) : results && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              compact
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={64} color="#CBD5E0" />
          <Text className="text-text-primary font-bold text-xl mt-4 text-center">
            Aucun résultat
          </Text>
          <Text className="text-text-secondary text-base mt-2 text-center">
            Aucun restaurant trouvé pour « {query} »
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
