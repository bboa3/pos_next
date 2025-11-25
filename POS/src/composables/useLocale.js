import { ref, computed, onMounted } from "vue"
import { translationVersion } from "../utils/translation"
import { call } from "../utils/apiWrapper"

// Reactive locale state (shared across all components)
const currentLocale = ref("en")
const currentDir = ref("ltr")
const PREFARED_LANGUAGE_KEY = "pos_next_language"

// Get flag URL from flagcdn.com
function getFlagUrl(countryCode) {
	if (!countryCode) return null
	return `https://flagcdn.com/h24/${countryCode.toLowerCase()}.png`
}

// Get flag SVG URL from flagcdn.com
function getFlagUrlSvg(countryCode) {
	if (!countryCode) return null
	return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`
}

// Supported languages configuration
export const SUPPORTED_LOCALES = {
	en: {
		name: "English",
		nativeName: "English",
		countryCode: "us",
		dir: "ltr",
	},
	ar: {
		name: "Arabic",
		nativeName: "العربية",
		countryCode: "eg",
		dir: "rtl",
	}
}

/**
 * Detect current language from Frappe boot, localStorage, or browser
 * @returns {string} Language code
 */
function detectLanguage() {
	// 1. Check Frappe boot data (user's saved preference)
	if (typeof window !== "undefined" && window.frappe?.boot?.lang) {
		const lang = window.frappe.boot.lang.toLowerCase()
		if (SUPPORTED_LOCALES[lang]) {
			return lang
		}
	}

	// 2. Check localStorage
	const stored = localStorage.getItem(PREFARED_LANGUAGE_KEY)
	if (stored && SUPPORTED_LOCALES[stored]) {
		return stored
	}

	// 3. Check browser language
	const browserLang = navigator.language.split("-")[0].toLowerCase()
	if (SUPPORTED_LOCALES[browserLang]) {
		return browserLang
	}

	// 4. Default to English
	return "en"
}

/**
 * Composable for locale management
 * Provides reactive locale state and methods to change language
 */
export function useLocale() {
	// Computed properties
	const locale = computed(() => currentLocale.value)
	const dir = computed(() => currentDir.value)
	const isRTL = computed(() => currentDir.value === "rtl")
	const localeConfig = computed(() => {
		const config = SUPPORTED_LOCALES[locale.value] || SUPPORTED_LOCALES.en
		return {
			...config,
			flagUrl: getFlagUrl(config.countryCode),
			flagUrlSvg: getFlagUrlSvg(config.countryCode),
		}
	})

	/**
	 * Change application language
	 * Updates document direction, saves preference, and uses translation system
	 * @param {string} newLocale - Language code (e.g., 'ar', 'en', 'fr')
	 */
	async function changeLocale(newLocale) {
		if (!SUPPORTED_LOCALES[newLocale]) {
			console.warn(`Locale ${newLocale} not supported`)
			return
		}

		const config = SUPPORTED_LOCALES[newLocale]

		// Update reactive refs
		currentLocale.value = newLocale
		currentDir.value = config.dir

		// Update document attributes
		document.documentElement.setAttribute("dir", config.dir)
		document.documentElement.setAttribute("lang", newLocale)

		// Toggle RTL class for CSS
		if (config.dir === "rtl") {
			document.documentElement.classList.add("rtl")
		} else {
			document.documentElement.classList.remove("rtl")
		}

		// Store preference in localStorage
		localStorage.setItem(PREFARED_LANGUAGE_KEY, newLocale)

		// Update Frappe user settings first (this changes the user's language in Frappe)
		try {
			await call("pos_next.api.localization.change_user_language", {
				locale: newLocale,
			})
		} catch (error) {
			console.error("Failed to save language preference to Frappe:", error)
		}

		// Fetch new translations dynamically (no page reload needed)
		// The API returns translations based on the user's current Frappe language setting
		if (typeof window !== "undefined" && window.$changeLanguage) {
			try {
				await window.$changeLanguage(newLocale)
			} catch (error) {
				console.error("Failed to load translations:", error)
			}
		}
	}

	/**
	 * Initialize locale on component mount
	 * Detects language and applies document attributes
	 */
	function initLocale() {
		const detected = detectLanguage()
		currentLocale.value = detected

		const config = SUPPORTED_LOCALES[detected]
		currentDir.value = config.dir

		// Set document attributes
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("dir", config.dir)
			document.documentElement.setAttribute("lang", detected)

			if (config.dir === "rtl") {
				document.documentElement.classList.add("rtl")
			} else {
				document.documentElement.classList.remove("rtl")
			}
		}
	}

	// Auto-initialize on first mount
	onMounted(() => {
		initLocale()
	})

	// Build supported locales with flag URLs
	const supportedLocales = computed(() => {
		const result = {}
		for (const [code, config] of Object.entries(SUPPORTED_LOCALES)) {
			result[code] = {
				...config,
				flagUrl: getFlagUrl(config.countryCode),
				flagUrlSvg: getFlagUrlSvg(config.countryCode),
			}
		}
		return result
	})

	return {
		locale,
		dir,
		isRTL,
		localeConfig,
		supportedLocales,
		changeLocale,
		initLocale,
		translationVersion, // Used to trigger re-renders when translations change
	}
}
