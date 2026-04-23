# Login

## Target File

docs/ui/login.md

## Page Purpose

- Entry screen for all user roles to access the system.
- Presents a branded sign-in experience with a supporting marketing-style visual panel on large screens.

## Layout Structure

- Full-height split-screen layout.
- On desktop, the page is a 2-column grid.
- Left column contains brand mark, centered sign-in form, demo account block, and a small footer copyright line.
- Right column is a decorative hero panel shown only on large screens.
- On small and medium screens, only the left form column is visible and it expands to full width.

## Sections

- Brand header: small logo and two-line product name at the top-left of the form column.
- Sign-in intro: large page title and short helper text.
- Error alert: destructive inline alert shown above the form when credentials fail.
- Sign-in form: email field, password field with inline visibility toggle, and primary submit button.
- Divider row: horizontal lines with centered “or” label.
- Secondary SSO-style button: outlined full-width button with globe icon.
- Demo accounts panel: dashed bordered information card listing sample credentials.
- Right visual panel: gradient background, oversized logo, headline, supporting text, and 3 small status chips.
- Footer note: centered copyright line pinned visually near the bottom of the left column.

## Component Hierarchy

- Page root
- Left authentication column
- Brand block
- Centered auth content stack
- Intro copy
- Optional error alert
- Form
- Email field group
- Password field group
- Password input with right-aligned toggle button
- Primary sign-in button
- Divider
- Secondary outline button
- Demo account card
- Footer text
- Right hero column on desktop
- Centered illustration/content stack
- Large logo
- Marketing copy
- 3-column status chip row

## UI Elements

- Buttons
  - Primary full-width “Sign in” button.
  - Secondary full-width outlined “Sign in with CMU” button.
  - Password visibility icon button inside the password field.
- Inputs
  - Email input.
  - Password input.
- Alerts
  - Destructive error alert with icon and message.
- Cards
  - Demo credentials card with dashed border.
  - Desktop status chips styled as mini cards.
- Icons
  - Alert icon, eye/eye-off toggle icons, spinner icon during loading, globe icon inside SSO button.
- Empty-state blocks
  - None.

## Styling

- Clean hospital/admin-product aesthetic with soft neutrals and light surfaces.
- Overall background is very light, almost off-white.
- Left side uses generous horizontal padding that increases across breakpoints.
- Form content is constrained to a narrow max width and vertically centered.
- Typography hierarchy:
  - Brand name is compact and small.
  - Main heading is bold, large, and prominent.
  - Supporting copy and helper text use muted gray.
- Inputs and buttons follow rounded medium corners.
- Demo accounts panel uses dashed border, slightly tinted muted background, and compact text.
- Hero panel uses a soft purple-to-orange gradient background.
- Status chips on the hero panel use translucent white card surfaces with subtle blur.
- Color usage:
  - Purple is the primary product/admin color.
  - Orange, blue, and green appear as status accents.
- Shadows are soft and understated, mainly on illustration and chips.

## Interaction

- Password visibility toggle switches icon and input masking state.
- Primary submit button enters a disabled loading state and swaps text for a spinner icon.
- Error alert appears inline after a failed submission.
- Secondary outline button behaves like a clickable alternate entry option.
- On desktop, the right visual panel is non-interactive and purely decorative.
- Inputs and buttons follow standard hover and focus affordances from the shared UI system.

## States

- Default state: empty fields, primary button enabled, hero panel visible on desktop.
- Error state: destructive alert appears above the form.
- Loading state: submit button disables and shows a spinner.
- Success feedback state: not visually shown on this screen; successful sign-in redirects away.
- Empty state: not applicable.
- Read-only state: not applicable.

## Mobile Behavior

- Split layout collapses to a single column.
- Decorative right panel disappears entirely below large screens.
- Form remains centered with narrower padding on small screens.
- All controls stay full-width for touch friendliness.
- Footer remains centered beneath the main content.

## UI Notes

- This is the only major screen without the shared authenticated navbar shell.
- The desktop hero panel provides the project’s strongest branded visual treatment and should be preserved for parity.
- The compact dashed demo-account card is part of the visible composition and should be retained even if its content later changes.