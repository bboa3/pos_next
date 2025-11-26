<template>
	<div ref="dropdownRef" class="relative">
		<button
			@click="toggleDropdown"
			class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
			:class="{ 'flex-row-reverse': isRTL }"
			:aria-label="__('Change language: {0}', [localeConfig.nativeName])"
			:title="localeConfig.nativeName"
		>
			<span class="text-lg sm:text-xl">{{ localeConfig.flag }}</span>
			<span class="hidden sm:inline">{{ localeConfig.nativeName }}</span>
			<svg
				class="w-3 h-3 sm:w-4 sm:h-4 transition-transform"
				:class="{ 'rotate-180': isOpen }"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</button>

		<transition
			enter-active-class="transition ease-out duration-200"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition ease-in duration-150"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="isOpen"
				class="absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
				:class="isRTL ? 'start-0' : 'end-0'"
			>
				<div class="py-1" role="menu">
					<button
						v-for="(config, code) in supportedLocales"
						:key="code"
						@click="selectLanguage(code)"
						class="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
						:class="{
							'bg-blue-50 text-blue-700': locale === code,
							'text-gray-700': locale !== code,
							'flex-row-reverse': config.dir === 'rtl',
						}"
						role="menuitem"
					>
						<span
							class="text-xl"
							:class="config.dir === 'rtl' ? 'ms-3' : 'me-3'"
						>
							{{ config.flag }}
						</span>
						<span
							class="flex-1"
							:class="config.dir === 'rtl' ? 'text-end' : 'text-start'"
						>
							{{ config.nativeName }}
						</span>
						<svg
							v-if="locale === code"
							class="w-4 h-4 text-blue-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useLocale } from "@/composables/useLocale"

const { locale, localeConfig, isRTL, supportedLocales, changeLocale } =
	useLocale()

const isOpen = ref(false)
const dropdownRef = ref(null)

function toggleDropdown() {
	isOpen.value = !isOpen.value
}

async function selectLanguage(code) {
	if (code === locale.value) {
		isOpen.value = false
		return
	}

	isOpen.value = false
	await changeLocale(code)
}

function handleClickOutside(event) {
	if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
		isOpen.value = false
	}
}

onMounted(() => {
	document.addEventListener("click", handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside)
})
</script>
