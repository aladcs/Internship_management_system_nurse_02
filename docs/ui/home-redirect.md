# Home Redirect Screen

## Target File

docs/ui/home-redirect.md

## Page Purpose

- Transitional landing surface shown briefly while the app routes the user to the appropriate destination.
- Functions as a minimal loading/redirect screen rather than a full content page.

## Layout Structure

- Full-height centered layout.
- Single centered loading spinner on a plain background.
- No navbar, branding block, or additional messaging.

## Sections

- Full-screen background.
- Centered spinner.

## Component Hierarchy

- Page root
- Full-screen flex container
- Spinner element

## UI Elements

- Loading indicator
  - Circular spinner with transparent top segment.
- No buttons.
- No inputs.
- No cards.
- No dialogs.

## Styling

- Very minimal visual treatment.
- Light background matching the app’s global background color.
- Spinner uses primary purple border color.
- Spinner size is small-to-medium and centered both vertically and horizontally.

## Interaction

- No direct user interaction.
- Screen exists only as a transient route-loading state.

## States

- Default/loading state: centered animated spinner.
- No error state defined.
- No empty state.
- No success state.
- No read-only state.

## Mobile Behavior

- Same centered spinner layout on all screen sizes.

## UI Notes

- This is a real visible page-level state and should be documented if the rebuild intends to match route transitions.
- If omitted in a rebuild, route changes may feel sharper and less consistent with the original app.