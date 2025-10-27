# @zoptal/ui

A comprehensive React UI component library for the Zoptal platform, built with Radix UI primitives, Tailwind CSS, and TypeScript.

## Features

- 🎨 **Design System**: Consistent design tokens and theming
- ♿ **Accessibility**: Built on Radix UI primitives for full accessibility support
- 🎯 **TypeScript**: Full type safety with comprehensive TypeScript definitions
- 🎭 **Variants**: Multiple variants and sizes for each component using class-variance-authority
- 🌙 **Dark Mode**: Built-in dark mode support
- 📱 **Responsive**: Mobile-first responsive design
- 🧩 **Composable**: Flexible component composition patterns

## Components

### Basic Components
- **Button** - Interactive buttons with loading states, icons, and variants
- **Input** - Form input fields with validation states
- **Card** - Container component for grouping content
- **Modal** - Dialog and modal overlays
- **Select** - Dropdown selection component
- **Label** - Form labeling with validation indicators
- **Textarea** - Multi-line text input with character counting

### Feedback Components
- **Toast** - Notification messages
- **Alert** - Contextual alert messages with icons
- **Badge** - Status indicators and labels
- **Skeleton** - Loading placeholder components
- **Spinner** - Loading indicators with overlay support
- **Tooltip** - Hover information display

### Navigation Components
- **Tabs** - Tab navigation with multiple variants
- **Dropdown Menu** - Context menus and action dropdowns
- **Navigation** - Navigation components
- **Separator** - Visual dividers and separators

### Layout Components
- **Layout** - Page layout components
- **Table** - Data table components
- **Form** - Form wrapper and utilities

## Installation

```bash
# Install the package
pnpm add @zoptal/ui

# Install peer dependencies
pnpm add react react-dom
```

## Usage

```tsx
import { Button, Alert, Badge, Tooltip } from '@zoptal/ui';

function App() {
  return (
    <div>
      <Alert variant="success" title="Success!">
        Your changes have been saved.
      </Alert>
      
      <Tooltip content="Click to save changes">
        <Button variant="default" size="lg">
          Save Changes
          <Badge variant="secondary">New</Badge>
        </Button>
      </Tooltip>
    </div>
  );
}
```

## Component Examples

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button loading>Loading...</Button>
```

### Alert Messages
```tsx
<Alert variant="default" title="Info">This is an info message.</Alert>
<Alert variant="success" title="Success">Operation completed successfully.</Alert>
<Alert variant="warning" title="Warning">Please review your input.</Alert>
<Alert variant="destructive" title="Error">Something went wrong.</Alert>
```

### Skeleton Loading
```tsx
<Skeleton variant="text" size="lg" />
<SkeletonCard />
<SkeletonAvatar size="lg" withText />
```

### Tabs Navigation
```tsx
<SimpleTabs
  defaultValue="tab1"
  items={[
    { value: 'tab1', label: 'Overview', content: <div>Overview content</div> },
    { value: 'tab2', label: 'Settings', content: <div>Settings content</div> },
    { value: 'tab3', label: 'Advanced', content: <div>Advanced content</div> },
  ]}
/>
```

## Styling

Components use Tailwind CSS with CSS variables for theming. Import the styles in your application:

```tsx
import '@zoptal/ui/styles';
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Contributing

Please refer to the main repository's contributing guidelines.

## License

MIT © Zoptal Team