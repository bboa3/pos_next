import { deleteDraft, getDraftsCount, saveDraft } from "@/utils/draftManager"
import { useToast } from "@/composables/useToast"
import { defineStore } from "pinia"
import { ref } from "vue"

export const usePOSDraftsStore = defineStore("posDrafts", () => {
	// Use custom toast
	const { showSuccess, showError, showWarning } = useToast()

	// State
	const draftsCount = ref(0)

	// Actions
	async function updateDraftsCount() {
		try {
			draftsCount.value = await getDraftsCount()
		} catch (error) {
			console.error("Error getting drafts count:", error)
		}
	}

	async function saveDraftInvoice(
		invoiceItems,
		customer,
		posProfile,
		appliedOffers = [],
	) {
		if (invoiceItems.length === 0) {
			showWarning(__("Cannot save an empty cart as draft"))
			return false
		}

		try {
			const draftData = {
				pos_profile: posProfile,
				customer: customer,
				items: invoiceItems,
				applied_offers: appliedOffers, // Save applied offers
			}

			await saveDraft(draftData)
			await updateDraftsCount()

			showSuccess(__("Invoice saved as draft successfully"))

			return true
		} catch (error) {
			console.error("Error saving draft:", error)
			showError(__("Failed to save draft"))
			return false
		}
	}

	async function loadDraft(draft) {
		try {
			// Delete the draft after loading (to prevent duplicates)
			await deleteDraft(draft.draft_id)
			await updateDraftsCount()

			showSuccess(__("Draft invoice loaded successfully"))

			return {
				items: draft.items || [],
				customer: draft.customer,
				applied_offers: draft.applied_offers || [], // Restore applied offers
			}
		} catch (error) {
			console.error("Error loading draft:", error)
			showError(__("Failed to load draft"))
			throw error
		}
	}

	return {
		// State
		draftsCount,

		// Actions
		updateDraftsCount,
		saveDraftInvoice,
		loadDraft,
	}
})
