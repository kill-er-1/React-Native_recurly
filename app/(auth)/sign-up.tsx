import "@/global.css";
import {
  extractAuthErrors,
  normalizeEmail,
  validateEmailAddress,
  validatePassword,
  type AuthErrors,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type SignUpState = "credentials" | "verify";

const SignUp = () => {
  const { signUp } = useSignUp();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<SignUpState>("credentials");
  const [formErrors, setFormErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const clearError = (field: keyof AuthErrors) => {
    setFormErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const applyMergedErrors = (nextErrors: AuthErrors) => {
    setFormErrors((current) => ({ ...current, ...nextErrors }));
  };

  const isVerifyStep =
    step === "verify" ||
    (signUp?.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address") &&
      (signUp.missingFields?.length ?? 0) === 0);

  const canSubmitCredentials = useMemo(() => {
    return !!emailAddress.trim() && !!password.trim() && !isSubmitting;
  }, [emailAddress, password, isSubmitting]);

  const canSubmitCode = useMemo(() => {
    return !!code.trim() && !isSubmitting;
  }, [code, isSubmitting]);

  const finalizeSuccess = async () => {
    await signUp?.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setFormErrors({
            form: "We need one more security step before finishing. Please try again.",
          });
          return;
        }

        const url = decorateUrl("/(tabs)");
        router.replace(url as never);
      },
    });
  };

  const onSubmitCredentials = async () => {
    if (!signUp) {
      return;
    }

    const emailError = validateEmailAddress(emailAddress);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setFormErrors({
        emailAddress: emailError,
        password: passwordError,
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    });

    if (error) {
      applyMergedErrors(extractAuthErrors(error));
      setIsSubmitting(false);
      return;
    }

    const verificationResult = await signUp.verifications.sendEmailCode();

    if (verificationResult.error) {
      applyMergedErrors(extractAuthErrors(verificationResult.error));
      setIsSubmitting(false);
      return;
    }

    setStep("verify");
    setIsSubmitting(false);
  };

  const onVerifyCode = async () => {
    if (!signUp) {
      return;
    }

    if (!code.trim()) {
      setFormErrors({ code: "Enter the 6-digit code from your email." });
      return;
    }

    setIsSubmitting(true);
    clearError("code");

    const verificationResult = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (verificationResult.error) {
      applyMergedErrors(extractAuthErrors(verificationResult.error));
      setIsSubmitting(false);
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSuccess();
      setIsSubmitting(false);
      return;
    }

    setFormErrors({
      form: "We could not confirm your account yet. Request a new code and try again.",
    });
    setIsSubmitting(false);
  };

  const onResendCode = async () => {
    if (!signUp) {
      return;
    }

    setIsResendingCode(true);
    clearError("code");

    const resendResult = await signUp.verifications.sendEmailCode();

    if (resendResult.error) {
      applyMergedErrors(extractAuthErrors(resendResult.error));
      setIsResendingCode(false);
      return;
    }

    setIsResendingCode(false);
  };

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn || signUp?.status === "complete") {
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
            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Keep your subscriptions in one secure place and never miss a renewal.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {!!formErrors.form && <Text className="auth-error">{formErrors.form}</Text>}

              {isVerifyStep ? (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Security Code</Text>
                    <TextInput
                      className="auth-input"
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
                      We sent a security code to {normalizeEmail(emailAddress)}.
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
                      placeholder="At least 8 characters"
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                    />
                    {!!formErrors.password && <Text className="auth-error">{formErrors.password}</Text>}
                    <Text className="auth-helper">Use at least one letter and one number.</Text>
                  </View>

                  <Pressable
                    className={`auth-button ${!canSubmitCredentials ? "auth-button-disabled" : ""}`}
                    onPress={onSubmitCredentials}
                    disabled={!canSubmitCredentials}
                  >
                    <Text className="auth-button-text">Create account</Text>
                  </Pressable>
                </>
              )}

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in">
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
