# Design Document: Codebase Cleanup and Refactor

## Overview

This design outlines the approach for cleaning up and reorganizing the fitness tracker codebase. The cleanup will be performed in phases to minimize risk and ensure the application remains functional throughout the process. The design focuses on removing redundancy, improving organization, and establishing clear architectural boundaries.

## Architecture

### Current Structure Issues

1. **Flat component directory**: All components in a single folder without logical grouping
2. **Flat pages directory**: 30+ page files in a single directory
3. **Unused backend folder**: Complete backend directory with node_modules that isn't referenced
4. **Redundant documentation**: Multiple files documenting the same fixes/features
5. **Empty directories**: Unused folders like `src/components/analytics/`
6. **Orphaned files**: MobileLoginPage files not referenced in routing

### Target Structure

```
src/
├── components/
│   ├── common/              # Shared UI components
│   │   ├── LoadingSpinner/
│   │   ├── Footer/
│   │   └── ProtectedRoute/
│   ├── calculators/         # Calculator-specific components
│   │   └── CalculatorLayout/
│   ├── chatbots/           # Chatbot components
│   │   ├── FitnessChatbot/
│   │   └── NutritionChatbot/
│   ├── fitness/            # Fitness tracking components
│   │   ├── WorkoutTracker/
│   │   ├── WorkoutCalendarPlanner/
│   │   ├── GoalsManager/
│   │   ├── NotificationCenter/
│   │   └── AnalyticsDashboard/
│   ├── Navbar/             # Keep existing structure
│   └── __tests__/          # Component tests
├── pages/
│   ├── auth/               # Authentication pages
│   │   ├── LoginPage/
│   │   ├── SignUpPage/
│   │   └── ForgotPasswordPage/
│   ├── calculators/        # Calculator pages
│   │   ├── BMICalculator/
│   │   ├── BodyFatCalculator/
│   │   ├── TDEECalculator/
│   │   ├── MacroCalculator/
│   │   ├── WeightLossCalculator/
│   │   ├── HeartRateZoneCalculator/
│   │   └── OneRepMaxCalculator/
│   ├── fitness/            # Fitness pages
│   │   ├── PersonalFitness/
│   │   ├── WorkoutPlanner/
│   │   └── WorkoutRecommendations/
│   ├── nutrition/          # Nutrition pages
│   │   ├── CalorieTracker/
│   │   ├── FoodDatabase/
│   │   ├── HealthyFood/
│   │   └── DietRecommendations/
│   ├── legal/              # Legal pages
│   │   ├── TermsOfService/
│   │   └── PrivacyPolicy/
│   ├── Home/
│   ├── About/
│   ├── ContactUs/
│   ├── ProfilePage/
│   └── SettingsPage/
├── services/               # No changes needed
├── utils/                  # No changes needed
├── styles/                 # Centralized styles
└── __tests__/             # Integration tests

docs/
├── INDEX.md               # Updated index
├── setup/                 # Setup documentation
│   ├── FIREBASE_AUTH_SETUP.md
│   ├── CHROMATIC_SETUP.md
│   └── ANDROID_DEPLOYMENT.md
├── features/              # Feature documentation
│   ├── MOBILE_AUTH.md (consolidated)
│   ├── ENHANCED_GOALS_SYSTEM.md
│   └── INTELLIGENT_WORKOUT_PLANNING.md
├── guides/                # Development guides
│   ├── TESTING_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── CODEBASE_DOCUMENTATION.md
└── archive/               # Archived/outdated docs
    └── (old fix documents)
```

## Components and Interfaces

### File Movement Strategy

#### Phase 1: Remove Unused Files

- Delete `backend/` directory entirely
- Delete `src/components/analytics/` empty directory
- Delete `src/pages/MobileLoginPage.tsx` and `src/pages/MobileLoginPage.css`
- Remove MobileLoginPage route from `src/App.tsx`

#### Phase 2: Reorganize Components

- Create new component subdirectories
- Move components to appropriate folders with their CSS files
- Update component index exports
- Update all import statements

#### Phase 3: Reorganize Pages

- Create new page subdirectories
- Move pages to appropriate folders with their CSS files
- Update routing configuration in `src/App.tsx`
- Update all import statements

#### Phase 4: Consolidate Documentation

- Create documentation subdirectories
- Consolidate redundant docs
- Move files to appropriate categories
- Update INDEX.md

### Import Path Update Strategy

The design uses a systematic approach to update imports:

1. **Search and Replace**: Use regex patterns to find all imports
2. **Relative Path Calculation**: Maintain correct relative paths
3. **Barrel Exports**: Update index.ts files for cleaner imports
4. **Verification**: Run TypeScript compiler to catch missed imports

### Component Organization Principles

1. **Feature-based grouping**: Components grouped by domain (calculators, fitness, chatbots)
2. **Co-location**: CSS files stay with their components
3. **Shared components**: Common UI elements in dedicated folder
4. **Test proximity**: Tests remain close to implementation

## Data Models

No data model changes are required. This is purely a structural refactor.

## Error Handling

### Compilation Errors

- After each phase, run `npm run build` to verify no broken imports
- Use TypeScript compiler errors to identify missed references
- Fix any path issues before proceeding to next phase

### Test Failures

- Run test suite after each phase
- Update test imports and mocks as needed
- Ensure all tests pass before proceeding

### Rollback Strategy

- Use git commits after each successful phase
- If issues arise, rollback to previous commit
- Fix issues before re-attempting phase

## Testing Strategy

### Pre-Cleanup Verification

1. Run full test suite: `npm run test:all`
2. Verify build succeeds: `npm run build`
3. Document current test coverage baseline

### Phase Testing

After each phase:

1. Run TypeScript compiler: `tsc --noEmit`
2. Run unit tests: `npm run test`
3. Run integration tests: `npm run test:e2e`
4. Verify build: `npm run build`

### Post-Cleanup Verification

1. Full test suite must pass
2. Production build must succeed
3. Manual smoke test of key features:
   - Authentication flow
   - Calculator pages
   - Workout tracking
   - Navigation between pages

### Test File Updates

- Update imports in `src/components/__tests__/`
- Update imports in `src/utils/__tests__/`
- Update imports in `src/__tests__/integration/`
- Update mock paths in `src/mocks/handlers.ts`

## Implementation Phases

### Phase 1: Remove Unused Files (Low Risk)

**Goal**: Delete files that are not referenced anywhere

**Steps**:

1. Delete `backend/` directory
2. Delete `src/components/analytics/` directory
3. Delete `src/pages/MobileLoginPage.tsx`
4. Delete `src/pages/MobileLoginPage.css`
5. Remove MobileLoginPage route from App.tsx
6. Run tests and build

**Risk**: Low - these files are not imported anywhere

### Phase 2: Consolidate Documentation (No Risk)

**Goal**: Organize documentation for better discoverability

**Steps**:

1. Create `docs/setup/`, `docs/features/`, `docs/guides/`, `docs/archive/`
2. Consolidate mobile auth docs into single `MOBILE_AUTH.md`
3. Consolidate button fix docs into single document or archive
4. Move files to appropriate subdirectories
5. Update `docs/INDEX.md`

**Risk**: None - documentation doesn't affect code

### Phase 3: Reorganize Components (Medium Risk)

**Goal**: Group components by feature

**Steps**:

1. Create component subdirectories
2. Move components one at a time with their CSS
3. Update imports in moved components
4. Update imports in files that use moved components
5. Update component index exports
6. Run tests after each component move

**Risk**: Medium - requires updating many imports

### Phase 4: Reorganize Pages (High Risk)

**Goal**: Group pages by feature

**Steps**:

1. Create page subdirectories
2. Move pages one category at a time
3. Update routing in App.tsx
4. Update all imports
5. Run tests after each category

**Risk**: High - affects routing and many imports

## Migration Checklist

For each moved file:

- [ ] Create target directory if needed
- [ ] Move file and its CSS to new location
- [ ] Update imports within the moved file
- [ ] Search for all imports of the moved file
- [ ] Update all import statements
- [ ] Update routing if applicable
- [ ] Run TypeScript compiler
- [ ] Run tests
- [ ] Commit changes

## Rollback Plan

If critical issues arise:

1. Revert to last successful commit
2. Document the issue
3. Create a fix
4. Re-run the phase

## Success Criteria

1. All unused files removed
2. Components organized into logical folders
3. Pages organized into logical folders
4. Documentation consolidated and organized
5. All tests passing
6. Production build succeeds
7. No TypeScript errors
8. Application functions identically to before cleanup
