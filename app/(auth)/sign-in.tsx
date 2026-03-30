import "@/global.css";
import {
  extractAuthErrors,
  normalizeEmail,
  validateEmailAddress,
  type AuthErrors,
} from "@/lib/auth";
import { useAuth, useSignIn } from "@clerk/expo";
import { Link, Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const { signIn } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formErrors, setFormErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const clearError = (field: keyof AuthErrors) => {
    setFormErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const canSubmitCredentials = useMemo(() => {
    return !!emailAddress.trim() && !!password.trim() && !isSubmitting;
  }, [emailAddress, password, isSubmitting]);

  const canSubmitCode = useMemo(() => {
    return !!code.trim() && !isSubmitting;
  }, [code, isSubmitting]);

  const finalizeSuccess = async () => {
    await signIn?.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setFormErrors({
            form: "We need one more security step before entering your account.",
          });
          return;
        }

        const url = decorateUrl("/(tabs)");
        router.replace(url as never);
      },
    });
  };

  const onSubmitCredentials = async () => {
    if (!signIn) {
      return;
    }

    const emailError = validateEmailAddress(emailAddress);

    if (emailError) {
      setFormErrors({ emailAddress: emailError });
      return;
    }

    if (!password.trim()) {
      setFormErrors({ password: "Enter your password." });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const { error } = await signIn.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    });

    if (error) {
      setFormErrors(extractAuthErrors(error));
      setIsSubmitting(false);
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSuccess();
      setIsSubmitting(false);
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        const mfaResult = await signIn.mfa.sendEmailCode();

        if (mfaResult.error) {
          setFormErrors(extractAuthErrors(mfaResult.error));
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        return;
      }
    }

    if (signIn.status === "needs_second_factor") {
      setFormErrors({ form: "A second security step is required for this account." });
      setIsSubmitting(false);
      return;
    }

    setFormErrors({ form: "Sign in is not complete yet. Please try again." });
    setIsSubmitting(false);
  };

  const onVerifyCode = async () => {
    if (!signIn) {
      return;
    }

    if (!code.trim()) {
      setFormErrors({ code: "Enter the 6-digit code from your email." });
      return;
    }

    setIsSubmitting(true);
    clearError("code");

    const verifyResult = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (verifyResult.error) {
      setFormErrors(extractAuthErrors(verifyResult.error));
      setIsSubmitting(false);
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSuccess();
      setIsSubmitting(false);
      return;
    }

    setFormErrors({ form: "We could not verify this code. Please request a new one." });
    setIsSubmitting(false);
  };

  const onResendCode = async () => {
    if (!signIn) {
      return;
    }

    setIsResendingCode(true);
    clearError("code");

    const resendResult = await signIn.mfa.sendEmailCode();

    if (resendResult.error) {
      setFormErrors(extractAuthErrors(resendResult.error));
      setIsResendingCode(false);
      return;
    }

    setIsResendingCode(false);
  };

  const isMfaEmailCodeStep = signIn?.status === "needs_client_trust";

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView className="auth-scroll" keyboardShouldPersistTaps="handled">
        <View className="auth-content">
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recently</Text>
                <Text className="auth-wordmark-sub">Subscription Manager</Text>
              </View>
            </View>
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to keep your renewals, spending, and plans organized.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {!!formErrors.form && <Text className="auth-error">{formErrors.form}</Text>}

              {isMfaEmailCodeStep ? (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Security Code</Text>
                    <TextInput
                      className={`auth-input ${formErrors.code ? "auth-input-error" : ""}`}
                      keyboardType="number-pad"
                      value={code}
                      onChangeText={(value) => {
                        clearError("code");
                        setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
                      }}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                      maxLength={6}
                    />
                    {!!formErrors.code && <Text className="auth-error">{formErrors.code}</Text>}
                    <Text className="auth-helper">
                      Enter the code sent to {normalizeEmail(emailAddress)}.
                    </Text>
                  </View>

                  <Pressable
                    className={`auth-button ${!canSubmitCode ? "auth-button-disabled" : ""}`}
                    onPress={onVerifyCode}
                    disabled={!canSubmitCode}
                  >
                    <Text className="auth-button-text">Verify and continue</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={onResendCode}
                    disabled={isResendingCode}
                  >
                    <Text className="auth-secondary-button-text">
                      {isResendingCode ? "Sending a new code..." : "Send a new code"}
                    </Text>
                  </Pressable>

                  <Pressable className="auth-secondary-button" onPress={() => signIn.reset()}>
                    <Text className="auth-secondary-button-text">Start over</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Email Address</Text>
                    <TextInput
                      className={`auth-input ${formErrors.emailAddress ? "auth-input-error" : ""}`}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      value={emailAddress}
                      onChangeText={(value) => {
                        clearError("emailAddress");
                        setEmailAddress(value);
                      }}
                      placeholder="you@email.com"
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                    />
                    {!!formErrors.emailAddress && (
                      <Text className="auth-error">{formErrors.emailAddress}</Text>
                    )}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${formErrors.password ? "auth-input-error" : ""}`}
                      autoCapitalize="none"
                      secureTextEntry
                      value={password}
                      onChangeText={(value) => {
                        clearError("password");
                        setPassword(value);
                      }}
                      placeholder="Enter password"
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                    />
                    {!!formErrors.password && <Text className="auth-error">{formErrors.password}</Text>}
                  </View>

                  <Pressable
                    className={`auth-button ${!canSubmitCredentials ? "auth-button-disabled" : ""}`}
                    onPress={onSubmitCredentials}
                    disabled={!canSubmitCredentials}
                  >
                    <Text className="auth-button-text">Continue</Text>
                  </Pressable>
                </>
              )}

              <View className="auth-link-row">
                <Text className="auth-link-copy">Need an account?</Text>
                <Link href="/(auth)/sign-up">
                  <Text className="auth-link">Create one</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
