# Prompt Recipes

## Purpose

These prompts are designed to help AI start from the right implementation surface quickly in future internal systems.

## Vertical Slice Prompt

"Implement one vertical slice for [feature name] in this Next.js App Router + Prisma app. Follow the existing RBAC rules, update `proxy.ts` if the route is protected, use real Prisma-backed data, keep the change minimal, and validate the touched slice only."

## Workflow Prompt

"Update the workflow state logic for [state or transition]. Preserve server-side RBAC, keep student editability and admin status control consistent, and verify any notification or revalidation side effects."

## File Upload Prompt

"Extend the student/document upload flow for [requirement]. Preserve deterministic file metadata, enforce read-only states server-side, and keep admin-facing side effects intact."

## Dashboard Prompt

"Add or update a dashboard metric for [metric name]. Define the business meaning precisely, scope it by role on the server, and keep the dashboard summary-oriented."

## OAuth Prompt

"Implement [Google OAuth / federated login] in this internal app. Authenticate with the provider, authorize only against existing local accounts, create the app session only after authorization passes, and preserve safe redirect behavior."

## Review Workflow Prompt

"Add [review comments / verification / requested fixes] to the admin review flow. Keep the change DB-backed, role-restricted, auditable, and aligned with notification and activity-log side effects."

## Debugging Prompt

"Find the direct server-side code path controlling [behavior]. Form one local hypothesis, make the smallest plausible fix, and run the narrowest validation that can falsify it."