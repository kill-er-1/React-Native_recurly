import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type BillingFrequency = "Monthly" | "Yearly";

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  Entertainment: "#f6caa2",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c8e6b7",
  Cloud: "#bde0fe",
  Music: "#ffd6e0",
  Other: "#d9d9d9",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<BillingFrequency>("Monthly");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(
    "Entertainment"
  );
  const [showError, setShowError] = useState(false);

  const numericPrice = useMemo(() => Number.parseFloat(price), [price]);
  const isFormValid = name.trim().length > 0 && Number.isFinite(numericPrice) && numericPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setShowError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      setShowError(true);
      return;
    }

    const startDate = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: numericPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      currency: "USD",
      color: CATEGORY_COLORS[category],
    };

    onCreate(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="modal-overlay justify-end">
        <Pressable className="absolute inset-0" onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">x</Text>
              </Pressable>
            </View>

            <View className="modal-body">
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (showError) setShowError(false);
                  }}
                  placeholder="e.g. Figma"
                  placeholderTextColor="rgba(0,0,0,0.45)"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value.replace(/[^0-9.]/g, ""));
                    if (showError) setShowError(false);
                  }}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.45)"
                  keyboardType="decimal-pad"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => {
                    const isActive = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        className={clsx("picker-option", isActive && "picker-option-active")}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            isActive && "picker-option-text-active"
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORY_OPTIONS.map((option) => {
                    const isActive = category === option;
                    return (
                      <Pressable
                        key={option}
                        className={clsx("category-chip", isActive && "category-chip-active")}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isActive && "category-chip-text-active"
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {showError && (
                <Text className="auth-error">
                  Please enter a name and a valid positive price.
                </Text>
              )}

              <Pressable
                className={clsx("auth-button", !isFormValid && "auth-button-disabled")}
                onPress={handleSubmit}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;