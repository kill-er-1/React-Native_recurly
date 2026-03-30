import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import { styled } from "nativewind";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const WEEKLY_BARS = [
  { day: "Mon", value: 36 },
  { day: "Tue", value: 31 },
  { day: "Wed", value: 23 },
  { day: "Thr", value: 40, highlighted: true },
  { day: "Fri", value: 34 },
  { day: "Sat", value: 22 },
  { day: "Sun", value: 24 },
];

const HISTORY_ITEMS = [
  {
    key: "claude",
    icon: HOME_SUBSCRIPTIONS.find((item) => item.id === "claude-pro")?.icon ?? icons.claude,
    name: "Claude",
    date: "June 25, 12:00",
    amount: 9.84,
    color: "#f2d146",
  },
  {
    key: "canva",
    icon: HOME_SUBSCRIPTIONS.find((item) => item.id === "canva-pro")?.icon ?? icons.canva,
    name: "Canva",
    date: "June 30, 16:00",
    amount: 43.89,
    color: "#98d2bd",
  },
  {
    key: "github",
    icon: HOME_SUBSCRIPTIONS.find((item) => item.id === "github-pro")?.icon ?? icons.github,
    name: "GitHub",
    date: "June 2, 11:30",
    amount: 12.0,
    color: "#dce7f7",
  },
];

const Insights = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 }}
      >
        <View className="mb-7 flex-row items-center justify-between">
          <Pressable className="size-12 items-center justify-center rounded-full border border-black/20 bg-background">
            <Image source={icons.back} className="size-5" resizeMode="contain" />
          </Pressable>
          <Text className="text-4xl font-sans-bold text-primary">Monthly Insights</Text>
          <Pressable className="size-12 items-center justify-center rounded-full border border-black/20 bg-background">
            <Image source={icons.menu} className="size-5" resizeMode="contain" />
          </Pressable>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-3xl font-sans-bold text-primary">Upcoming</Text>
          <Pressable className="rounded-full border border-black/20 px-4 py-1.5">
            <Text className="text-xl font-sans-semibold text-primary">View all</Text>
          </Pressable>
        </View>

        <View className="mb-5 rounded-3xl bg-muted p-4">
          <View className="relative h-44">
            {[0, 1, 2, 3].map((line) => (
              <View
                key={`grid-${line}`}
                className="absolute left-0 right-0 border-t border-black/10"
                style={{ top: line * 34 + 6 }}
              />
            ))}

            <View className="absolute bottom-0 left-0 top-0 w-6 items-start justify-between pb-1 pt-0.5">
              <Text className="text-base font-sans-medium text-primary/70">45</Text>
              <Text className="text-base font-sans-medium text-primary/70">35</Text>
              <Text className="text-base font-sans-medium text-primary/70">25</Text>
              <Text className="text-base font-sans-medium text-primary/70">5</Text>
              <Text className="text-base font-sans-medium text-primary/70">0</Text>
            </View>

            <View className="ml-7 flex-1 flex-row items-end justify-between pb-2">
              {WEEKLY_BARS.map((bar) => (
                <View key={bar.day} className="items-center">
                  {bar.highlighted ? (
                    <View className="mb-2 rounded-xl bg-background px-2.5 py-1">
                      <Text className="text-sm font-sans-bold text-accent">$40</Text>
                    </View>
                  ) : (
                    <View className="mb-8" />
                  )}
                  <View
                    className="w-3.5 rounded-full"
                    style={{
                      height: bar.value * 3.2,
                      backgroundColor: bar.highlighted ? "#ea7a53" : "#081126",
                    }}
                  />
                  <Text className="mt-3 text-base font-sans-medium text-primary/75">{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mb-8 rounded-3xl border border-black/20 bg-background px-4 py-5">
          <View className="mb-2 flex-row items-start justify-between">
            <Text className="text-3xl font-sans-bold text-primary">Expenses</Text>
            <Text className="text-3xl font-sans-bold text-primary">-{formatCurrency(424.63)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-sans-medium text-primary/70">March 2026</Text>
            <Text className="text-xl font-sans-semibold text-primary/70">+12%</Text>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-3xl font-sans-bold text-primary">History</Text>
          <Pressable className="rounded-full border border-black/20 px-4 py-1.5">
            <Text className="text-xl font-sans-semibold text-primary">View all</Text>
          </Pressable>
        </View>

        <View className="gap-4">
          {HISTORY_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              className="flex-row items-center justify-between rounded-3xl px-4 py-5"
              style={{ backgroundColor: item.color }}
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View className="size-14 items-center justify-center rounded-2xl bg-white/35">
                  <Image source={item.icon} className="size-10 rounded-xl" resizeMode="cover" />
                </View>
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="text-3xl font-sans-bold text-primary">
                    {item.name}
                  </Text>
                  <Text className="mt-1 text-xl font-sans-medium text-primary/60">{item.date}</Text>
                </View>
              </View>

              <View className="ml-3 items-end">
                <Text className="text-3xl font-sans-bold text-primary">{formatCurrency(item.amount)}</Text>
                <Text className="mt-1 text-xl font-sans-medium text-primary/60">per month</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;