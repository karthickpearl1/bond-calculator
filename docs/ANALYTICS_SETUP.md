# Google Analytics Setup

This document explains how to configure Google Analytics for the bond calculator application.

## Environment Configuration

### 1. Copy Environment Template

Copy the `.env.example` file to create your local environment configuration:

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` and update the following variables:

```env
# Replace with your actual GA4 Measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Enable analytics tracking
VITE_GA_ENABLED=true

# Enable debug mode for development (optional)
VITE_GA_DEBUG=true
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_GA_MEASUREMENT_ID` | Your Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX) | Yes | - |
| `VITE_GA_ENABLED` | Enable/disable analytics tracking (`true` or `false`) | No | `false` |
| `VITE_GA_DEBUG` | Enable debug logging (`true` or `false`) | No | `false` |

### 3. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or select an existing one
3. Go to Admin → Data Streams
4. Select your web stream
5. Copy the Measurement ID (format: G-XXXXXXXXXX)

## Environment-Specific Configuration

### Development
- Set `VITE_GA_ENABLED=false` to disable tracking during development
- Set `VITE_GA_DEBUG=true` to enable console logging

### Production
- Set `VITE_GA_ENABLED=true` to enable tracking
- Set `VITE_GA_DEBUG=false` to disable debug logging
- Ensure `VITE_GA_MEASUREMENT_ID` is set to your production GA4 property

## Configuration Utility

The application includes a configuration utility at `src/utils/analyticsConfig.ts` that:

- Validates the measurement ID format
- Handles missing environment variables gracefully
- Provides environment-specific configuration
- Ensures analytics is only enabled when properly configured

## Security Notes

- Environment files (`.env.local`, `.env`) are ignored by git
- Never commit actual measurement IDs to version control
- Use different GA4 properties for development and production environments