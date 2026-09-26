# Auto-Commit & Auto-Deploy Rule

1. **Automatic Git Push**:
   - Whenever any feature, bug fix, or code modification is finished and verified, automatically commit and push the changes to `main` on GitHub (`origin main`).
   - Do NOT ask the user for permission or wait for them to request a commit/push.

2. **Cloudflare Pages Deployment**:
   - Pushing to `origin main` automatically triggers the GitHub Actions workflow `.github/workflows/deploy-cloudflare-pages.yml` to build and deploy to Cloudflare Pages.
   - Always report the commit hash and deployment status in the summary of completed work.
