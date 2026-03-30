import ListHeading from '@/components/ListHeading'
import SubscriptionCard from '@/components/SubscriptionCard'
import { HOME_SUBSCRIPTIONS } from '@/constants/data'
import { styled } from "nativewind"
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, Text, TextInput, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"
const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return HOME_SUBSCRIPTIONS
    }

    return HOME_SUBSCRIPTIONS.filter((subscription) => {
      const searchableFields = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.billing,
      ]

      return searchableFields.some((field) => field?.toLowerCase().includes(normalizedQuery))
    })
  }, [searchQuery])

  useEffect(() => {
    if (!expandedSubscriptionId) {
      return
    }

    const hasExpandedItem = filteredSubscriptions.some((item) => item.id === expandedSubscriptionId)

    if (!hasExpandedItem) {
      setExpandedSubscriptionId(null)
    }
  }, [expandedSubscriptionId, filteredSubscriptions])

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <>
            <Text className="mb-4 text-3xl font-sans-bold text-primary">My Subscriptions</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, plan, or category"
              placeholderTextColor="rgba(0,0,0,0.45)"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
              className="mb-6 rounded-2xl border border-border bg-card px-4 py-4 text-base font-sans-medium text-primary"
            />
            <ListHeading title="All Subscriptions" />
          </>
        )}
        ListEmptyComponent={
          <Text className="home-empty-state">
            {searchQuery.trim() ? 'No subscriptions found for this search.' : 'No subscriptions yet.'}
          </Text>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  )
}

export default Subscriptions