# GitHub Repository Setup Guide

This guide helps you configure your GitHub repository to work with the CI/CD pipeline and Docker image building.

## GitHub Container Registry (GHCR) Setup

### 1. Enable GitHub Packages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Features** section
4. Ensure **Packages** is checked/enabled

### 2. Configure Package Permissions

1. In your repository, go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### 3. Set Repository Secrets (Optional)

If you need custom secrets, go to **Settings** → **Secrets and variables** → **Actions**:

```
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://your-domain.com
```

## Package Visibility Settings

After your first successful Docker build:

1. Go to your GitHub profile → **Packages** tab
2. Find your `lpg-distributor-saas` package
3. Click on it
4. Go to **Package settings**
5. Set visibility:
   - **Private**: Only you can access (recommended for production)
   - **Public**: Anyone can pull the image

## Troubleshooting Common Issues

### "installation not allowed to Create organization package"

This error means GitHub Actions doesn't have permission to create packages. Fix it by:

1. **Check Repository Type**:
   - Personal repository: Should work automatically
   - Organization repository: Requires additional setup

2. **For Organization Repositories**:
   - Go to Organization **Settings** → **Actions** → **General**
   - Under **Workflow permissions**: Select **Read and write permissions**
   - Enable **Allow GitHub Actions to create and approve pull requests**

3. **Package Creation Permissions**:
   - Go to Organization **Settings** → **Member privileges**
   - Under **Package creation**: Allow members to create packages

### "denied: permission_denied" or "unauthorized"

1. **Verify GITHUB_TOKEN**:
   - The workflow uses `${{ secrets.GITHUB_TOKEN }}` automatically
   - This token is provided by GitHub Actions and should work by default

2. **Check Branch Protection**:
   - If you have branch protection rules, ensure they allow GitHub Actions

3. **Repository Permissions**:
   - Ensure the repository has the correct permissions set in Settings → Actions

### Build Fails with "secrets in build args" Warning

This is fixed in the updated Dockerfile, but if you see this:

1. **Don't pass secrets as build arguments**
2. **Use Docker BuildKit secrets** (already implemented)
3. **Set secrets as environment variables at runtime**, not build time

## Docker Image Usage

After successful build, you can pull your image:

```bash
# Pull latest
docker pull ghcr.io/your-username/lpg-distributor-saas:latest

# Pull specific branch
docker pull ghcr.io/your-username/lpg-distributor-saas:main

# Pull by commit SHA
docker pull ghcr.io/your-username/lpg-distributor-saas:main-abc1234
```

## Security Best Practices

### 1. Keep Images Private

- Production images should be private packages
- Only make public if you intentionally want to share

### 2. Use Minimal Secrets

- Don't include sensitive data in Docker images
- Use environment variables at runtime
- Use Docker secrets for sensitive runtime data

### 3. Regular Updates

- Keep base images updated
- Monitor for security vulnerabilities
- Use Dependabot for dependency updates

### 4. Access Control

- Limit who can push to main branch
- Require PR reviews for changes
- Use branch protection rules

## Monitoring and Maintenance

### 1. Check Package Size

- Monitor image sizes regularly
- Use multi-stage builds to minimize size
- Clean up old/unused package versions

### 2. Security Scanning

- The workflow includes Trivy security scanning
- Review security reports regularly
- Address high-severity vulnerabilities promptly

### 3. Build Performance

- Monitor build times
- Use build caching effectively
- Consider using self-hosted runners for faster builds

## Alternative: Docker Hub

If you prefer Docker Hub over GHCR, update the workflow:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: your-dockerhub-username/lpg-distributor-saas
```

Then add these secrets to your repository:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

## Support

If you continue having issues:

1. Check the **Actions** tab for detailed error logs
2. Verify all permissions are set correctly
3. Try the simplified `docker.yml` workflow first
4. Check GitHub status page for any service issues
