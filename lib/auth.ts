export type AuthField = "emailAddress" | "password" | "code" | "form";

export interface AuthErrors {
  emailAddress?: string;
  password?: string;
  code?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validateEmailAddress = (emailAddress: string) => {
  const normalized = normalizeEmail(emailAddress);

  if (!normalized) {
    return "Enter your email address.";
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return "Enter a valid email address.";
  }

  return undefined;
};

export const validatePassword = (password: string) => {
  if (!password.trim()) {
    return "Enter your password.";
  }

  if (password.length < 8) {
    return "Use at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use at least one letter and one number.";
  }

  return undefined;
};

const FIELD_ALIASES: Record<string, AuthField> = {
  email_address: "emailAddress",
  emailAddress: "emailAddress",
  identifier: "emailAddress",
  password: "password",
  code: "code",
};

export const extractAuthErrors = (error: unknown): AuthErrors => {
  const fallbackMessage = "We could not complete that right now. Please try again.";
  const parsed: AuthErrors = {};

  const maybeError = error as
    | {
        errors?: {
          message?: string;
          longMessage?: string;
          meta?: { paramName?: string; param_name?: string };
          code?: string;
        }[];
      }
    | undefined;

  const apiErrors = maybeError?.errors ?? [];

  if (!apiErrors.length) {
    parsed.form = fallbackMessage;
    return parsed;
  }

  for (const item of apiErrors) {
    const paramName = item.meta?.paramName ?? item.meta?.param_name;
    const field = paramName ? FIELD_ALIASES[paramName] : undefined;
    const message = item.longMessage ?? item.message ?? fallbackMessage;

    if (field && !parsed[field]) {
      parsed[field] = message;
      continue;
    }

    if (!parsed.form) {
      parsed.form = message;
    }
  }

  return parsed;
};
