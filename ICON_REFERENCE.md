# Sidebar Icon Reference

## Icon Mappings

All icons are from **Lucide React** (https://lucide.dev/)

### Navigation Items

| Menu Item | Icon Name | Lucide Import | Size | Use Case |
|-----------|-----------|---------------|------|----------|
| University Application | `<GraduationCap />` | `GraduationCap` | 20px | Education/Academic |
| Student Visa | `<FileText />` | `FileText` | 20px | Document/Visa |
| Before Departure | `<Plane />` | `Plane` | 20px | Travel |
| Immigration & Registration | `<ClipboardList />` | `ClipboardList` | 20px | Forms/Documents |
| Arrival & First Days | `<MapPin />` | `MapPin` | 20px | Location |
| Housing | `<Home />` | `Home` | 20px | Accommodation |
| Legal, Banking & Insurance | `<Shield />` | `Shield` | 20px | Protection/Security |
| Healthcare | `<Heart />` | `Heart` | 20px | Medical |
| Information Centre | `<HelpCircle />` | `HelpCircle` | 20px | Help/Support |
| Daily Life | `<Coffee />` | `Coffee` | 20px | Leisure/Social |
| Cost of Living | `<DollarSign />` | `DollarSign` | 20px | Finance/Money |
| My Situation | `<User />` | `User` | 20px | Profile |
| Home | `<Home />` | `Home` | 20px | Return to Home |

## Current Implementation

### Sidebar.tsx - Icon Imports
```tsx
import {
  GraduationCap,
  FileText,
  Plane,
  ClipboardList,
  MapPin,
  Home,
  Shield,
  Heart,
  HelpCircle,
  Coffee,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
```

### Icon Usage in Navigation
```tsx
const navItems = [
  {
    label: 'University Application',
    path: '/dashboard/university-application',
    icon: <GraduationCap size={20} className="flex-shrink-0" />,
  },
  // ... more items
]
```

## Styling Icon Elements

### Icon Wrapper Classes
- **Size**: `size={20}` (20px × 20px)
- **Flex**: `className="flex-shrink-0"` (prevents icon shrinking)
- **Color**: Inherits from text color (same as label)
- **Active State**: Blue color when parent link is active
- **Hover State**: Changes color on hover with parent

### Icon Rendering
```tsx
<span className="flex-shrink-0">{item.icon}</span>
```

- Icons are wrapped in `<span>` with flex class
- Positioned in left column of menu item flex layout
- Centers vertically with `flex items-center`
- Gap between icon and label: `gap-3`

## Changing Icons

### Step 1: Find New Icon
Visit https://lucide.dev/ and search for desired icon

### Step 2: Import Icon
Add to imports in `Sidebar.tsx`:
```tsx
import { NewIconName } from 'lucide-react'
```

### Step 3: Update Navigation Item
```tsx
{
  label: 'Example Item',
  path: '/example',
  icon: <NewIconName size={20} className="flex-shrink-0" />,
}
```

### Example: Change Student Visa to Passport
```tsx
import { Passport } from 'lucide-react'

// In navItems:
{
  label: 'Student Visa',
  path: '/dashboard/student-visa',
  icon: <Passport size={20} className="flex-shrink-0" />,
}
```

## Icon Behavior

### Expanded State (240px width)
- Icon visible: ✓
- Icon size: 20px
- Icon color: Inherited from text
- Label visible: ✓
- Icon gaps label by 12px (`ml-3` on label)

### Collapsed State (80px width)
- Icon visible: ✓
- Icon size: 20px
- Icon centered: ✓
- Icon color: Inherited from text
- Label hidden: ✓
- Hover shows tooltip with full label

## Alternative Icon Sets

If you want to switch icon libraries:

### React Icons (https://react-icons.github.io/react-icons/)
```tsx
import { GiGraduationCap } from 'react-icons/gi'
import { AiOutlineFile } from 'react-icons/ai'
import { FaPlane } from 'react-icons/fa'
```

### Heroicons (https://heroicons.com/)
```tsx
import { AcademicCapIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
```

### Bootstrap Icons (https://icons.getbootstrap.com/)
```tsx
import { PersonCircle, Alarm } from 'react-bootstrap-icons'
```

## Performance Notes

- **Bundle Size**: Lucide React is tree-shakeable
- **rendering**: Only imported icons are bundled
- **Icon Count**: 13 icons in current setup
- **File Size Impact**: ~5-10KB additional gzip

## Accessibility

### Icon Accessibility
- Icons have `aria-hidden="true"` (implicit in implementation)
- Icon-only items have `title` attribute on hover
- Labels provided via `aria-label` on links
- Screen readers announce link text, not icon

### Current Title Attribute Example
```tsx
title={isCollapsed ? item.label : undefined}
```
- Shows full label tooltip when collapsed
- Hidden when expanded (label already visible)

## Color Inheritance

Icons inherit color from parent link:

### Active State
- Parent: `text-slate-900`
- Icon: Inherits `text-slate-900`
- Result: Dark slate icon

### Hover State
- Parent: `hover:text-slate-900`
- Icon: Inherits on hover
- Result: Dark slate icon on hover

### Default State
- Parent: `text-slate-600`
- Icon: Inherits `text-slate-600`
- Result: Medium gray icon

---

**Last Updated**: February 15, 2026  
**Library Version**: lucide-react (latest)
