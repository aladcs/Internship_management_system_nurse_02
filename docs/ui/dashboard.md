# Dashboard

## Target File

docs/ui/dashboard.md

## Page Purpose

- Main admin landing page that summarizes student activity and recent updates.
- Gives a quick operational overview before navigating deeper into student records.

## Layout Structure

- Uses the shared authenticated page shell.
- Sticky navbar at the top with logo, admin nav links, notifications trigger, user menu, and mobile drawer.
- Main container begins with page title and short description.
- First content row is a responsive statistics grid.
- Second content row is a 3-column layout on large screens.
  - Left two columns: recent students card.
  - Right one column: notifications card.

## Sections

- Shared navbar.
- Welcome header with title and supporting description.
- Stats row with 4 summary cards.
- Recent Students card with section header and “View all” link.
- Notifications card with section header and list of recent notification items.

## Component Hierarchy

- Page shell
- Sticky navbar
- Main container
- Header block
- Stats grid
- Stat card
- Icon tile
- Value/label/hint text stack
- Lower content grid
- Recent students card
- Card header with title and link
- Student row list
- Student item link row
- Avatar, meta, status badge
- Notifications card
- Card header
- Notification row list
- Notification item link row

## UI Elements

- Buttons
  - No page-level CTA button in the header.
  - Shared navbar includes notification bell trigger and user menu trigger.
- Links
  - “View all” link in Recent Students header.
  - Student rows link to detail pages.
  - Notification rows link to related student details.
- Cards
  - 4 stat cards.
  - Recent students list card.
  - Notifications list card.
- Badges
  - Student status pill badges.
  - Unread notification dot.
  - Notification count badge in navbar bell.
- Menus / dropdowns
  - Navbar notification dropdown.
  - Navbar user dropdown.
- Empty-state blocks
  - Empty recent students message.
  - Empty notifications message in both page card and navbar dropdown.

## Styling

- Purple-first admin palette with white cards on a very light background.
- Page spacing uses a comfortable content rhythm: compact top header spacing, then larger gaps between content blocks.
- Stats cards use rounded-xl corners, border, soft shadow, internal padding, and strong numeric typography.
- Each stat card includes a tinted square icon badge using status-specific colors.
- Recent students and notifications cards share the same card anatomy:
  - bordered card shell
  - section header with bottom border
  - divided list rows
- Student avatars use orange accent circles, which visually separate student entities from admin chrome.
- Notification unread state adds a small orange dot and tighter left alignment.
- Hover feedback is subtle muted background tint on list rows.

## Interaction

- Recent student rows are clickable as full-width link rows.
- Notification rows are clickable as full-width link rows.
- “View all” is a text-style link with arrow icon.
- Navbar bell opens a dropdown panel aligned to the right.
- Navbar unread badge appears only when there are unread items.
- Notification dropdown supports “Mark all read” as a text action in the header.
- User menu opens from the profile pill.
- Mobile hamburger opens a right-side sheet containing nav links and logout.

## States

- Default state: four stat cards plus populated recent activity cards.
- Empty state: recent students and/or notifications cards show centered muted empty messages.
- Loading state: no dedicated skeleton or spinner on this page.
- Error state: no visual error treatment defined.
- Success feedback state: not directly represented.
- Read-only state: not applicable.

## Mobile Behavior

- Stats compress into a 2-column grid.
- Lower 3-column layout collapses into a single vertical stack.
- Navbar switches from inline navigation to hamburger sheet.
- User pill in navbar hides on small screens in favor of the mobile menu.
- List cards remain full-width and maintain readable tap targets.

## UI Notes

- This page is purely summary-oriented: no forms, no heavy controls, and no dense filtering.
- The dashboard establishes the visual language used elsewhere: soft borders, soft shadows, muted card headers, and role-based accent colors.
- The same notification content appears both in the navbar dropdown and in a dedicated dashboard card, but the presentation differs in scale.