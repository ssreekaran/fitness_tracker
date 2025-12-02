# Implementation Plan: Codebase Cleanup and Refactor

## Task List

- [x] 1. Pre-cleanup verification and baseline

  - Run full test suite to establish baseline
  - Verify production build succeeds
  - Create git checkpoint before starting cleanup
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Phase 1: Remove unused backend directory

  - Delete the entire `backend/` directory and all its contents
  - Verify no references to backend in main codebase
  - Run build to confirm no broken dependencies
  - _Requirements: 1.1_

- [x] 3. Phase 1: Remove empty and unused directories

  - Delete `src/components/analytics/` empty directory
  - Verify no imports reference this directory
  - _Requirements: 1.2_

- [x] 4. Phase 1: Remove unused MobileLoginPage files

  - Delete `src/pages/MobileLoginPage.tsx`
  - Delete `src/pages/MobileLoginPage.css`
  - Remove MobileLoginPage route from `src/App.tsx`
  - Search codebase for any remaining references
  - Run TypeScript compiler to verify no broken imports
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 5. Phase 1: Verify removal phase

  - Run full test suite
  - Run production build
  - Commit changes with message "Phase 1: Remove unused files"
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Phase 2: Create documentation directory structure

  - Create `docs/setup/` directory
  - Create `docs/features/` directory
  - Create `docs/guides/` directory
  - Create `docs/archive/` directory
  - _Requirements: 2.4_

- [x] 7. Phase 2: Consolidate mobile authentication documentation

  - Create consolidated `docs/features/MOBILE_AUTH.md` file
  - Merge content from MOBILE_AUTH_FIX.md, MOBILE_AUTH_FINAL_FIX.md, MOBILE_AUTH_ULTIMATE_FIX.md, and MOBILE_AUTH_FLOW.md
  - Delete the four original mobile auth documentation files
  - _Requirements: 2.1_

- [x] 8. Phase 2: Consolidate button fix documentation

  - Create consolidated document or move to archive
  - Merge content from ABOUT_PAGE_BUTTON_FIXES.md, BUTTON_DEBUGGING_GUIDE.md, and BUTTON_FIXES_SUMMARY.md
  - Delete original button fix documentation files
  - _Requirements: 2.2_

- [x] 9. Phase 2: Archive completed migration and fix documents

  - Move AI_PLANNER_MIGRATION_COMPLETE.md to archive
  - Move CRITICAL_FIXES_APPLIED.md to archive
  - Move CSS_VARIABLE_FIXES.md to archive
  - Move FIREBASE_DOMAIN_FIX.md to archive
  - Move fix_navbar_variables.md to archive
  - Move GOALS_SYSTEM_COMPLETION.md to archive or consolidate with ENHANCED_GOALS_SYSTEM.md
  - _Requirements: 2.3_

- [x] 10. Phase 2: Organize remaining documentation

  - Move FIREBASE_AUTH_SETUP.md to docs/setup/
  - Move CHROMATIC_SETUP.md to docs/setup/
  - Move ANDROID_DEPLOYMENT.md to docs/setup/
  - Move TESTING_GUIDE.md to docs/guides/
  - Move DEPLOYMENT.md to docs/guides/
  - Move CODEBASE_DOCUMENTATION.md to docs/guides/
  - Keep feature docs in docs/features/
  - _Requirements: 2.5_

- [x] 11. Phase 2: Update documentation index

  - Update `docs/INDEX.md` to reflect new structure
  - Add links to all documentation in organized categories
  - Add brief descriptions for each document
  - _Requirements: 2.4_

- [x] 12. Phase 2: Commit documentation changes

  - Commit with message "Phase 2: Consolidate and organize documentation"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 13. Phase 3: Create component subdirectories

  - Create `src/components/common/` directory
  - Create `src/components/calculators/` directory
  - Create `src/components/chatbots/` directory
  - Create `src/components/fitness/` directory
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 14. Phase 3: Move common components

- [x] 14.1 Move LoadingSpinner component and CSS to common/

  - Move `src/components/LoadingSpinner.tsx` to `src/components/common/LoadingSpinner.tsx`
  - Move `src/components/LoadingSpinner.css` to `src/components/common/LoadingSpinner.css`
  - Update imports in LoadingSpinner.tsx
  - Search and update all files importing LoadingSpinner
  - _Requirements: 3.5, 6.1_

- [x] 14.2 Move Footer component and CSS to common/

  - Move Footer.tsx and Footer.css to common/
  - Update imports within Footer component
  - Update all files importing Footer
  - _Requirements: 3.5, 6.1_

- [x] 14.3 Move ProtectedRoute to common/

  - Move ProtectedRoute.tsx to common/
  - Update all files importing ProtectedRoute
  - _Requirements: 3.5, 6.1_

- [x] 15. Phase 3: Move calculator components

  - Move CalculatorLayout.tsx to calculators/
  - Update all files importing CalculatorLayout
  - Run TypeScript compiler to verify
  - _Requirements: 3.1, 3.5, 6.1_

- [x] 16. Phase 3: Move chatbot components

- [x] 16.1 Move FitnessChatbot to chatbots/

  - Move FitnessChatbot.tsx and FitnessChatbot.css to chatbots/
  - Update imports within FitnessChatbot
  - Update all files importing FitnessChatbot
  - _Requirements: 3.2, 3.5, 6.1_

- [x] 16.2 Move NutritionChatbot to chatbots/

  - Move NutritionChatbot.tsx and NutritionChatbot.css to chatbots/
  - Update imports within NutritionChatbot
  - Update all files importing NutritionChatbot
  - _Requirements: 3.2, 3.5, 6.1_

- [x] 17. Phase 3: Move fitness components

- [x] 17.1 Move WorkoutTracker to fitness/

  - Move WorkoutTracker.tsx and WorkoutTracker.css to fitness/
  - Update imports within WorkoutTracker
  - Update all files importing WorkoutTracker
  - _Requirements: 3.3, 3.5, 6.1_

- [x] 17.2 Move WorkoutCalendarPlanner to fitness/

  - Move WorkoutCalendarPlanner.tsx and WorkoutCalendarPlanner.css to fitness/
  - Update imports within component
  - Update all files importing WorkoutCalendarPlanner
  - _Requirements: 3.3, 3.5, 6.1_

- [x] 17.3 Move GoalsManager to fitness/

  - Move GoalsManager.tsx, GoalsManager.css, and GoalsManager.stories.tsx to fitness/
  - Update imports within GoalsManager files
  - Update all files importing GoalsManager
  - _Requirements: 3.3, 3.5, 6.1_

- [x] 17.4 Move NotificationCenter to fitness/

  - Move NotificationCenter.tsx and NotificationCenter.css to fitness/
  - Update imports within NotificationCenter
  - Update all files importing NotificationCenter
  - _Requirements: 3.3, 3.5, 6.1_

- [x] 17.5 Move AnalyticsDashboard to fitness/

  - Move AnalyticsDashboard.tsx and AnalyticsDashboard.css to fitness/
  - Update imports within AnalyticsDashboard
  - Update all files importing AnalyticsDashboard
  - Update test imports in `src/components/__tests__/AnalyticsDashboard.test.tsx`
  - _Requirements: 3.3, 3.5, 6.1, 6.4_

- [x] 18. Phase 3: Update component index exports

  - Update `src/components/index.ts` to export from new locations
  - Add barrel exports in subdirectories if beneficial
  - _Requirements: 3.5, 6.1_

- [x] 19. Phase 3: Update component test imports

  - Update imports in `src/components/__tests__/GoalsManager.test.tsx`
  - Update imports in `src/components/__tests__/WorkoutTracker.test.tsx`
  - Update imports in `src/components/__tests__/AnalyticsDashboard.test.tsx`
  - _Requirements: 6.4_

- [x] 20. Phase 3: Verify component reorganization

  - Run TypeScript compiler
  - Run full test suite
  - Run production build
  - Commit changes with message "Phase 3: Reorganize components by feature"
  - _Requirements: 6.5, 7.1, 7.2, 7.3_

- [x] 21. Phase 4: Create page subdirectories

  - Create `src/pages/auth/` directory
  - Create `src/pages/calculators/` directory
  - Create `src/pages/fitness/` directory
  - Create `src/pages/nutrition/` directory
  - Create `src/pages/legal/` directory
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 22. Phase 4: Move authentication pages

- [x] 22.1 Move LoginPage to auth/

  - Move LoginPage.tsx and LoginPage.css to auth/
  - Update imports within LoginPage
  - Update route in App.tsx
  - Update all files importing LoginPage
  - _Requirements: 4.2, 4.5, 4.6, 6.2_

- [x] 22.2 Move SignUpPage to auth/

  - Move SignUpPage.tsx and SignUpPage.css to auth/
  - Update imports within SignUpPage
  - Update route in App.tsx
  - Update all files importing SignUpPage
  - _Requirements: 4.2, 4.5, 4.6, 6.2_

- [x] 22.3 Move ForgotPasswordPage to auth/

  - Move ForgotPasswordPage.tsx and ForgotPasswordPage.css to auth/
  - Update imports within ForgotPasswordPage
  - Update route in App.tsx
  - _Requirements: 4.2, 4.5, 4.6, 6.2_

- [x] 23. Phase 4: Move calculator pages

- [x] 23.1 Move BMICalculator to calculators/

  - Move BMICalculator.tsx and BMICalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.2 Move BodyFatCalculator to calculators/

  - Move BodyFatCalculator.tsx and BodyFatCalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.3 Move TDEECalculator to calculators/

  - Move TDEECalculator.tsx and TDEECalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.4 Move MacroCalculator to calculators/

  - Move MacroCalculator.tsx and MacroCalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.5 Move WeightLossCalculator to calculators/

  - Move WeightLossCalculator.tsx and WeightLossCalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.6 Move HeartRateZoneCalculator to calculators/

  - Move HeartRateZoneCalculator.tsx and HeartRateZoneCalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 23.7 Move OneRepMaxCalculator to calculators/

  - Move OneRepMaxCalculator.tsx and OneRepMaxCalculator.css to calculators/
  - Update route in App.tsx
  - _Requirements: 4.1, 4.5, 4.6, 6.2_

- [x] 24. Phase 4: Move fitness pages

- [x] 24.1 Move PersonalFitness to fitness/

  - Move PersonalFitness.tsx and PersonalFitness.css to fitness/
  - Update route in App.tsx
  - _Requirements: 4.4, 4.5, 4.6, 6.2_

- [x] 24.2 Move WorkoutPlanner to fitness/

  - Move WorkoutPlanner.tsx and WorkoutPlanner.css to fitness/
  - Update route in App.tsx
  - _Requirements: 4.4, 4.5, 4.6, 6.2_

- [x] 24.3 Move WorkoutRecommendations to fitness/

  - Move WorkoutRecommendations.tsx and WorkoutRecommendations.css to fitness/
  - Update route in App.tsx
  - _Requirements: 4.4, 4.5, 4.6, 6.2_

- [ ] 25. Phase 4: Move nutrition pages
- [ ] 25.1 Move CalorieTracker to nutrition/

  - Move CalorieTracker.tsx and CalorieTracker.css to nutrition/
  - Update route in App.tsx
  - _Requirements: 4.5, 4.6, 6.2_

- [ ] 25.2 Move FoodDatabase to nutrition/

  - Move FoodDatabase.tsx and FoodDatabase.css to nutrition/
  - Update route in App.tsx
  - _Requirements: 4.5, 4.6, 6.2_

- [ ] 25.3 Move HealthyFood to nutrition/

  - Move HealthyFood.tsx and HealthyFood.css to nutrition/
  - Update route in App.tsx
  - _Requirements: 4.5, 4.6, 6.2_

- [ ] 25.4 Move DietRecommendations to nutrition/

  - Move DietRecommendations.tsx and DietRecommendations.css to nutrition/
  - Update route in App.tsx
  - _Requirements: 4.5, 4.6, 6.2_

- [ ] 26. Phase 4: Move legal pages
- [ ] 26.1 Move TermsOfService to legal/

  - Move TermsOfService.tsx to legal/
  - Update route in App.tsx
  - _Requirements: 4.3, 4.5, 4.6, 6.2_

- [ ] 26.2 Move PrivacyPolicy to legal/

  - Move PrivacyPolicy.tsx to legal/
  - Update route in App.tsx
  - Update LegalPages.css location or keep shared
  - _Requirements: 4.3, 4.5, 4.6, 6.2_

- [ ] 27. Phase 4: Update integration test imports

  - Update imports in `src/__tests__/integration/workout-flow.test.tsx`
  - Update any other integration test imports
  - _Requirements: 6.4_

- [ ] 28. Phase 4: Verify page reorganization

  - Run TypeScript compiler
  - Run full test suite
  - Run production build
  - Manually test navigation to key pages
  - Commit changes with message "Phase 4: Reorganize pages by feature"
  - _Requirements: 6.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 29. Final verification and cleanup
  - Run full test suite one final time
  - Run production build
  - Verify all routes work correctly
  - Check for any remaining TODO comments or cleanup needed
  - Update README.md project structure section if needed
  - Create final commit with message "Complete codebase cleanup and refactor"
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
