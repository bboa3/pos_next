# -*- coding: utf-8 -*-
# Copyright (c) 2024, POS Next and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _

@frappe.whitelist()
def get_csrf_token():
	"""
	Get CSRF token for the current session.
	Only returns CSRF token if user is authenticated with a valid session.

	Security checks:
	- User must be authenticated (not Guest)
	- Session must be valid
	- User must be enabled

	Note: frappe.sessions.get_csrf_token() handles session updates and commits internally.
	"""
	# Check if user is authenticated
	if frappe.session.user == "Guest":
		frappe.throw("Authentication required", frappe.AuthenticationError)

	# Verify user is enabled
	if not frappe.db.get_value("User", frappe.session.user, "enabled"):
		frappe.throw("User is disabled", frappe.AuthenticationError)

	# Verify session exists and is valid
	if not frappe.session.sid or frappe.session.sid == "Guest":
		frappe.throw("Invalid session", frappe.AuthenticationError)

	# Get CSRF token for valid, authenticated session
	csrf_token = frappe.sessions.get_csrf_token()

	if not csrf_token:
		frappe.throw("Failed to generate CSRF token", frappe.ValidationError)

	return {
		"csrf_token": csrf_token,
		"session_id": frappe.session.sid
	}


def _parse_list_parameter(value, param_name):
	"""
	Parse a list parameter that may come as JSON string or list.
	
	Args:
		value: Value to parse (string or list)
		param_name: Name of parameter for error messages
		
	Returns:
		list: Parsed list value
	"""
	if isinstance(value, str):
		try:
			value = value.strip()
			return json.loads(value) if value else []
		except json.JSONDecodeError as json_err:
			frappe.throw(_("Could not parse '{0}' as JSON: {1}").format(param_name, str(json_err)))
	
	if not isinstance(value, list):
		return []
	
	return value

def check_user_company():
	"""
	Check if the authenticated user has a company linked to them
	"""
	user = frappe.session.user

	existing_permission = frappe.db.exists("User Permission", {"user": user, "allow": "Company"})
	has_company = bool(existing_permission)

	company_name = None
	if has_company:
		company_id = frappe.db.get_value("User Permission", existing_permission, "for_value")
		company_name = frappe.db.get_value("Company", company_id, "company_name")

	data = {"has_company": has_company, "company": company_name or ""}

	return data