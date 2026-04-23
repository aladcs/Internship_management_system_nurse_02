# Administrator List

## Target File

docs/ui/admin-list.md

## Page Purpose

- Super admin workspace for viewing, searching, creating, editing, and removing administrator accounts.
- Emphasizes list management with quick access to modal-based create and edit actions.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky top navbar spans the full width.
- Main content is centered inside a max-width container with responsive horizontal padding.
- Page header contains title, description, and a top-right primary action button.
- Main content is a single rounded card containing search, count summary, and either a table/card list or an empty state.
- Create, edit, and delete confirmations appear as overlays above the page.

## Sections

- Shared navbar: logo, super-admin nav, user menu, mobile hamburger drawer.
- Page header: title, description, and “Create Admin” action.
- Filter toolbar: search input on the left and result count on the right.
- Admin listing area:
  - Desktop table view.
  - Mobile stacked list cards.
- Empty state: centered illustration-style icon block when there are no results or no admins.
- Create/edit dialog: modal form for admin details.
- Success credential panel: alternate create-dialog content showing generated password and copy action.
- Delete confirmation dialog: destructive confirmation overlay.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Page header row
- Title/description block
- Primary action button
- Main list card
- Toolbar row
- Search input with leading icon
- Result count text
- Conditional content
- Desktop table
- Table row
- Avatar badge
- Name/meta block
- Action icon buttons
- Mobile card list
- Create/edit dialog
- Form fields
- Footer actions
- Success password panel
- Delete alert dialog

## UI Elements

- Buttons
  - Primary “Create Admin” button in page header.
  - Ghost icon edit button.
  - Ghost destructive delete button.
  - Modal footer buttons for cancel/save.
  - “Done” button after password reveal.
  - Empty-state create button.
- Inputs
  - Search field with embedded search icon.
  - Name input in dialog.
  - Email input in dialog.
- Tables
  - Desktop table with columns for admin, email, created, actions.
- Cards
  - Main listing card.
  - Mobile admin item cards.
  - Empty-state center panel.
  - Success password card inside the dialog.
- Badges
  - Avatar circles with initials.
  - Small “Admin” meta line with shield icon rather than a pill badge.
- Dialogs / modals
  - Create admin dialog.
  - Edit admin dialog.
  - Delete confirmation alert dialog.
- Empty-state blocks
  - No admins yet.
  - No matching admins after search.

## Styling

- Shared shell uses a light background with a sticky translucent header and subtle bottom border.
- Super-admin/admin visual language leans on the purple primary color.
- Main list container is a white card with rounded extra-large corners, border, and soft shadow.
- Header action button is slightly elevated with soft shadow.
- Search toolbar uses compact spacing and a clear divider between toolbar and content.
- Desktop table header uses muted tinted background, uppercase small text, and generous horizontal padding.
- Rows highlight with a subtle muted background on hover.
- Avatar circles are solid purple with white initials.
- Dialogs are compact centered modals with clear title/description hierarchy.
- The generated-password state uses a success-tinted box with green accents and a monospaced password row.
- Destructive actions use red foreground and red-tinted hover/fill states.

## Interaction

- Search input filters the visible list immediately from a UX standpoint.
- “Create Admin” opens a centered modal.
- Edit icon opens the same modal in edit mode.
- Delete icon opens a confirmation alert dialog.
- Copy password icon changes to a confirmation check mark briefly after copying.
- Modal close behavior supports explicit cancel/close and final “Done” action.
- Table rows are informational; the row itself is not clickable.
- Shared navbar supports active-link styling and mobile slide-in navigation drawer.

## States

- Default state: populated list with search and action controls.
- Empty state: no admins available, with centered icon and create CTA.
- Filtered empty state: no matches found, no create CTA when caused by query.
- Success feedback state: create flow swaps to a generated-password confirmation view.
- Error state: inline validation messages appear below dialog fields.
- Loading state: no dedicated page loading UI is shown.
- Read-only state: not represented.

## Mobile Behavior

- Navbar collapses to hamburger-triggered side sheet.
- Page header stacks vertically and action button drops below title/description.
- Desktop table is replaced with stacked list rows separated by dividers.
- Search area stays full-width and result count moves beneath or beside it depending on width.
- Dialog remains centered with mobile-friendly width.

## UI Notes

- The admin list is intentionally management-oriented rather than analytics-oriented: one dominant card, one toolbar, one data view.
- The create flow includes a second-step password reveal state inside the same modal rather than a toast-only confirmation.
- Reusable page-shell patterns here also appear on dashboard, students, overview, form, and student detail pages.