# Empty State Illustrations - Quick Reference

## Import

```tsx
import EmptyState from '../../components/EmptyState';
import { 
  NoJobsIllustration,
  NoCertificationsIllustration,
  NoInterviewPrepIllustration,
  EmptyProfileIllustration,
  NoContentIllustration,
} from '../../components/illustrations';
import { useAppTheme } from '../../constants/theme';
```

## Basic Usage

```tsx
const { colors } = useAppTheme();

<EmptyState
  illustration={<NoJobsIllustration size={120} color={colors.primary} />}
  title="No Jobs Found"
  description="We couldn't find any jobs matching your profile."
/>
```

## With Action Button

```tsx
<EmptyState
  illustration={<EmptyProfileIllustration size={140} color={colors.primary} />}
  title="No Profile Found"
  description="Let's create your profile to get started."
  actionLabel="Get Started"
  onActionPress={handleGetStarted}
/>
```

## With Additional Content

```tsx
<EmptyState
  illustration={<NoJobsIllustration size={120} color={colors.primary} />}
  title="No Jobs Found"
  description="Try these suggestions:"
>
  <View style={styles.tipsList}>
    <Text>• Add more skills</Text>
    <Text>• Complete certifications</Text>
  </View>
</EmptyState>
```

## Illustration-Only (Advanced)

```tsx
<NoJobsIllustration 
  size={100} 
  color={colors.secondary} 
/>
```

## Available Illustrations

| Illustration | Use Case | Default Size |
|--------------|----------|--------------|
| `NoJobsIllustration` | Empty job matches | 120px |
| `NoCertificationsIllustration` | No cert data | 120px |
| `NoInterviewPrepIllustration` | No prep questions | 120px |
| `EmptyProfileIllustration` | No/incomplete profile | 140px |
| `NoContentIllustration` | Generic empty list | 120px |

## Props

### EmptyState Component
```tsx
interface EmptyStateProps {
  illustration: ReactNode;        // Required: SVG component
  title: string;                  // Required: Main heading
  description: string;            // Required: Explanation
  actionLabel?: string;           // Optional: Button text
  onActionPress?: () => void;     // Optional: Button handler
  children?: ReactNode;           // Optional: Extra content
}
```

### Illustration Components
```tsx
interface IllustrationProps {
  size?: number;     // Default: 120 (or 140 for profile)
  color?: string;    // Default: '#1E4D6B' (primary blue)
}
```

## Common Patterns

### Full-Screen Empty State
```tsx
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <EmptyState
    illustration={<NoContentIllustration color={colors.primary} />}
    title="Nothing Here"
    description="Content will appear here when available."
  />
</View>
```

### With Header Context
```tsx
<View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>Screen Title</Text>
  </View>
  
  <EmptyState
    illustration={<NoJobsIllustration color={colors.primary} />}
    title="No Items"
    description="Check back later for updates."
  />
</View>
```

### Conditional Rendering
```tsx
{items.length === 0 ? (
  <EmptyState
    illustration={<NoContentIllustration color={colors.primary} />}
    title="No Items"
    description="Add your first item to get started."
    actionLabel="Add Item"
    onActionPress={handleAdd}
  />
) : (
  <FlatList data={items} ... />
)}
```

## Theme Integration

```tsx
// Always use theme colors
const { colors } = useAppTheme();

// Primary color (default)
<NoJobsIllustration color={colors.primary} />

// Secondary color (for emphasis)
<NoJobsIllustration color={colors.secondary} />

// Success color (for positive empty states)
<NoJobsIllustration color={colors.success} />
```

## Size Guidelines

```tsx
// Inline/compact
<NoJobsIllustration size={80} />

// Standard (most cases)
<NoJobsIllustration size={120} />

// High impact (important screens)
<EmptyProfileIllustration size={140} />

// Hero/landing
<NoJobsIllustration size={160} />
```

## Complete Example

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import EmptyState from '../../components/EmptyState';
import { NoJobsIllustration } from '../../components/illustrations';
import { useAppTheme, Spacing } from '../../constants/theme';

export default function JobsScreen() {
  const { colors } = useAppTheme();
  const jobs = []; // Empty for demo

  if (jobs.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          illustration={<NoJobsIllustration size={120} color={colors.primary} />}
          title="No Jobs Found"
          description="We'll notify you when new jobs match your profile."
          actionLabel="Update Profile"
          onActionPress={() => router.push('/profile')}
        />
      </View>
    );
  }

  return (
    // ... render jobs
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});
```

## Troubleshooting

### Illustration not showing
- ✅ Check import path
- ✅ Verify react-native-svg is installed
- ✅ Check size prop (not 0)
- ✅ Verify color has alpha/opacity

### Colors not working
- ✅ Use theme colors: `colors.primary`
- ✅ Check hex format: `#1E4D6B`
- ✅ Verify theme provider wraps app

### Layout issues
- ✅ EmptyState uses flex: 1 internally
- ✅ Parent needs flex: 1 or height
- ✅ Check padding/margins on parent

## Testing Checklist

- [ ] Illustration renders at correct size
- [ ] Color matches theme
- [ ] Text is readable
- [ ] Action button works (if present)
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Scales on different screen sizes
- [ ] Screen reader announces text correctly

---

**Need help?** See `/components/illustrations/README.md` for detailed documentation.
