# Chromatic Visual Regression Testing Setup

Chromatic provides automated visual regression testing for your Storybook components. It's currently optional in this project.

## Current Status

- ⚠️ **Not configured** - Visual regression tests are skipped
- ✅ **Storybook builds successfully** - Ready for Chromatic integration

## How to Enable Chromatic

### 1. Sign Up for Chromatic

1. Go to [chromatic.com](https://www.chromatic.com/)
2. Sign up with your GitHub account
3. Create a new project

### 2. Get Your Project Token

1. In your Chromatic project dashboard
2. Go to "Manage" → "Configure"
3. Copy your project token

### 3. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Your project token from step 2

### 4. Test the Setup

Once configured, the visual regression tests will run automatically on:

- Push to main/develop branches
- Pull requests (from the same repository)

## Benefits of Chromatic

- 🔍 **Visual regression detection** - Catch UI changes automatically
- 📱 **Cross-browser testing** - Test on multiple browsers and devices
- 👥 **Team collaboration** - Review visual changes together
- 🚀 **CI/CD integration** - Automated testing in your workflow

## Local Usage

After setup, you can also run Chromatic locally:

```bash
npx chromatic --project-token=YOUR_TOKEN
```

## Troubleshooting

- If tests fail due to missing token, they'll be skipped automatically
- Visual regression job only runs on main repository (not forks)
- Check GitHub Actions logs for detailed error messages

For more information, visit the [Chromatic documentation](https://www.chromatic.com/docs/).
