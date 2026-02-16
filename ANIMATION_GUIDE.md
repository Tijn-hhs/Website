# Sidebar Animation & Behavior Guide

## Animation Timeline

### Collapse Animation (300ms)

```
T=0ms          T=150ms        T=300ms
┌─────┐        ┌────┐         ┌──┐
│ ◄ │ │        │ ◄┐ │         │ │◄
│Text │        │Txt│         │  │
│ Items        │Item         │Ico
└─────┘        └────┘        └──┘
Width: 240px   Width: 160px  Width: 80px
(100%)         (67%)         (33%)

Opacity of Text Labels:
1.0 ────────────────► 0.5 ────────────► 0.0
```

### Expand Animation (300ms)

```
T=0ms          T=150ms        T=300ms
┌──┐            ┌────┐         ┌─────┐
│ │◄           │ ◄┐ │         │ ◄ │ │
│Ico           │Txt│         │Text │
│Con           │Item         │ Items
└──┘           └────┘        └─────┘
Width: 80px    Width: 160px   Width: 240px
(33%)          (67%)          (100%)

Opacity of Text Labels:
0.0 ────────────────► 0.5 ────────────► 1.0
```

## State Flow Diagram

```
User Clicks Toggle Button
         │
         ▼
isCollapsed: false  OR  true
         │
         ▼
   useEffect Hook
         │
         ▼
localStorage.setItem(
  'sidebarCollapsed',
  JSON.stringify(boolean)
)
         │
         ▼
Component Re-renders
         │
    ┌────┴────┐
    ▼         ▼
Sidebar   DashboardLayout
Updates   Updates
Styles    Margin
```

## CSS Transition Properties

### Sidebar Container
```css
transition-all duration-300 ease-in-out

/* Animates these properties: */
- width: 240px → 80px
- margin-left: dynamic
- visibility: maintained
```

### Text Labels
```css
transition-opacity duration-300 ease-in-out

/* Animates these properties: */
- opacity: 1 → 0 (collapse)
- opacity: 0 → 1 (expand)
```

### Main Content
```css
transition-all duration-300 ease-in-out

/* Animates these properties: */
- margin-left: 280px ↔ 104px
```

## Easing Function: ease-in-out

The `ease-in-out` timing function provides smooth acceleration and deceleration:

```
Speed
  │     ╭─────╮
  │    ╱       ╲
  │  ╱           ╲
  │╱───────────────╲
  └──────────────────► Time (300ms)

- Start: Accelerates quickly (ease-in)
- Middle: Maintains speed
- End: Decelerates smoothly (ease-out)
```

## Visual Feedback During Collapse

### Before Collapse
```
Sidebar visible with:
- Toggle button ◄ (pointing left, "collapse me")
- Logo image
- Full 11 menu items with icons + labels
- My Situation link with icon + label
- Home link with icon + label
```

### During Collapse Animation
```
0% - 50% of animation:
- Width reducing smoothly
- All elements scaling proportionally
- Text beginning to fade

50% - 100% of animation:
- Width continuing to reduce
- Text nearly invisible
- Icons remaining visible
- Toggle button rotates: ◄ → ►
```

### After Collapse
```
Sidebar visible with:
- Toggle button ► (pointing right, "expand me")
- Only 11 icon indicators
- Icons centered vertically
- My Situation icon only
- Home icon only
- Hover shows tooltip
```

## Responsive Behavior

### Large Screen (Desktop)
```
┌─ lg (1024px+) ─────────────────────────────────┐
│                                                  │
│ ┌─────┐  ┌───────────────────────────────────┐  │
│ │░░░░░│  │                                   │  │
│ │░░░░░│  │        Main Content Area          │  │
│ │░░░░░│  │                                   │  │
│ │░░░░░│  │     (margin-left: 280px or      │  │
│ │░░░░░│  │      margin-left: 104px)         │  │
│ │░░░░░│  │                                   │  │
│ │░░░░░│  │                                   │  │
│ └─────┘  └───────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘

Sidebar width: 240px or 80px
Margin left: 16px
Margin right: 16px
```

### Medium Screen (Tablet)
```
┌─ md (768px+) ──────────────────────┐
│                                     │
│ ┌─────┐  ┌──────────────────────┐  │
│ │░░░░░│  │                      │  │
│ │░░░░░│  │  Main Content Area   │  │
│ │░░░░░│  │  (scrollable if      │  │
│ │░░░░░│  │   needed)            │  │
│ │░░░░░│  │                      │  │
│ │░░░░░│  │                      │  │
│ │░░░░░│  └──────────────────────┘  │
│ └─────┘                             │
│                                     │
└─────────────────────────────────────┘

Same behavior as desktop
All features work identically
```

### Small Screen (Mobile < 768px)
```
┌─ sm ──────────────────┐
│ ┌──┐                  │
│ │  │                  │
│ │░░│  May want to     │
│ │░░│  auto-collapse   │
│ │░░│  for more        │
│ │░░│  space           │
│ │░░│  (optional)      │
│ │░░│                  │
│ │░░│                  │
│ │  │                  │
│ └──┘  [Main Content]  │
│                       │
└───────────────────────┘

Option: Auto-collapse on mobile init
Currently: Same as desktop
```

## Keyboard Navigation

### Tab Through Sidebar
```
User presses Tab
         │
         ▼
    Toggle Button
         │ (Tab)
         ▼
    Menu Item 1
         │ (Tab)
         ▼
    Menu Item 2
         │ (Tab)
         ▼
    ... 11 items ...
         │ (Tab)
         ▼
   My Situation Link
         │ (Tab)
         ▼
    Home Link
         │ (Tab)
         ▼
    Main Content (first focusable element)
```

### Focus Ring During Animation
- Focus ring remains visible during collapse/expand
- Ring size: 2px (`focus:ring-2`)
- Ring color: Blue (`focus:ring-blue-300`)
- Completes animation before releasing focus

## Enter/Click Behavior

### Click Toggle Button
```
Mouse Position: Over Toggle Button
Mouse Button: Down
         │
         ▼
   Button Active State
   (background color changes)
         │
         ▼
   Mouse Button: Up
         │
         ▼
   onClick Event Fires
         │
         ▼
   setIsCollapsed(!isCollapsed)
         │
         ▼
   State Updates
         │
         ▼
   Component Re-renders
         │
         ▼
   CSS Transitions Animate
```

## Accessibility During Animation

### Screen Reader Announcements
```
1. Initial load (expanded):
   "Navigation sidebar, Live Region"
   
2. User clicks toggle:
   "Button, Collapse sidebar, aria-expanded true"
   
3. After collapse completes:
   Screen reader may announce state change
   
4. Hover over item:
   "Title: [Full Menu Item Label]" (tooltip)
```

### Animation Preference Respect
**Optional Enhancement (not yet implemented):**
```tsx
// For users who prefer reduced motion:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Use duration-0 instead of duration-300
  // Instant collapse/expand instead of animated
}
```

## Debug Guide

### Check Animation Frame Rate
```javascript
// In browser DevTools console:
console.log('Animation Frame Rate:')
// Look for smooth 60 FPS during collapse
```

### Monitor State Changes
```javascript
// Add to localStorage watch:
setInterval(() => {
  console.log('Collapsed:', localStorage.getItem('sidebarCollapsed'))
}, 100)
```

### Visual Debugging
Enable in DevTools:
- Right-click → Inspect
- Elements tab → Ctrl+Shift+D (Show animations)
- Rendering → Paint flashing (check for repaints)
- Performance → Record animation

## Performance Metrics

### Animation Performance
- **Duration**: 300ms (perceptually smooth)
- **Frame Rate**: 60 FPS (GPU accelerated)
- **Paint Operations**: Minimal (only width/opacity change)
- **Layout Thrashing**: None (CSS-only animation)

### Browser Rendering Pipeline
```
JavaScript Event
         │
         ▼
    React setState
         │
         ▼
    DOM Update
         │
         ▼
    CSS Transition Begins
         │
         ▼
  ┌──────┴──────┐
  ▼             ▼
Paint          Composite
(if needed)    (GPU accelerated)
  │             │
  └──────┬──────┘
         ▼
    Display Updated
```

## Common Issues & Solutions

### Animation Stutters
**Solution**: Disable background applications, check GPU acceleration

### Animation Too Fast/Slow
**Solution**: Modify `duration-300` to `duration-200` or `duration-500`

### Opacity Doesn't Fade
**Solution**: Check `opacity` class is applied to text span

### Icons Shift Position
**Solution**: Ensure `flex-shrink-0` is on icon wrapper

### State Doesn't Persist
**Solution**: Check localStorage is enabled, clear cache, reload

---

**Animation Framework**: CSS Transitions (Tailwind)  
**Duration**: 300ms  
**Easing**: ease-in-out  
**Hardware Acceleration**: Enabled  
**Cross-browser**: Chrome, Firefox, Safari, Edge 88+
