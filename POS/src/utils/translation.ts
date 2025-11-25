import { createResource } from "frappe-ui";
import { App, ref } from "vue";
import { call } from "./apiWrapper";

type Replace = { [key: string]: string };
type TranslatedMessages = Replace;

declare global {
  interface Window {
    __: (message: string, replace?: Replace, context?: string | null) => string;
    translatedMessages?: TranslatedMessages;
    $changeLanguage?: (locale: string) => Promise<void>;
  }
}

// Reactive translation version to trigger re-renders
export const translationVersion = ref(0);

export default function translationPlugin(app: App) {
  app.config.globalProperties.__ = translate;
  window.__ = translate;
  window.$changeLanguage = changeLanguage;
  if (!window.translatedMessages) fetchTranslations();
}

function format(message: string, replace?: Replace) {
  if (!replace) return message;
  return message.replace(/{(\d+)}/g, function (match, number) {
    return typeof replace[number] != "undefined" ? replace[number] : match;
  });
}

export function translate(
  message: string,
  replace?: Replace,
  context: string | null = null,
) {
  let translatedMessages = window.translatedMessages || {};
  let translatedMessage = "";

  if (context) {
    let key = `${message}:${context}`;
    if (translatedMessages[key]) {
      translatedMessage = translatedMessages[key];
    }
  }

  if (!translatedMessage) {
    translatedMessage = translatedMessages[message] || message;
  }

  const hasPlaceholders = /{\d+}/.test(message);
  if (!hasPlaceholders) {
    return translatedMessage;
  }

  return format(translatedMessage, replace);
}

export function fetchTranslations() {
  createResource({
    url: "frappe.translate.get_app_translations",
    method: "GET",
    cache: "translations",
    auto: true,
    transform: (messages: TranslatedMessages) => {
      window.translatedMessages = messages;
      console.log("translatedMessages updated ...", window.translatedMessages)
    },
  });
}

/**
 * Dynamically change the language and fetch new translations
 * This avoids a full page reload by fetching translations via API
 */
export async function changeLanguage(locale: string): Promise<void> {
  try {
    const messages = await call("frappe.translate.get_app_translations", {});

    if (messages) {
      window.translatedMessages = messages as TranslatedMessages;
      // Increment version to trigger reactive updates
      translationVersion.value++;
    }
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    throw error;
  }
}

export function __(
  message: string,
  replace?: Replace,
  context: string | null = null,
): string {
  if (!window.__) return message;
  return translate(message, replace, context);
}
