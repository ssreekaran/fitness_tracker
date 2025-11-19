# CSS Variable Conflicts - Fixed

## Problem

Multiple CSS files were redefining global CSS variables in `:root` selectors, causing formatting conflicts when navigating between pages. When you visited one page and then another, the global variables from the first page would persist and interfere with the styling of the second page.

## Root Cause

The following files were improperly defining global variables:

1. **PersonalFitness.css** - Redefined `--card-bg`, `--border-color`, `--input-bg`, etc.
2. **SignUpPage.css** - Redefined `--card-bg`, `--text-color`, `--input-bg`, etc.
3. **ContactUs.css** - Redefined `--text-secondary`, `--contact-primary`, etc.
4. **MacroCalculator.css** - Redefined `--protein-color`, `--carbs-color`, `--fat-color`
5. **CalorieTracker.css** - Redefined `--card-bg`, `--border-color`, `--input-bg`
6. **BMICalculator.css** - Redefined multiple global variables
7. **Navbar/styles.css** - Redefined `--primary`, `--background`, `--text`, etc.

## Solution Applied

### 1. Scoped Variables to Components

Instead of using `:root` selectors, variables are now scoped to their respective component containers:

**Before:**

```css
:root {
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
}
```

**After:**

```css
.personal-fitness-container {
  --pf-card-bg: #ffffff;
  --pf-border-color: #e0e0e0;
}
```

### 2. Prefixed Variable Names

All component-specific variables now have prefixes to avoid naming conflicts:

- PersonalFitness: `--pf-*` (e.g., `--pf-card-bg`)
- MacroCalculator: `--macro-*` (e.g., `--macro-protein-color`)
- CalorieTracker: `--ct-*` (e.g., `--ct-card-bg`)
- BMICalculator: `--bmi-*` (e.g., `--bmi-primary`)
- ContactUs: `--contact-*` (e.g., `--contact-primary`)
- Navbar: `--navbar-*` (e.g., `--navbar-primary`)

### 3. Updated Dark Mode Selectors

Dark mode overrides are now properly scoped:

**Before:**

```css
:root.dark {
  --card-bg: #2d2d2d;
}
```

**After:**

```css
:root.dark .personal-fitness-container {
  --pf-card-bg: #2d2d2d;
}
```

## Files Modified

1. `src/pages/PersonalFitness.css` - Scoped all variables with `--pf-` prefix
2. `src/pages/SignUpPage.css` - Removed global variable redefinitions
3. `src/pages/ContactUs.css` - Scoped variables with `--contact-` prefix
4. `src/pages/MacroCalculator.css` - Scoped variables with `--macro-` prefix
5. `src/pages/CalorieTracker.css` - Scoped variables with `--ct-` prefix
6. `src/pages/BMICalculator.css` - Scoped variables with `--bmi-` prefix
7. `src/components/Navbar/styles.css` - Scoped variables with `--navbar-` prefix

## Result

- No more CSS variable conflicts between pages
- Each component maintains its own styling scope
- Global variables in `App.css` remain untouched and work as intended
- Dark mode transitions work properly across all pages
- Page navigation no longer causes formatting issues

## Global Variables Preserved

The main global variables in `App.css` are preserved and continue to work:

- `--background-color`
- `--text-color`
- `--primary-color`
- `--link-color`
- `--card-bg` (main app card background)
- `--border-color` (main app border color)
- And all other app-wide theme variables

These changes ensure that each page maintains its unique styling while preventing conflicts with other pages.
