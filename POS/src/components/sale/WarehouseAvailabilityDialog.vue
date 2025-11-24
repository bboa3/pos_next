<template>
	<Teleport to="body">
		<div
			v-if="show"
			class="fixed inset-0 z-[9999] overflow-y-auto"
			@click.self="$emit('close')"
		>
			<!-- Backdrop -->
			<div class="fixed inset-0 bg-black/50 transition-opacity" @click="$emit('close')"></div>

			<!-- Dialog -->
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
					@click.stop
				>
					<!-- Header -->
					<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
						<div class="flex items-center space-x-3">
							<div class="p-2 bg-blue-100 rounded-lg">
								<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-semibold text-gray-900">{{ __('Warehouse Availability') }}</h2>
								<p class="text-sm text-gray-500">{{ itemName }}</p>
							</div>
						</div>
						<button
							@click="$emit('close')"
							class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							:aria-label="__('Close dialog')"
						>
							<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
							</svg>
						</button>
					</div>

					<!-- Content -->
					<div class="flex-1 overflow-y-auto px-6 py-4">
						<!-- Loading State -->
						<div v-if="loading" class="flex items-center justify-center py-12">
							<div class="text-center">
								<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
								<p class="mt-4 text-sm text-gray-500">{{ __('Checking warehouse availability...') }}</p>
							</div>
						</div>

						<!-- Error State -->
						<div v-else-if="error" class="flex items-center justify-center py-12">
							<div class="text-center">
								<svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
								<p class="mt-4 text-sm text-gray-700">{{ error }}</p>
								<button
									@click="loadAvailability"
									class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									{{ __('Try Again') }}
								</button>
							</div>
						</div>

						<!-- Warehouses List -->
						<div v-else-if="warehouses && warehouses.length > 0" class="space-y-3">
							<div
								v-for="warehouse in warehouses"
								:key="warehouse.warehouse"
								class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
							>
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<h3 class="font-medium text-gray-900">{{ warehouse.warehouse_name }}</h3>
										<p class="text-sm text-gray-500 mt-0.5">{{ warehouse.company }}</p>
									</div>
									<div class="text-right">
										<div class="text-lg font-bold text-green-600">
											{{ Math.floor(warehouse.available_qty) }} {{ uom }}
										</div>
										<div class="text-xs text-gray-500 mt-0.5">
											<span v-if="warehouse.reserved_qty > 0" class="text-orange-600">
												{{ Math.floor(warehouse.reserved_qty) }} reserved
											</span>
											<span v-else>{{ __('Available') }}</span>
										</div>
									</div>
								</div>
								<!-- Actual vs Available -->
								<div v-if="warehouse.actual_qty !== warehouse.available_qty" class="mt-2 pt-2 border-t border-gray-200">
									<div class="flex items-center justify-between text-xs text-gray-600">
										<span>{{ __('Actual Stock:') }}</span>
										<span class="font-medium">{{ Math.floor(warehouse.actual_qty) }} {{ uom }}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- No Stock State -->
						<div v-else class="flex items-center justify-center py-12">
							<div class="text-center">
								<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
								</svg>
								<p class="mt-4 text-sm text-gray-700 font-medium">{{ __('No stock available') }}</p>
								<p class="mt-1 text-sm text-gray-500">{{ __('This item is out of stock in all warehouses') }}</p>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
						<div class="flex items-center justify-between">
							<div class="text-sm text-gray-600">
								<span class="font-medium">{{ __('Total Available:') }}</span>
								<span class="ml-2 text-gray-900 font-semibold">
									{{ totalAvailable }} {{ uom }}
								</span>
								<span v-if="warehouses && warehouses.length > 0" class="ml-2 text-gray-500">
									{{ warehouses.length === 1
										? __('across 1 warehouse')
										: __('across {0} warehouses', [warehouses.length])
									}}
								</span>
							</div>
							<button
								@click="$emit('close')"
								class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
							>
								{{ __('Close') }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { call } from 'frappe-ui'

const props = defineProps({
	show: Boolean,
	itemCode: String,
	itemName: String,
	uom: {
		type: String,
		default: 'Nos'
	},
	company: String
})

const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref(null)
const warehouses = ref([])

const totalAvailable = computed(() => {
	if (!warehouses.value || warehouses.value.length === 0) return 0
	return Math.floor(warehouses.value.reduce((sum, w) => sum + (w.available_qty || 0), 0))
})

async function loadAvailability() {
	if (!props.itemCode) return

	loading.value = true
	error.value = null
	warehouses.value = []

	try {
		const response = await call('pos_next.api.items.get_item_warehouse_availability', {
			item_code: props.itemCode,
			company: props.company
		})

		warehouses.value = response || []
	} catch (err) {
		console.error('Error loading warehouse availability:', err)
		error.value = err.message || 'Failed to load warehouse availability'
	} finally {
		loading.value = false
	}
}

// Load when dialog opens
watch(() => props.show, (newVal) => {
	if (newVal) {
		loadAvailability()
	}
}, { immediate: true })
</script>
