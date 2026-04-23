# Student Detail

## Target File

docs/ui/student-detail.md

## Page Purpose

- Admin-facing detail page for reviewing a single student’s profile, internship information, attached files, and current progress state.
- Also acts as the UI surface for manually changing the student’s visible status.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky admin navbar at the top.
- Main content starts with a back link.
- First major card is a student profile header with status badge and a status-control block.
- Second major area is a responsive 3-column layout.
  - Left two columns: grouped information cards.
  - Right one column: attachments card and quick-info card.
- When the student does not exist, the page collapses to a single centered card state.

## Sections

- Shared navbar.
- Back-to-students link.
- Student hero card.
- Student identity block: avatar, name, ID, major, year, status badge.
- Status control block: stepper/timeline plus status action buttons.
- Personal Information card.
- Education card.
- Internship card.
- Attachments card.
- Quick info card.
- Not-found fallback card when the record is unavailable.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Back link row
- Student hero card
- Identity block
- Status badge
- Status control panel
- Stepper row
- Step node
- Step label
- Action button group
- Content grid
- Left content stack
- Section card
- Card header
- Definition-list grid
- Icon field row
- Right content stack
- Attachments card
- File list item
- Download icon button
- Quick info card
- Not-found fallback card when needed

## UI Elements

- Buttons
  - Back to students text button.
  - Three status action buttons: Pending, In Progress, Complete.
  - Download icon buttons in file rows.
  - Back to students CTA in not-found state.
- Cards
  - Student hero card.
  - Status control inset panel.
  - Three information section cards.
  - Attachments card.
  - Quick info card.
  - Not-found fallback card.
- Badges
  - Large student status badge.
  - Avatar circle with initials.
- File lists
  - Attachment list with icon, metadata, and action button.
- Empty-state blocks
  - “No files uploaded yet” inside attachments card.
  - Student-not-found full-page fallback.

## Styling

- Admin shell styling with white cards, soft shadows, subtle borders, and a light page background.
- Student identity is marked with an orange avatar circle and orange-accented student-related surfaces.
- Hero card uses generous padding and rounded-xl corners.
- Status control panel is inset within the hero card using muted tinted background and smaller internal spacing.
- Stepper uses numbered circles and small labels; completed/current steps receive stronger filled styling.
- Action buttons to the right of the stepper switch between filled and outline styles depending on selected state.
- Information cards use a shared pattern:
  - bordered shell
  - header strip with bottom border
  - two-column definition-list body on larger screens
- Field rows use small muted icon tiles on the left and text labels/values on the right.
- Attachments rows behave like compact utility rows with file icon tile, metadata, and trailing icon button.

## Interaction

- Back control returns the user to the students list.
- Status buttons visibly indicate the selected state through button style.
- Attachment rows themselves are not fully clickable, but the trailing download icon suggests a file action.
- File rows get a muted hover background.
- Shared navbar supports navigation, notification dropdown, user menu, and mobile drawer.
- Not-found state provides a single recovery action back to the list.

## States

- Default state: student found, all detail cards visible.
- Attachment empty state: centered file icon and helper text inside attachments card.
- Not-found state: centered bordered card with title, explanation, and back CTA.
- Loading state: no dedicated loading UI shown here.
- Error state: no distinct visual error treatment beyond not-found.
- Read-only state: not represented for admins.
- Success feedback state: no standalone confirmation UI is shown for status change.

## Mobile Behavior

- Navbar collapses to mobile menu sheet.
- Header card stacks vertically.
- Stepper and action buttons stack; action buttons remain grouped and visible below the stepper.
- Main 3-column layout collapses into a single vertical stack.
- Information definition lists collapse from 2 columns to 1 column where space requires.

## UI Notes

- The page is detail-dense but still card-based; preserving spacing and section grouping matters more than mimicking exact data.
- The stepper and status-action buttons are both visible at once, so the page communicates status using two parallel visual patterns.
- The not-found state is a real alternate screen and should be preserved if the rebuilt app can land on missing records.