<template>
	<Dialog v-model="show" :options="{ title: __('Select Delivery Date'), size: 'sm' }">
		<template #body-content>
			<div class="flex flex-col gap-4 p-4">
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium text-gray-700">{{
						__("Delivery Date")
					}}</label>
					<input
						type="date"
						v-model="deliveryDate"
						class="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						:min="today"
					/>
				</div>
			</div>
		</template>

		<template #actions>
			<div class="flex items-center justify-end gap-2">
				<Button variant="subtle" @click="cancel">{{ __("Cancel") }}</Button>
				<Button variant="solid" @click="confirm" :disabled="!deliveryDate">
					{{ __("Confirm") }}
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { Button, Dialog } from "frappe-ui";
import { computed, ref, watch } from "vue";

const props = defineProps({
	modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const deliveryDate = ref("");
const today = new Date().toISOString().split("T")[0];

const show = computed({
	get: () => props.modelValue,
	set: (val) => emit("update:modelValue", val),
});

function confirm() {
	emit("confirm", deliveryDate.value);
	show.value = false;
}

function cancel() {
	show.value = false;
}

// Reset date when dialog opens
watch(
	() => props.modelValue,
	(val) => {
		if (val && !deliveryDate.value) {
			deliveryDate.value = today;
		}
	}
);
</script>
