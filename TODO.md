# TODO: Flask Migration Steps

## Local Testing
- [ ] Run `docker-compose up` to test the Flask application locally
- [ ] Verify all pages load correctly at http://localhost:5000
- [ ] Check that math equations render properly with MathJax
- [ ] Test interactive demos (cellular automata, physics simulations, etc.)
- [ ] Ensure all static files (images, JS, CSS) are served correctly

## Fly.io Setup
- [ ] Install flyctl: `curl -L https://fly.io/install.sh | sh`
- [ ] Login to fly.io: `flyctl auth login`
- [ ] Create the app: `flyctl apps create mathnotes`
- [ ] Get your API token: `flyctl auth token`
- [ ] Add the token to GitHub secrets as `FLY_API_TOKEN`

## GitHub Configuration
- [ ] Go to repository Settings > Secrets and variables > Actions
- [ ] Add new repository secret named `FLY_API_TOKEN` with the token from above
- [ ] Ensure GitHub Actions is enabled for the repository

## Deployment
- [ ] Commit all new files to git
- [ ] Push to the main branch to trigger the CI/CD pipeline
- [ ] Monitor the GitHub Actions workflow for successful build
- [ ] Verify deployment at https://mathnotes.fly.dev

## Post-Deployment
- [ ] Update DNS records if using a custom domain
- [ ] Remove GitHub Pages configuration if no longer needed
- [ ] Update any external links pointing to the old GitHub Pages URL
- [ ] Test the production site thoroughly

## Optional Enhancements
- [ ] Add environment variables for configuration
- [ ] Set up monitoring/logging on fly.io
- [ ] Configure custom domain in fly.toml
- [ ] Add caching headers for static files
- [ ] Implement search functionality