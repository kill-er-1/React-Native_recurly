import { useClerk, useUser } from '@clerk/expo';
import { styled } from "nativewind";
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser()
  const { signOut } = useClerk()

  const displayName = user?.firstName || user?.username || "Account"
  const emailAddress = user?.emailAddresses[0]?.emailAddress || "No email available"

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="auth-card">
        <Text className="auth-title">Settings</Text>
        <Text className="auth-subtitle text-left max-w-none">
          Manage your account access and keep your data secure.
        </Text>

        <View className="auth-form mt-5">
          <View className="auth-field">
            <Text className="auth-label">Name</Text>
            <View className="auth-input">
              <Text className="text-base font-sans-medium text-primary">{displayName}</Text>
            </View>
          </View>

          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <View className="auth-input">
              <Text className="text-base font-sans-medium text-primary">{emailAddress}</Text>
            </View>
          </View>

          <Pressable className="auth-button" onPress={() => signOut()}>
            <Text className="auth-button-text">Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Settings 