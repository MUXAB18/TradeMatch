# Empty State Illustrations - Visual Guide

## Design Language

All illustrations follow a consistent visual language:
- **Style**: Flat, single-color line art
- **Stroke width**: 3-5px for main elements, 2-3px for details
- **Color**: Themed (uses primary color from app theme)
- **Size**: 120px default (140px for high-impact screens)
- **Simplicity**: 3-5 basic shapes maximum

## Illustration Descriptions

### 1. NoJobsIllustration
```
     ╱╲
    │○ ○│  ← Magnifying glass lens with "nothing found" face
    │ ⌣ │
     ╲╱
      │    ← Handle
      │
```
**Visual elements:**
- Circular magnifying glass lens
- Angled handle (45° diagonal)
- Sad/neutral face inside lens (subtle, low opacity)
- Suggests "searching but finding nothing"

**Best for**: Empty search results, no job matches

---

### 2. NoCertificationsIllustration
```
┌─────────────┐
│ ─ ─ ─ ─ ─ ─ │  ← Certificate with dashed lines
│ ─ ─ ─ ─ ─   │     (indicates "empty/needs filling")
│ ─ ─ ─ ─ ─ ─ │
└─────────────┘
       ◯        ← Ribbon seal
      ╱ ╲       ← Ribbon tails
```
**Visual elements:**
- Rectangular certificate with rounded corners
- Dashed horizontal lines (not solid) to indicate "empty"
- Circular ribbon/seal at bottom center
- Two ribbon tails flowing down
- Clean, formal appearance

**Best for**: No certifications data, empty credentials list

---

### 3. NoInterviewPrepIllustration
```
  ┌─────┐
  │  ?  │  ← Front card with question mark
  │     │
  │─ ─ ─│  ← Dashed text lines
  └─────┘
 ┌─────┐    ← Middle card (faded)
┌─────┐     ← Back card (more faded)
```
**Visual elements:**
- Three stacked cards with offset/depth effect
- Back cards have reduced opacity (0.3, 0.5, 1.0)
- Front card shows large question mark
- Dashed lines at bottom suggest "no content yet"
- Suggests "deck of cards" metaphor

**Best for**: Empty flashcards, no quiz questions, no practice content

---

### 4. EmptyProfileIllustration
```
┌───────────────────┐
│   ◯    ─ ─ ─ ─ ─ │  ← Person icon + empty info lines
│  ╱│╲   ─ ─ ─ ─   │     (dashed indicates needs filling)
│ ▕ │ ▏  ─ ─ ─ ─ ─ │
│                   │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─│  ← Additional empty fields
│ ─ ─ ─ ─ ─ ─       │
└───────────────────┘
```
**Visual elements:**
- Large card/document shape with rounded corners
- Simple person icon (circle head + curved shoulders)
- Multiple dashed horizontal lines for empty fields
- Left side: person icon, Right side: info lines
- Bottom section: full-width empty lines

**Best for**: Incomplete profile, new user, empty form

---

### 5. NoContentIllustration
```
    ╱─────╲     ← Open lid/flap
   ╱       ╲
  ├─────────┤
  │         │   ← Empty container
  │  • • •  │   ← Three dots (empty indicator)
  └─────────┘
```
**Visual elements:**
- Box/container with open lid (perspective view)
- Empty interior
- Three dots in center (suggests "nothing here")
- Generic, neutral appearance
- Slight perspective for depth

**Best for**: Generic empty lists, no data, empty collections

---

## Color Usage

All illustrations use a single color (monochromatic):
- **Primary elements**: Full opacity (100%)
- **Secondary elements**: Reduced opacity (40-60%)
- **Background hints**: Very light opacity (30%)

**Theme Integration:**
```tsx
// Light mode - typically uses primary blue
<NoJobsIllustration color={colors.primary} />  // #1E4D6B

// Dark mode - same color, theme handles contrast
<NoJobsIllustration color={colors.primary} />  // Still works!

// Alternate colors for special cases
<NoJobsIllustration color={colors.secondary} />  // Amber highlight
```

## Size Guidelines

| Size | Use Case | Example |
|------|----------|---------|
| 80px | Small inline empty states | List item placeholders |
| 100px | Compact screens | Mobile portrait, tight spaces |
| **120px** | **Default** | Most empty states |
| 140px | High-impact screens | First-time user, critical flows |
| 160px+ | Hero/landing screens | Onboarding, major features |

## Accessibility Notes

1. **Decorative only**: Illustrations don't convey critical info alone
2. **Text required**: Always pair with descriptive text
3. **Color independent**: Meaning never relies on color alone
4. **Screen reader**: Illustrations are treated as decorative (`aria-hidden` equivalent)
5. **Sufficient contrast**: Works on light and dark backgrounds

## Technical Details

- **Format**: React Native SVG components
- **Viewport**: 120×120 viewBox
- **Scalable**: Vector, scales to any size without quality loss
- **Bundle impact**: ~1-2 KB per illustration (minified)
- **Dependencies**: `react-native-svg` (already installed)

## Customization Example

```tsx
// Standard usage
<NoJobsIllustration size={120} color={colors.primary} />

// Smaller size
<NoJobsIllustration size={80} color={colors.primary} />

// Alternate color
<NoJobsIllustration size={120} color={colors.secondary} />

// With theme
const { colors } = useAppTheme();
<NoJobsIllustration 
  size={120} 
  color={colors.primary} 
/>
```

## Animation Considerations

Currently static. If adding animations in future:
- Keep subtle (scale, fade, slight bounce)
- Avoid on low-end devices (use `useReducedMotion`)
- Don't rely on animation to convey meaning
- Max duration: 300-500ms

## Creating New Illustrations

When adding new illustrations:

1. **Sketch the concept**: 3-5 basic shapes
2. **Keep it simple**: If you can recognize it in 3 seconds, it's good
3. **Use existing patterns**: Study current illustrations
4. **Match stroke width**: 3-5px for consistency
5. **Test at different sizes**: 80px, 120px, 160px
6. **Test on both themes**: Light and dark mode
7. **Get feedback**: Does it communicate the concept clearly?

## Dos and Don'ts

### ✅ Do:
- Keep shapes simple and recognizable
- Use consistent stroke widths
- Test on both light/dark backgrounds
- Pair with clear text
- Make it scalable

### ❌ Don't:
- Use complex gradients or patterns
- Add too many details
- Rely on color to convey meaning
- Use raster images (PNG/JPG)
- Make it too large (bundle size)

---

**Remember**: "Legible before beautiful" (design.md principle)
The goal is instant recognition and clear communication, not artistic perfection.
