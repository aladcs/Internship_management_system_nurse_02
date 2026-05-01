# File Storage Contract

## Purpose

This file defines the durable expectations around uploaded files and profile-image storage so future systems can preserve traceability and authorization boundaries.

## Storage Concepts

The project currently uses separate storage concepts for:

- student files
- student profile images

Relevant directories in the workspace show this split clearly.

## Required File Metadata

Every uploaded file record should preserve:

- owner record id
- display name
- storage path
- mime type when known
- size when known
- created timestamp

## Authorization Rules

- File access must not rely on the filesystem path alone.
- Protected file routes should validate the current user and ownership or role authority.
- Student access should be limited to owned files unless a future product explicitly widens visibility.
- Admin access should remain server-controlled, not implied by a public path.

## Naming And Path Rules

- Storage paths should be deterministic enough to debug and authorize.
- Publicly guessable file names should not be treated as authorization.
- Separate logical file categories by path or record type when the domain distinguishes them.

## Replacement And Removal Rules

- Removal should be blocked when the workflow is read-only.
- Replacement should preserve enough metadata for staff review and troubleshooting.
- In stricter future systems, versioning or replacement lineage may be worth storing explicitly.

## Reuse Guidance

Carry this contract forward for:

- clinical document uploads
- profile photos
- practicum evidence files
- approval attachments
- verification packets