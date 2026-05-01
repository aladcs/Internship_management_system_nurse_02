# UI Pattern Catalog

## Purpose

This file catalogs recurring UI patterns already present in the project and worth reusing in future internal systems.

## Core Patterns

### Dashboard Summary Page

- Header with concise description
- Stats row with summary cards
- Lower content row for recent items and notifications
- Summary-first, low-control, operational feel

### Long Student Form

- Back link to overview
- Stacked section cards
- Responsive field grid
- Upload section
- Sticky bottom action bar
- Dedicated read-only replacement state

### Admin Detail Page

- Back link to collection
- Hero card with identity and status
- Detail-rich card grid
- Side panel for files or quick info
- Staff controls grouped near current status

### List Management Page

- Search and filters near the top
- Table or list rows with primary entity info and action controls
- Create button or modal entry point

### Notifications Surface

- Short list in navbar or dashboard
- Full page feed for deeper review
- Click-through rows with read/unread treatment

### Activity Timeline Page

- Filterable recent-event list
- Each row includes actor, action summary, time, and link back to the affected record

### Policy Gate Page

- Single focused panel
- Explicit acknowledgement action
- Minimal distractions

## Design Language Notes

- Admin pages lean purple
- Student pages lean orange
- Cards use soft borders, soft shadows, and high scannability
- Empty states are simple and explicit
- Dense workflows are still broken into cards rather than one undifferentiated surface

## Reuse Guidance

When creating a new page, identify which of these patterns it belongs to before inventing a new layout.