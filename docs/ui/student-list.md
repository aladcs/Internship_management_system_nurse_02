# Student List

## Target File

docs/ui/student-list.md

## Page Purpose

- Main admin page for browsing, filtering, creating, and removing student records.
- Combines searchable data listing with quick status segmentation and modal-based create flow.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky admin navbar at top.
- Page header includes title, description, and “Create Student” primary button.
- Main content is one dominant rounded card.
- Inside the card:
  - top toolbar with search and result count
  - chip-style filter row
  - conditional table or mobile list
- Create and delete flows appear as modal overlays.

## Sections

- Shared navbar.
- Page header.
- Search/result toolbar.
- Status filter chips.
- Student list area:
  - desktop table
  - mobile linked cards
- Empty state.
- Create student dialog.
- Generated password success state within the create dialog.
- Delete confirmation alert dialog.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Header row
- Title/description block
- Create button
- Main list card
- Toolbar stack
- Search input with icon
- Result counter
- Filter chip row
- Conditional content
- Desktop table
- Table row
- Student avatar and meta block
- Status badge
- Action icon buttons
- Mobile linked list item
- Create dialog
- Form grid
- Success password panel
- Delete alert dialog

## UI Elements

- Buttons
  - Primary “Create Student” button.
  - Filter pills acting as segmented controls.
  - Desktop view and edit icon buttons linking to detail screen.
  - Destructive delete icon button.
  - Dialog footer cancel/create buttons.
  - “Done” button after creation.
  - Empty-state create button.
- Inputs
  - Search input with leading icon.
  - Student create form inputs for name, email, ID, major, year, and phone.
- Tables
  - Desktop table with columns for student, ID, major, status, actions.
- Cards
  - Main list card.
  - Mobile student list rows.
  - Empty state.
  - Success password panel inside dialog.
- Badges
  - Status pill badges.
  - Student avatar circles.
- Dialogs / modals
  - Create student dialog.
  - Delete confirmation dialog.
- Empty-state blocks
  - No students yet.
  - No students matching current search/filter.

## Styling

- Keeps the same admin shell as dashboard, but student entities use orange accent highlights.
- Primary action button is purple, while student avatar circles and some contextual highlights use orange.
- Filter chips are compact rounded-full pills; active chip is solid primary, inactive chips are muted gray.
- Table header uses muted tinted background with uppercase micro-labels.
- Desktop rows get subtle hover tint.
- Mobile rows are larger tap-friendly items with status badge aligned to the right.
- Success password card uses green success tint, border, and monospaced password display.
- Create dialog content uses a responsive 2-column field grid.
- Overall surface treatment is light, rounded, softly shadowed, and consistent with the rest of the app.

## Interaction

- Search input narrows the visible list from a UI perspective.
- Filter chips toggle selected styling and reduce the visible list by status.
- Create button opens a modal dialog.
- After creation, the dialog swaps to a success-and-password reveal panel.
- Copy icon briefly changes to check icon after copy.
- Desktop eye and pencil actions both navigate to the student detail page.
- Mobile list items are fully clickable links to detail pages.
- Delete icon opens a destructive confirmation dialog.
- Shared navbar behaviors match dashboard.

## States

- Default state: populated list with toolbar and active filter row.
- Empty state: centered icon, heading, explanatory text, and optional create CTA.
- Filtered empty state: no-match messaging appears when search or filter removes all rows.
- Error state: inline field validation messages appear in the create dialog.
- Success feedback state: modal success panel after create.
- Loading state: no dedicated page-level loading UI.
- Read-only state: not applicable.

## Mobile Behavior

- Navbar collapses into right-side sheet navigation.
- Table transforms into stacked linked rows.
- Toolbar content stacks vertically.
- Filter chips wrap onto multiple lines.
- Create dialog remains usable at narrow widths with the form grid collapsing naturally.

## UI Notes

- The list card contains both search and filtering; there is no separate sidebar.
- Student records visually balance admin control chrome with more student-colored identity markers.
- The create flow mirrors the admin create flow for consistency, but uses a larger field set.