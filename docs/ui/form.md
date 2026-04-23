# Internship Form

## Target File

docs/ui/form.md

## Page Purpose

- Student-facing form page for entering or updating internship details and uploading files.
- Supports both first-time submission and later edits until the record becomes read-only.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky student navbar at top.
- Main content starts with a back-to-overview link.
- Primary body is a long vertical form made of stacked section cards.
- Each section card contains a header row and a responsive field grid.
- A sticky action bar is pinned to the bottom of the viewport while the user scrolls.
- In read-only mode, the form is replaced by a single warning-style centered card.

## Sections

- Shared navbar.
- Back-to-overview link.
- Personal Information form section.
- Education form section.
- Internship form section.
- File Attachments section.
- Sticky footer action bar.
- Read-only lock state card when editing is disabled.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Back link row
- Form element
- Section card
- Section header with icon tile and title
- Field grid
- Field wrapper
- Label row
- Input or textarea control
- Validation message
- File upload area
- Hidden native file input
- Uploaded file list
- File row
- Sticky footer action bar
- Cancel button
- Primary submit button
- Read-only replacement card when applicable

## UI Elements

- Buttons
  - Back text button.
  - Upload zone trigger button behavior.
  - Per-file remove icon button.
  - Footer cancel button.
  - Footer primary submit/save button.
  - Read-only state “Back to overview” button.
- Inputs
  - Text inputs for names, phone, university, major, GPA, company, position, supervisor.
  - Date inputs for date of birth, internship start date, internship end date.
  - Month input for expected graduation.
  - Textarea for address.
- File upload zones
  - Large dashed upload dropzone.
  - Hidden multi-file picker input.
  - Uploaded files list with remove controls.
- Cards
  - Four form section cards.
  - Sticky footer bar with blurred background effect.
  - Read-only warning card.
- Status indicators
  - Required asterisk markers.
  - Inline error messages under invalid fields.
  - Uploaded state check indicator beside each file on larger screens.

## Styling

- Student styling uses orange accent surfaces inside section headers and file upload affordances.
- Section cards are white with rounded-xl corners, subtle borders, and soft shadows.
- Section headers use a bottom border and icon tile on the left.
- Field bodies use a 2-column grid on larger screens and a single column on small screens.
- Labels are compact and clear; required markers use destructive red.
- The dropzone uses a 2-pixel dashed border, large vertical padding, centered icon, and muted background.
- Drag-over state brightens the border and background with orange tint.
- Uploaded file rows use bordered mini-cards with file icon tile and trailing remove action.
- Sticky footer bar uses a semi-transparent page background with border-top and backdrop blur.
- Read-only state card uses warning-tinted background and centered layout.

## Interaction

- Back control navigates to the overview page.
- Fields support normal text entry and date picking.
- Validation errors appear below fields and are visually tied to required inputs.
- Upload zone supports both click-to-upload and drag-and-drop behavior.
- Dragging a file over the zone changes its visual styling.
- File rows can be removed individually using the trailing close icon.
- Primary footer button switches label depending on whether the user is submitting for the first time or editing.
- Primary footer button becomes disabled while saving.
- Cancel button is disabled while saving.
- Read-only state removes the form entirely and offers only a return button.

## States

- Default state: editable form with existing or blank values.
- Validation error state: inline field errors plus destructive feedback styling through text.
- Drag-over state: upload zone gains orange border and orange-soft background.
- Files-present state: uploaded file list appears below the dropzone.
- Submitting state: primary action button changes text to “Saving...” and disables actions.
- Read-only state: full form replaced by warning card with lock icon and explanatory copy.
- Success feedback state: no inline success banner on the page; navigation happens after successful save.
- Empty state: attachments list absent until files are present.

## Mobile Behavior

- Navbar collapses to mobile drawer.
- Field grids collapse into a single-column layout.
- Sticky action bar stacks buttons vertically in reverse order, with the primary action visually above cancel.
- Upload zone remains full-width and touch-friendly.
- Uploaded file rows compress, and the uploaded confirmation label is hidden on small screens.

## UI Notes

- The sticky action bar is a defining interaction pattern for this screen and should be preserved.
- The read-only lock screen is a separate visual mode, not just disabled fields.
- Section icons and orange upload accents help break up a long form and should be recreated for comparable scannability.