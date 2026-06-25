---
name: Workouts
description: A calm, offline-first workout logger built for fast entry mid-set.
colors:
  bg: "#15171a"
  surface: "#1d2024"
  surface-raised: "#242830"
  border: "#2c3036"
  text: "#ecedee"
  text-dim: "#9aa0a6"
  accent: "#4fbdb0"
  accent-contrast: "#08130f"
  danger: "#e2716b"
typography:
  headline:
    fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.5
  title:
    fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  sm: "8px"
  md: "14px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-contrast}"
    rounded: "{rounded.md}"
    typography: "{typography.body}"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    typography: "{typography.body}"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    typography: "{typography.body}"
    height: "44px"
  button-danger-text:
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    height: "44px"
  input-field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    height: "44px"
  list-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  tab-bar-item-active:
    textColor: "{colors.accent}"
    typography: "{typography.caption}"
---

# Design System: Workouts

## 1. Overview

**Creative North Star: "The Quiet Logbook"**

Workouts is a record-keeping tool, not a performance. It exists to capture exactly what someone
lifted, the moment they lifted it, with a phone in one hand and chalk on the other. Every surface
is flat, dark, and tonal: a charcoal base (`#15171a`) that steps up through two lighter panels
(`#1d2024`, `#242830`) rather than relying on shadows, so depth reads as "closer to the surface
you're touching" rather than as a designed effect. The single accent — Quiet Teal (`#4fbdb0`) — is
rationed: it marks the one action worth taking (start, finish, the active tab) and the one number
worth noticing (last time's note), and nothing else.

This system explicitly rejects two opposite failure modes. It is not a **generic SaaS
dashboard** — no card-grid hero metrics, no decorative charts, no "stats at a glance" tiles; this
is a logger, not an analytics product, and v1 deliberately has no charts or progress views. It is
also not a **bare notes/spreadsheet feel** — flat does not mean undesigned; every list row, input,
and button carries deliberate radius, spacing, and weight. And it borrows nothing from
**gamified fitness apps**: no streaks, no badges, no social feed, no leaderboard. One person logs
one set at a time.

**Key Characteristics:**
- Flat, tonal-layered surfaces — no shadows anywhere in the system
- One rationed accent color (Quiet Teal) carrying all meaning-bearing emphasis
- A five-step type scale built for short labels and tabular numbers, not headlines
- Visual weight matches tap frequency: rare structural actions get a bordered card, frequent in-flow actions get plain text
- Generous tap targets (44px minimum) everywhere a tired hand might miss

## 2. Colors

The palette is almost entirely neutral — a charcoal-to-slate tonal ramp for every surface and
nearly all text — with exactly one saturated color and one soft warning color breaking through.

### Primary
- **Quiet Teal** (`#4fbdb0`): the only color allowed to carry meaning. Used on the Start/Finish
  button fill, the active tab icon and label, the "last time" note highlight, and link-style
  affordances (Create a template, Add exercise). Never used decoratively.

### Neutral
- **Charcoal** (`#15171a`) — app background; the resting tone everything else sits on top of.
- **Panel** (`#1d2024`) — cards, list rows, the header bar, the tab bar, the bottom sheet.
- **Surface Raised** (`#242830`) — the response to touch: pressed list rows, input fields, the
  resume-session pill background. Never a resting background — only a reaction.
- **Hairline** (`#2c3036`) — every 1px border and divider in the system. Also the dash color on
  "add new" affordances.
- **Paper White** (`#ecedee`) — primary text, off-white rather than pure white to stay easy on the
  eyes under low gym lighting.
- **Muted Slate** (`#9aa0a6`) — secondary text: subtitles, dates, field labels, placeholders.
- **Ink** (`#08130f`) — text-on-teal only; appears solely inside the primary button fill.

### Tertiary
- **Soft Coral** (`#e2716b`) — reserved entirely for destructive actions (discard, remove set,
  remove exercise). Always text-only or icon-only, never a filled background.

### Named Rules
**The Single Accent Rule.** Quiet Teal is the only color permitted to signal "this matters." If a
second saturated color appears anywhere outside the danger role, the system has drifted.

**The Resting-vs-Reacting Rule.** Surface Raised (`#242830`) is a *response*, not a *resting
state*. It appears only on `:active`/`:focus` of rows and inside input fields — never as a card's
default background.

## 3. Typography

**Body Font:** Nunito (with system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif fallback)

**Character:** A single rounded, friendly sans carried across four weights (400/600/700/800). No
display face, no serif contrast — the type system optimizes for short labels and numbers read at
arm's length, not for headlines.

### Hierarchy
- **Headline** (800, 24px, 1.5 line-height): the single largest text role in the app — a session's
  title when actively logging. Used once per screen, never for marketing-style emphasis.
- **Title** (700, 19px): header bar titles, the template-name input, the bottom-sheet title.
- **Body** (400–700, 17px): default body copy, all form inputs, primary button labels.
- **Label** (400–600, 15px): secondary/supporting text — list subtitles, dates, field hints,
  destructive text-buttons.
- **Caption** (600, 13px, uppercase, 0.04em tracking): tab bar labels and form section labels
  only. Reserved for short, structural labels — never body prose.

### Named Rules
**The Tabular Numbers Rule.** The root sets `font-variant-numeric: tabular-nums` globally. Weight
and rep digits must never cause horizontal jitter as they change — this is load-bearing for a UI
read mid-set with a barbell in hand.

**The No-Headline Rule.** There is no display/hero type role. The 24px Headline is the ceiling;
anything bigger would read as marketing, not logging.

## 4. Elevation

The system is flat by design — there is no shadow vocabulary anywhere in the codebase. Depth is
conveyed entirely through tonal layering (Charcoal → Panel → Surface Raised) and 1px hairline
borders. The one exception is the bottom-sheet scrim: a `rgba(0,0,0,0.5)` overlay behind the
exercise picker, which functions as a focus mechanism (push everything else back) rather than as
decorative elevation.

### Named Rules
**The Flat-By-Default Rule.** No `box-shadow` anywhere. If a component needs to feel "above" the
page, raise it with a lighter tone and a border, not a shadow.

## 5. Components

Buttons, inputs, and rows are quiet and efficient: a subtle tonal darken on press, no bounce, no
decorative motion. Feedback should be felt, not noticed.

### Buttons
- **Shape:** 14px radius on full-width/card-style buttons, fully circular (50%) on icon-only
  buttons (header icons, the stepper).
- **Primary** (Start workout, Finish workout): solid Quiet Teal fill, Ink text, 52px height —
  taller than the 44px minimum because it is the single most important tap on its screen.
- **Secondary** (empty-state CTAs like "Create a template"): Panel background, Hairline border,
  Quiet Teal text, 44px height.
- **Ghost / dashed** (Add exercise, Add item, New template): Panel background, **1px dashed
  Hairline border**, Quiet Teal text. Reserved exclusively for structural "add a new top-level
  thing" actions.
- **Danger text** (Discard workout, delete exercise/template): no fill, no border, Soft Coral text
  only. Used for every destructive action in the app, with no exceptions.
- **Hover/Focus/Active:** press states darken to Surface Raised (filled buttons keep their own
  fill and instead drop opacity slightly); focus-visible gets a 2px Quiet Teal outline.

### Named Rules
**The Weight-Matches-Frequency Rule.** Visual weight scales inversely with tap frequency. "Add a
set" — tapped many times per session — is a bare text link. "Add an exercise" or "New template" —
tapped rarely — gets the full dashed-bordered card. Never give a high-frequency action a
heavyweight affordance; it will feel like friction by the tenth set.

### Inputs / Fields
- **Style:** Surface Raised background, 1px Hairline border, 8px radius, 44px minimum height.
- **Focus:** border shifts to Quiet Teal with a 2px outline ring.
- **Placeholder:** Muted Slate at 0.7 opacity — used to show the *previous* session's value as a
  ghosted hint inside weight/reps fields, not just as a generic placeholder.

### List Rows / Cards
- **Corner Style:** 14px radius.
- **Background:** Panel at rest, Surface Raised on press — never a border-only or shadow-lifted
  card.
- **Border:** 1px Hairline, always present (this is a bordered-flat system, not a borderless or
  shadow-lifted one).
- **Internal Padding:** 16px.

### Navigation
- **Header:** sticky top, 56px, Charcoal background, Hairline bottom border, centered 19px/700
  title, circular 44px icon buttons on either side.
- **Tab Bar:** fixed bottom, 68px, Panel background, Hairline top border, icon-over-label items in
  Muted Slate at rest, Quiet Teal when active. The conditional in-progress tab is always rendered
  in Quiet Teal regardless of active state — it is always-actionable, not just selectable.

### Bottom Sheet (signature component)
The exercise picker is the one modal surface in the app: a `rgba(0,0,0,0.5)` scrim with a sheet
sliding up from the bottom, 14px radius on the top corners only, max 75vh height, search input at
top, scrollable list below. This is the template for any future "pick one thing from a list while
staying in context" interaction — never replace it with a full-page navigation for that job.

## 6. Do's and Don'ts

### Do:
- **Do** keep every tappable target at minimum 44px (`--tap-min`) — this is a UI used with tired
  or chalky hands between sets.
- **Do** use `font-variant-numeric: tabular-nums` for any new numeric display so digits don't
  jitter column alignment.
- **Do** reserve dashed borders exclusively for structural "add new" actions; keep high-frequency
  in-flow actions (like adding a set) as plain text links per the Weight-Matches-Frequency Rule.
- **Do** treat Surface Raised as a reaction to touch, never a resting background.
- **Do** keep Quiet Teal under roughly 10% of any given screen — it stays meaningful by staying
  rare.

### Don't:
- **Don't** add card-grid hero metrics, decorative charts, or "stats at a glance" tiles. This is a
  logger, not a generic SaaS dashboard — charts and per-exercise progress views are explicitly out
  of scope.
- **Don't** ship flat, undecorated rows with no hierarchy. Calm is not the same as undesigned —
  every row still gets radius, border, and weight.
- **Don't** add streaks, badges, leaderboards, or social-feed elements. Gamified fitness apps are
  the named anti-reference this product was built to avoid.
- **Don't** introduce a shadow anywhere. Depth comes from tone, never from `box-shadow`.
- **Don't** introduce a second saturated accent color alongside Quiet Teal.
- **Don't** use a `border-left`/`border-right` stripe as a colored accent on any card or row.
