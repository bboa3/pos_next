## POS MZ – Mozambican Portuguese (pt-MZ) Localization

This document describes what was changed to deliver a culturally accurate Mozambican Portuguese experience and how to maintain translations going forward.

### What changed
- Removed Arabic support from runtime:
  - `pos_next/translations/ar.csv` was renamed to `pos_next/translations/pt-MZ.csv`
  - Frontend locales: removed `en/ar` and now expose only `pt-MZ` in `POS/src/composables/useLocale.js`
  - Backend whitelist: `allowed_locales` updated to `{'pt-MZ'}` in `pos_next/api/localization.py`
- POS MZ now ships its own Mozambican Portuguese bundle:
  - `apps/pos_next/pos_next/translations/pt-MZ.csv` is the authoritative CSV loaded by the translation plugin
- Cleaned examples/comments to avoid Arabic-only references
- Docs updated to show `"locale": "pt-MZ"` in examples
- Removed the in-app Language Switcher—the POS now always runs in Portuguese (Mozambique)

### Language code and compatibility
- The authoritative locale is `pt-MZ` (Português (Moçambique)) provided directly by the POS MZ app.
- Ensure the `Language` DocType has `pt-MZ` enabled (via `erpnext_mz` or a site patch) so users/sites can select it.
- Set the site default (System Settings → Language) or user preference to `Português (Moçambique)` to activate these translations.

### How translation loading works
- The app loads translations from Frappe using `frappe.translate.get_app_translations`
- The current locale is driven by:
  - User’s Frappe language (boot) and/or localStorage key `pos_next_language`
  - Frontend supported locales list in `useLocale.js` (now fixed to `pt-MZ`)
- If translations need to be refreshed, call `window.$changeLanguage('pt-MZ')` programmatically (no UI button)

### Maintaining translations
1. Add/adjust strings in `apps/pos_next/pos_next/translations/pt-MZ.csv`
   - Standard Frappe translation CSV: `"English","Português"` pairs (quoted, comma-separated)
2. Ensure new UI strings are extracted
   - New source strings must appear in code wrapped by `__()` to be discovered
3. Deploy/bench build the updated app
   - Bench will serve the new translations automatically after app reload/build
   - If needed, clear browser cache or IndexedDB translation cache from devtools

### Mozambican Portuguese conventions used
- “Stock” (vs “Estoque”)
- “NUIT” (Taxpayer Number) instead of generic “TIN”
- “Guardar” (save), “Eliminar” (delete), “Submeter” (submit), “Definições” (settings)
- “Troco” (change), “Gaveta de Dinheiro” (cash drawer), “Operador de Caixa” (cashier)

### Extending coverage
- `pt-MZ.csv` now includes the high-frequency POS strings (payments, cart, items, shifts, receipts, errors).
- To fully localize long-tail strings:
  - Search for English literals in the codebase and add pairs to `pt-MZ.csv`
  - Or run Frappe’s standard translation extraction to generate msg files and merge back

### Rollback/alternative variants
- If you ever need a different regional Portuguese variant:
  - Create a new Language (e.g., `pt-AO`) via fixtures/custom app
  - Duplicate `pt-MZ.csv` to the new language file inside `erpnext_mz` (or another localization app)
  - Update `useLocale.js` and `pos_next/api/localization.py` to list the new locale code (and optionally keep `pt-MZ` as a fallback alias)

- User Language set to `Português (Moçambique)`
- POS header reflects Portuguese strings (language switcher removed)
- UI direction remains LTR
- Core flows:
  - Add item, apply discount, finalize payment, print receipt
  - Open/Close shift totals and variances
  - Offline mode messages and sync statuses

If anything appears in English during usage, add the source string and Portuguese translation to `pt-MZ.csv`, rebuild, and verify.


