# Empty State Illustrations

Simple, flat, single-color line art SVG illustrations for empty states throughout the app.

## Design Principles

Following `design.md` guidelines:
- **Consistent style**: Simple line art using primary color palette
- **Small bundle size**: Vector SVG components (not raster images)
- **Crisp rendering**: Scales perfectly across all device sizes
- **Legible before beautiful**: Clear, simple shapes that communicate instantly

## Available Illustrations

### NoJobsIllustration
**Use case**: No job matches found
- Shows magnifying glass with "nothing found" indicator
- Default size: 120px
- Used in: `app/(tabs)/jobs.tsx`

### NoCertificationsIllustration
**Use case**: No certification data available for trade/country
- Shows certificate/document with ribbon seal and dashed empty lines
- Default size: 120px
- Used in: `app/(tabs)/certifications.tsx`

### NoInterviewPrepIllustration
**Use case**: No interview prep questions loaded
- Shows stack of cards with question mark
- Default size: 120px
- Used in: `app/(tabs)/prep.tsx`

### EmptyProfileIllustration
**Use case**: Profile not created or incomplete
- Shows profile card with person icon and empty fields
- Default size: 140px (slightly larger for impact)
- Used in: `app/profile/index.tsx`

### NoContentIllustration
**Use case**: Generic empty list or content area
- Shows empty box/container with three dots
- Default size: 120px
- Used in: Generic empty states

## Usage

### With EmptyState Component (Recommended)

```tsx
import EmptyState from '../../components/EmptyState';
import { NoJobsIllustration } from '../../components/illustrations';

<EmptyState
  illustration={<NoJobsIllustration size={120} color={colors.primary} />}
  title="No Jobs Found"
  description="We couldn't find any jobs matching your profile."
  actionLabel="Edit Profile"
  onActionPress={handleEditProfile}
/>
```

### Standalone

```tsx
import { NoJobsIllustration } from '../../components/illustrations';

<NoJobsIllustration 
  size={100} 
  color={colors.primary} 
/>
```

## Props

All illustration components accept:
- `size` (number, optional): Width and height in pixels. Default: 120
- `color` (string, optional): Stroke color for the illustration. Default: '#1E4D6B' (primary blue)

## Adding New Illustrations

1. Create a new file: `components/illustrations/YourIllustration.tsx`
2. Use the same structure as existing illustrations:
   - Import from 'react-native-svg'
   - Accept size and color props
   - Use simple paths, circles, and rectangles
   - Keep line strokes between 3-5px for consistency
   - Use opacity for secondary elements
3. Export from `index.ts`
4. Document in this README

## Best Practices

- **Keep it simple**: 3-5 basic shapes maximum
- **Use the theme color**: Pass `colors.primary` or `colors.secondary` from theme
- **Consistent sizing**: Default to 120px, use 140px only for high-impact screens
- **Accessibility**: Illustrations are decorative - ensure text conveys full meaning
- **Performance**: SVG renders efficiently on all devices, much better than PNG/JPG

## References

- Design principles: `/design.md` Section 6 (Component Library)
- Theme colors: `/constants/theme.ts`
- EmptyState component: `/components/EmptyState.tsx`
