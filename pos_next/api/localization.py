# -*- coding: utf-8 -*-
# Copyright (c) 2024, POS MZ and contributors
# For license information, please see license.txt

import frappe

SUPPORTED_LOCALES = {"pt-MZ"}
CANONICAL_LOCALE_MAP = {code.lower(): code for code in SUPPORTED_LOCALES}
LOCALE_ALIASES = {
	"pt": "pt-MZ",
	"pt-mz": "pt-MZ",
	"pt_mz": "pt-MZ",
	"pt-br": "pt-MZ",
	"pt_br": "pt-MZ",
	"pt-pt": "pt-MZ",
	"pt_pt": "pt-MZ",
	"en": "pt-MZ",
	"english": "pt-MZ",
}


def canonicalize_locale(locale):
	"""Normalize incoming locale codes to supported canonical form."""
	if not locale:
		return "pt-MZ"

	value = locale.strip()
	if not value:
		return "pt-MZ"

	lower = value.lower()
	if lower in LOCALE_ALIASES:
		return LOCALE_ALIASES[lower]

	if lower in CANONICAL_LOCALE_MAP:
		return CANONICAL_LOCALE_MAP[lower]

	return "pt-MZ"


@frappe.whitelist()
def get_user_language():
	"""
	Get the language preference for the current user.

	Returns:
		dict: User's language preference

	Security checks:
	- User must be authenticated (not Guest)
	"""
	# Check if user is authenticated
	if frappe.session.user == "Guest":
		frappe.throw("Authentication required", frappe.AuthenticationError)

	# Get user's language preference
	language = frappe.db.get_value("User", frappe.session.user, "language") or "pt-MZ"

	return {
		"success": True,
		"locale": canonicalize_locale(language)
	}


@frappe.whitelist()
def change_user_language(locale):
	"""
	Change the language preference for the current user.

	Args:
		locale (str): Language code (e.g., 'pt-MZ')

	Returns:
		dict: Success status and message

	Security checks:
	- User must be authenticated (not Guest)
	- User must be enabled
	"""
	# Check if user is authenticated
	if frappe.session.user == "Guest":
		frappe.throw("Authentication required", frappe.AuthenticationError)

	# Verify user is enabled
	if not frappe.db.get_value("User", frappe.session.user, "enabled"):
		frappe.throw("User is disabled", frappe.AuthenticationError)

	# Validate locale parameter
	if not locale:
		frappe.throw("Locale parameter is required", frappe.ValidationError)

	# Normalize locale to supported canonical value
	canonical_locale = canonicalize_locale(locale)

	if canonical_locale not in SUPPORTED_LOCALES:
		frappe.throw(f"Locale '{locale}' is not supported", frappe.ValidationError)

	# Update user's language preference
	try:
		frappe.db.set_value("User", frappe.session.user, "language", canonical_locale)
		frappe.db.commit()

		return {
			"success": True,
			"message": f"Language changed to {canonical_locale}",
			"locale": canonical_locale
		}
	except Exception as e:
		frappe.log_error(f"Failed to change user language: {str(e)}")
		frappe.throw(f"Failed to change language: {str(e)}", frappe.ValidationError)
