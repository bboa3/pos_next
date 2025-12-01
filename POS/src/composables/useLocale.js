import { ref, computed, onMounted } from "vue"
import { translationVersion } from "../utils/translation"
import { call } from "../utils/apiWrapper"
import { offlineState } from "../utils/offline/offlineState"
import { logger } from "../utils/logger"
import { useBootstrapStore } from "../stores/bootstrap"

const log = logger.create("Locale")

const DEFAULT_LOCALE = "pt-MZ"

// Reactive locale state (shared across all components)
const currentLocale = ref(DEFAULT_LOCALE)
const currentDir = ref("ltr")
const PREFARED_LANGUAGE_KEY = "pos_next_language"
const LOCALE_ALIASES = {
	pt: "pt-MZ",
	"pt-mz": "pt-MZ",
	"pt_mz": "pt-MZ",
	"pt-br": "pt-MZ",
	"pt_br": "pt-MZ",
	"pt-pt": "pt-MZ",
	"pt_pt": "pt-MZ",
	en: "pt-MZ",
}

/** Track if initial language fetch from server has been attempted */
let serverLanguageFetched = false

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
	"pt-MZ": {
		name: "Portuguese (Mozambique)",
		nativeName: "Português (Moçambique)",
		countryCode: "mz",
		dir: "ltr",
	},
}

function resolveLocaleCode(locale) {
	if (!locale) {
		return DEFAULT_LOCALE
	}

	const value = String(locale).trim()
	if (!value) {
		return DEFAULT_LOCALE
	}

	const lower = value.toLowerCase()
	if (LOCALE_ALIASES[lower]) {
		return LOCALE_ALIASES[lower]
	}

	const matched = Object.keys(SUPPORTED_LOCALES).find(
		(code) => code.toLowerCase() === lower
	)
	if (matched) {
		return matched
	}

	return DEFAULT_LOCALE
}

/**
 * Fetch user's language preference from the server
 * Checks bootstrap store first for preloaded data to avoid redundant API call
 * @returns {Promise<string|null>} Language code or null if fetch fails
 */
async function fetchLanguageFromServer() {
	// OPTIMIZATION: Check if bootstrap has preloaded the locale
	try {
		const bootstrapStore = useBootstrapStore()
		const preloadedLocale = resolveLocaleCode(bootstrapStore.getPreloadedLocale())
		if (SUPPORTED_LOCALES[preloadedLocale]) {
			log.info(`Using preloaded language from bootstrap: ${preloadedLocale}`)
			return preloadedLocale
		}
	} catch (error) {
		// Bootstrap store may not be available yet, fall through to API call
		log.debug("Bootstrap store not available, fetching language from API")
	}

	// Fallback to direct API call
	try {
		const response = await call("pos_next.api.localization.get_user_language", {})
		const serverLocale = resolveLocaleCode(response?.locale)
		if (SUPPORTED_LOCALES[serverLocale]) {
			log.info(`Fetched language from server: ${serverLocale}`)
			return serverLocale
		}
	} catch (error) {
		log.warn("Failed to fetch language from server", error)
	}
	return null
}

/**
 * Detect current language from cache sources (when offline)
 * Priority: Frappe boot → localStorage → browser → default
 * @returns {string} Language code
 */
function detectCachedLanguage() {
	// 1. Check Frappe boot data (user's saved preference)
	if (typeof window !== "undefined" && window.frappe?.boot?.lang) {
		const lang = resolveLocaleCode(window.frappe.boot.lang)
		if (SUPPORTED_LOCALES[lang]) {
			return lang
		}
	}

	// 2. Check localStorage
	const stored = resolveLocaleCode(localStorage.getItem(PREFARED_LANGUAGE_KEY))
	if (SUPPORTED_LOCALES[stored]) {
		return stored
	}

	// 3. Check browser language
	const browserLang = resolveLocaleCode(navigator.language)
	if (SUPPORTED_LOCALES[browserLang]) {
		return browserLang
	}

	// 4. Default to Portuguese (Mozambique)
	return DEFAULT_LOCALE
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
		const config = SUPPORTED_LOCALES[locale.value] || SUPPORTED_LOCALES[DEFAULT_LOCALE]
		return {
			...config,
			flagUrl: getFlagUrl(config.countryCode),
			flagUrlSvg: getFlagUrlSvg(config.countryCode),
		}
	})

	/**
	 * Change application language
	 * Updates document direction, saves preference, and uses translation system
	 * @param {string} newLocale - Language code (e.g., 'pt-MZ')
	 */
	async function changeLocale(newLocale) {
		const targetLocale = resolveLocaleCode(newLocale)
		if (!SUPPORTED_LOCALES[targetLocale]) {
			console.warn(`Locale ${newLocale} not supported`)
			return
		}

		const config = SUPPORTED_LOCALES[targetLocale]

		// Update reactive refs
		currentLocale.value = targetLocale
		currentDir.value = config.dir

		// Update document attributes
		document.documentElement.setAttribute("dir", config.dir)
		document.documentElement.setAttribute("lang", targetLocale)

		// Toggle RTL class for CSS
		if (config.dir === "rtl") {
			document.documentElement.classList.add("rtl")
		} else {
			document.documentElement.classList.remove("rtl")
		}

		// Store preference in localStorage
		localStorage.setItem(PREFARED_LANGUAGE_KEY, targetLocale)

		// Update Frappe user settings first (this changes the user's language in Frappe)
		try {
			await call("pos_next.api.localization.change_user_language", {
				locale: targetLocale,
			})
		} catch (error) {
			console.error("Failed to save language preference to Frappe:", error)
		}

		// Fetch new translations dynamically (no page reload needed)
		// The API returns translations based on the user's current Frappe language setting
		if (typeof window !== "undefined" && window.$changeLanguage) {
			try {
				await window.$changeLanguage(targetLocale)
			} catch (error) {
				console.error("Failed to load translations:", error)
			}
		}
	}

	/**
	 * Apply locale to document and reactive state
	 * @param {string} locale - Language code to apply
	 */
	function applyLocale(locale) {
		const targetLocale = resolveLocaleCode(locale)
		const config = SUPPORTED_LOCALES[targetLocale]
		if (!config) return

		currentLocale.value = targetLocale
		currentDir.value = config.dir

		// Set document attributes
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("dir", config.dir)
			document.documentElement.setAttribute("lang", targetLocale)

			if (config.dir === "rtl") {
				document.documentElement.classList.add("rtl")
			} else {
				document.documentElement.classList.remove("rtl")
			}
		}
	}

	/**
	 * Initialize locale on component mount
	 * When online, fetches language from server; when offline, uses cache
	 */
	async function initLocale() {
		// First, apply cached language immediately (prevents flicker)
		const cachedLocale = detectCachedLanguage()
		applyLocale(cachedLocale)

		// If online and haven't fetched from server yet, get server language
		if (!offlineState.isOffline && !serverLanguageFetched) {
			serverLanguageFetched = true
			const serverLocale = await fetchLanguageFromServer()

			// If server returned a different language, switch to it
			if (serverLocale && serverLocale !== cachedLocale) {
				log.info(`Server language (${serverLocale}) differs from cached (${cachedLocale}), switching`)
				await changeLocale(serverLocale)
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
