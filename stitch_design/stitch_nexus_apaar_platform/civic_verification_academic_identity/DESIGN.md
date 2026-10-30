---
name: Civic Verification & Academic Identity
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad7f3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecff'
  surface-container-high: '#e8e5ff'
  surface-container-highest: '#e2e0fb'
  on-surface: '#1a1a2d'
  on-surface-variant: '#474650'
  inverse-surface: '#2f2e43'
  inverse-on-surface: '#f2efff'
  outline: '#787681'
  outline-variant: '#c8c5d2'
  surface-tint: '#59569c'
  primary: '#171258'
  on-primary: '#ffffff'
  primary-container: '#2d2a6e'
  on-primary-container: '#9794df'
  inverse-primary: '#c3c0ff'
  secondary: '#a53c00'
  on-secondary: '#ffffff'
  secondary-container: '#ff7433'
  on-secondary-container: '#612000'
  tertiary: '#00240c'
  on-tertiary: '#ffffff'
  tertiary-container: '#003c19'
  on-tertiary-container: '#54ad6b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#140e56'
  on-primary-fixed-variant: '#413e83'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb597'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7e2c00'
  tertiary-fixed: '#9bf7ad'
  tertiary-fixed-dim: '#80da93'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005225'
  background: '#fcf8ff'
  on-background: '#1a1a2d'
  surface-variant: '#e2e0fb'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 62px
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 26px
    fontWeight: '400'
    lineHeight: 32px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 35px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-medium:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  caption:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-trust, institutional digital environment built for national-scale educational and identity records. It strictly follows modern Indian e-governance standards characterized by authoritative clarity, procedural transparency, and universal accessibility across diverse linguistic and demographic groups.

The design movement is **Corporate / Modern (Government Institutional)**. It relies on a rigorous, conservative aesthetic: crisp borders, disciplined white space, purposeful informational density, zero frivolous gradients, zero glassmorphism, and minimal, near-flat depth. The UI communicates authenticity, sovereign permanence, and constitutional legitimacy. Visual hierarchy is achieved primarily through authoritative typography, precise tabular arrangements, and a disciplined institutional color scheme rather than decorative ornamentation.

## Colors

The palette balances administrative gravitas with accessible clarity. It uses a deep sovereign indigo as the primary structural tone, complemented by constitutional saffron and green accents used strictly for verification and action status cues.

- **Primary Canvas**: `#FFFFFF` with a subtle, non-distracting top-right peach wash (`#FFF6EE`) indicating national service warmth.
- **Structural Surfaces**: 
  - Header band: `#FBFAFF`
  - Horizontal navigation bar: `#EFEEFB`
  - Active navigation state: `#FFFFFF`
  - Lavender container fill: `#F0EEFC`
  - Selected menu / table selection: `#E2E0F5`
  - Interactive chip fill: `#E9E6FA` with border `#A39CD8`
- **Text & Content**:
  - Primary headings: `#2B2568`
  - Standard body text: `#1F1F33`
  - Secondary metadata & captions: `#6B6B7B`
  - On-primary contrast: `#FFFFFF`
- **Boundaries**:
  - Structural input/card border: `#B8B8C8`
  - Subdued partition divider: `#E3E1F0`
- **Semantic Badging & State Colors**:
  - Active: Text `#2D2A6E`, Background `#E9E6FA`
  - Approved / Verified: Text `#1B7A3E`, Background `#E4F4EA`
  - Under Verification: Text `#5A4FCF`, Background `#F0EEFC`
  - Pending Action: Text `#B26A00`, Background `#FFF3DC`
  - Rejected / Flagged: Text `#B3261E`, Background `#FCE8E6`

## Typography

Typography establishes an official, sovereign tone through a dual-typeface structure:
- **Headings (Noto Serif)**: Must remain strictly regular weight (`400`). Bold styles are prohibited for headings to preserve the dignified, gazette-like governmental aesthetic. All titles and headings are rendered in deep indigo (`#2B2568`).
- **Body & Functional UI (Noto Sans)**: Standard reading text is set at 16px with a generous 1.6 line height for legibility across varied screens and assistive readers. 
- **Devanagari Support**: All body, tabular, and heading metrics map 1:1 with `Noto Sans Devanagari` and `Noto Serif Devanagari` to guarantee parity in bilingual deployments.
- **Labels, Nav & Tables**: UI navigation links, table headers, and form action triggers use `Noto Sans` 16px at medium weight (`500`) to guarantee distinct interactive presence against the body text.

## Layout & Spacing

The layout is structured around an orderly 12-column responsive grid conforming strictly to standard desktop viewports (1280px to 1440px max-width container), reflowing to 8 columns on tablets and 4 columns on mobile devices.

- **Desktop (1024px+)**: Max container width of 1280px centered. 24px column gutters and 32px canvas margins.
- **Tablet (768px - 1023px)**: 16px gutters and 24px margins. Sub-navigation collapses into an accordion or horizontally scrolled band.
- **Mobile (<768px)**: 16px margins, 12px gutters. All multi-column forms collapse strictly into a single procedural vertical stack.
- **Rhythm**: Element padding adheres to a disciplined 4px/8px modular scale. Dense structural data blocks (tables, verification forms) utilize tight interior vertical spacing (`space-sm` to `space-md`), preventing layout bloat and keeping entire service flows within immediate user view.

## Elevation & Depth

This design system avoids drop shadows, exaggerated blurs, or skeuomorphic bevels. Elevation is achieved through structural color stacking and crisp 1px borders.

- **Flat Planes**: Base content cards sit directly on canvas surfaces with a solid 1px `#E3E1F0` border.
- **Elevated Modals & Popovers**: When an explicit layered overlay is required (e.g., OTP dialogs, verification drawer), the elevation is restricted to an ambient `0 2px 4px rgba(45, 42, 110, 0.08)`. Shadows must never exceed 3px total spread.
- **Surface Layering**: The UI achieves visual priority by nesting surfaces: white cards (`#FFFFFF`) mounted on the top-level body background, with interactive subsections embedded using lavender fills (`#F0EEFC`).

## Shapes

The geometric signature is conservative, uniform, and disciplined. A standard 8px corner radius (`roundedness: 2`) is applied uniformly across cards, modals, interactive buttons, and input fields. 

Full pill geometry (circular end caps) is strictly reserved for standalone status badges, filter chips, and the citizen-assist mascot floating action button. Sharp 0px corners are reserved exclusively for tabular data matrices, the horizontal master header, and the utility navigation bar.

## Components

### Buttons
- **Primary Button**: Solid fill `#2D2A6E`, 44px fixed height, 8px border radius, text set in white `#FFFFFF` (16px, weight 500). Hover state lightens slightly to `#3B378C`; active pressed state deepens to `#211F52`.
- **Secondary Button**: Crisp `#FFFFFF` background with a solid 1px `#2D2A6E` border and `#2D2A6E` text (16px, weight 500). Hover shifts background to `#EFEEFB`.
- **Tertiary / Utility Button**: Transparent background, text `#2D2A6E`, underline only on hover.

### Inputs & Form Controls
- **Text Inputs**: Height 44px, 8px radius, white fill, 1px `#B8B8C8` border. Label placed above in `#1F1F33` (14px, weight 500). Active focus state: 1.5px solid border `#2D2A6E` with no outer glow.
- **Checkboxes & Radios**: 20px dimension, 1.5px border `#B8B8C8`. Checked state fills `#2D2A6E` with white checkmark.

### Badges & Chips
- **Status Badges**: Padding 4px 12px, border-radius 9999px (full pill), text 12px weight 600.
  - Active: `#2D2A6E` text on `#E9E6FA`
  - Approved: `#1B7A3E` text on `#E4F4EA`
  - Under Verification: `#5A4FCF` text on `#F0EEFC`
  - Pending: `#B26A00` text on `#FFF3DC`
  - Rejected: `#B3261E` text on `#FCE8E6`
- **Filter Chips**: Height 32px, pill-shaped, fill `#E9E6FA`, border 1px solid `#A39CD8`, text `#2D2A6E` (14px, weight 500).

### Cards & Content Containers
- **Standard Card**: 8px radius, white `#FFFFFF` surface, 1px `#E3E1F0` perimeter border. Padding 24px.
- **Accent Highlight Card**: Lavender background `#F0EEFC`, 1px `#A39CD8` border, 8px radius.

### Tables & Data Grids
- **Header Row**: Background `#EFEEFB`, 16px medium text `#2D2A6E`, padding 12px 16px, bottom border 1px solid `#B8B8C8`.
- **Row Items**: Height 48px, background `#FFFFFF`, text `#1F1F33` (14px/16px), divider 1px `#E3E1F0`. Hover row: `#FBFAFF`. Selected row: `#E2E0F5`.

### Floating Chat / Citizen Support
- **Floating Action Button**: Pill-shaped container at bottom-right, fill `#2D2A6E`, containing official citizen assistance mascot and white label text. Elevation limited to `0 3px 6px rgba(45, 42, 110, 0.16)`.