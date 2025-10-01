# Deployment Guide

This Bond Return Calculator is a static React application that can be deployed to various hosting platforms.

## Build the Application

```bash
npm install
npm run build
```

The built files will be in the `dist/` directory.

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Or connect your GitHub repository to Vercel for automatic deployments.

Configuration file: `vercel.json` (already included)

### 2. Netlify

#### Option A: Drag and Drop
1. Build the project locally: `npm run build`
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

#### Option B: Git Integration
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

Configuration files: `netlify.toml` and `_redirects` (already included)

### 3. GitHub Pages

1. Enable GitHub Pages in your repository settings
2. The workflow in `.github/workflows/deploy.yml` will automatically deploy on push to main branch
3. Your site will be available at `https://yourusername.github.io/repository-name`

### 4. Other Static Hosts

The application can be deployed to any static hosting service:
- AWS S3 + CloudFront
- Firebase Hosting
- Surge.sh
- Any web server that can serve static files

Just upload the contents of the `dist/` folder after building.

## Environment Requirements

- Node.js 18 or higher
- No server-side dependencies
- No environment variables required
- All calculations run client-side

## Performance Features

- Optimized bundle splitting
- Asset caching headers
- Minified JavaScript and CSS
- Tree shaking enabled
- Modern browser targeting (ES2020)

## Security Headers

The deployment configurations include security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Cache-Control for static assets