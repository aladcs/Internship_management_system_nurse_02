# Student Overview

## Target File

docs/ui/overview.md

## Page Purpose

- Student-facing home screen showing current internship progress, summary information, and personal files.
- Acts as the main self-service overview before entering the editable form.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky top navbar includes student-branded navigation and user controls.
- Main content begins with a large hero/status card.
- Below the hero is a 3-column responsive content grid.
  - Left two columns: summary information cards.
  - Right one column: files card and a support/help card.

## Sections

- Shared navbar.
- Hero status card.
- Welcome copy and student status badge.
- Primary action area on the hero card.
- Three-step internship timeline cards.
- Personal Information summary card.
- Internship summary card.
- Education summary card.
- My Files card.
- Help/support card.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Hero card
- Intro block
- Status badge and optional completion note
- Primary action area
- Timeline grid
- Timeline step card
- Main content grid
- Summary card stack
- Card header
- Definition-list grid
- Row item with icon tile
- Sidebar stack
- Files card
- File row list or empty state
- Help card

## UI Elements

- Buttons
  - Large orange primary hero CTA: “Submit Form” or “Edit Form”.
  - Link-style upload CTA in empty files state.
  - No CTA button when the page is read-only; replaced by a lock notice.
- Cards
  - Large gradient hero card.
  - 3 summary cards.
  - Files card.
  - Accent-tinted help card.
  - Timeline mini-cards inside hero.
- Badges
  - Medium student status badge.
  - Optional completion note with sparkles icon.
- File lists
  - My Files list with icon tile and file metadata.
- Empty-state blocks
  - “No files uploaded” state inside the files card.
- Menus / navigation
  - Shared navbar with overview link active.

## Styling

- Student pages shift emphasis from purple to orange accenting.
- Hero card is a soft gradient surface with extra-large rounding and roomy padding.
- Main headline is large and welcoming, with first-name emphasis.
- Primary CTA uses a solid orange fill, white text, and soft shadow.
- Read-only replacement notice is a bordered neutral card-like pill with a lock icon.
- Timeline cards inside the hero mix bordered and dashed treatments:
  - active/current and completed steps look solid and elevated
  - future steps look lighter and more subdued
- Summary cards reuse the app’s white bordered soft-shadow style.
- Sidebar help card uses orange-tinted background rather than plain white.
- File icon tiles in student areas use orange-soft backgrounds instead of purple-soft backgrounds.

## Interaction

- Hero CTA navigates to the form page.
- Files empty state includes a text-style upload link if editing is allowed.
- Shared navbar supports active state highlighting in orange for the student role.
- Navbar user menu and mobile drawer behave the same as on admin pages, but the active-link and accent styling switch to orange.
- Timeline is display-only and does not expose direct editing controls.

## States

- Default state: hero card with editable CTA and populated summary cards.
- Completed/read-only state: CTA is replaced by a lock message; completion note appears beside the status badge.
- Files empty state: icon, muted helper text, and optional upload-now link.
- Loading state: no dedicated loading UI is defined on this page.
- Error state: no distinct page error UI.
- Success feedback state: completion note visually communicates success when status is completed.

## Mobile Behavior

- Navbar collapses to hamburger sheet.
- Hero content stacks vertically; action area drops beneath the intro copy.
- Timeline remains a 3-column grid but with tighter spacing.
- Main 3-column layout collapses into a single column stack.
- Summary card rows remain readable as compact icon-and-text pairs.

## UI Notes

- This page is the student counterpart to the admin dashboard: summary-first, edit-secondary.
- The hero card is the defining visual of the screen and should be rebuilt faithfully.
- Orange is the dominant action color here, especially for CTA, step emphasis, and file accents.