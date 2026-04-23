# Not Found

## Target File

docs/ui/not-found.md

## Page Purpose

- Generic fallback screen for unknown routes.
- Provides a simple recovery path back to the home route.

## Layout Structure

- Full-height centered layout.
- Small centered content block with headline, subheadline, supporting text, and single CTA.
- No authenticated navbar or page shell.

## Sections

- Full-screen background wrapper.
- Centered error content stack.
- Primary recovery button.

## Component Hierarchy

- Page root
- Full-screen flex container
- Centered content wrapper
- Large numeric error code
- Heading
- Supporting paragraph
- CTA link styled as button

## UI Elements

- Buttons / links
  - Single “Go home” button-style link.
- Typography
  - Large 404 code.
  - Medium page title.
  - Small muted explanatory text.
- No forms.
- No cards.
- No dialogs.

## Styling

- Minimal, centered, and quiet.
- Very large bold “404” numeral.
- Standard heading and muted body copy below it.
- CTA uses solid primary purple fill with white text and medium rounded corners.
- Generous vertical spacing between text blocks and CTA.
- Light neutral background consistent with the rest of the app.

## Interaction

- Primary button navigates back to the home route.
- Button includes standard hover color darkening.

## States

- Default state: centered 404 content and recovery CTA.
- No loading state.
- No alternate empty state.
- No read-only state.
- No explicit error variants beyond the 404 itself.

## Mobile Behavior

- Same centered layout with horizontal padding.
- Content remains narrow and readable on small screens.

## UI Notes

- This screen is intentionally sparse and should stay visually separate from authenticated pages.
- Its simplicity contrasts with the card-heavy authenticated UI and helps reinforce that the user has left the normal flow.