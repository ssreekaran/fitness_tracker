# Variable Mapping for Navbar Components

The issue is that the Navbar components are referencing variables that don't exist globally. Here's the mapping needed:

## Variable Mapping

- `--text` → `--text-color`
- `--background` → `--background-color`
- `--background-secondary` → `--card-accent` (or `--dropdown-bg`)
- `--background-hover` → `--button-bg`
- `--text-muted` → `--text-color` with opacity
- `--primary-light` → `--hover-effect`
- `--transition` → `all 0.3s ease`

## Quick Fix Strategy

Instead of manually replacing each variable, I should:

1. Add the missing variables to the global scope temporarily
2. Or revert the Navbar scoping completely and use a different approach

The root cause is that I tried to scope Navbar variables but the Navbar is a global component that should use global variables.
