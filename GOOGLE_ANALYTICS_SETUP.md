# Google Analytics 4 Setup Guide

This guide will walk you through setting up Google Analytics 4 (GA4) for your Bond Calculator application so you can view analytics data in the Google Analytics dashboard.

## Step 1: Create a Google Analytics Account

1. **Go to Google Analytics**: Visit [https://analytics.google.com](https://analytics.google.com)
2. **Sign in**: Use your Google account to sign in
3. **Create Account**: If you don't have an Analytics account, click "Start measuring" to create one

## Step 2: Set Up a Property

1. **Account Setup**:
   - Enter an account name (e.g., "Bond Calculator Analytics")
   - Choose your data sharing settings
   - Click "Next"

2. **Property Setup**:
   - Enter a property name (e.g., "Bond Calculator App")
   - Select your reporting time zone
   - Select your currency
   - Click "Next"

3. **Business Information**:
   - Select your industry category (e.g., "Finance")
   - Select your business size
   - Choose how you intend to use Google Analytics
   - Click "Create"

4. **Accept Terms**: Accept the Google Analytics Terms of Service

## Step 3: Set Up Data Stream

1. **Choose Platform**: Select "Web" since this is a web application

2. **Web Stream Setup**:
   - **Website URL**: Enter your website URL
     - For development: `http://localhost:5173` (or your dev server port)
     - For production: Your actual domain (e.g., `https://yourdomain.com`)
   - **Stream name**: Enter a descriptive name (e.g., "Bond Calculator - Development" or "Bond Calculator - Production")
   - Click "Create stream"

3. **Get Measurement ID**: 
   - After creating the stream, you'll see a **Measurement ID** that looks like `G-XXXXXXXXXX`
   - **Copy this ID** - you'll need it for your application

## Step 4: Configure Your Application

1. **Update Environment Variables**:
   Open your `.env.local` file and update the measurement ID:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Replace with your actual ID
   VITE_GA_ENABLED=true
   VITE_GA_DEBUG=true  # Set to false in production
   ```

2. **For Production**: Create a `.env.production` file:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Your production measurement ID
   VITE_GA_ENABLED=true
   VITE_GA_DEBUG=false
   VITE_GA_RESPECT_DNT=true
   VITE_GA_FORCE_OPT_OUT=false
   ```

3. **Restart Development Server**: 
   - Stop your dev server (Ctrl+C)
   - Start it again (`npm run dev` or `yarn dev`)

## Step 5: Test Your Setup

1. **Open Your Application**: Navigate to your app in the browser
2. **Check Browser Console**: You should see debug messages like:
   ```
   Analytics Configuration Debug:
   VITE_GA_MEASUREMENT_ID: G-XXXXXXXXXX
   Google Analytics initialized successfully
   ```
3. **Interact with Your App**: Use the bond calculator to generate some test events

## Step 6: Verify Data in Google Analytics

1. **Real-time Reports**:
   - Go to your Google Analytics dashboard
   - Navigate to **Reports** → **Realtime**
   - You should see active users (yourself) in real-time
   - Events should appear as you interact with the app

2. **Debug View** (Recommended for Testing):
   - In GA4, go to **Configure** → **DebugView**
   - This shows detailed event data in real-time
   - Perfect for testing your implementation

## Step 7: Understanding Your Analytics Data

### Key Events Being Tracked

Your Bond Calculator tracks these custom events:

1. **Page Views**: When users visit pages
2. **Bond Calculations**: When users perform calculations
3. **User Interactions**: Input changes, selections
4. **Session Data**: User engagement metrics

### Where to Find Data in GA4

1. **Real-time Data**: **Reports** → **Realtime**
2. **Event Data**: **Reports** → **Engagement** → **Events**
3. **User Behavior**: **Reports** → **Engagement** → **Pages and screens**
4. **Custom Events**: **Configure** → **Events** (to see all tracked events)

### Custom Dimensions and Metrics

The app tracks these custom parameters:
- `calculation_type`: Type of bond calculation
- `currency`: Currency used
- `session_id`: Unique session identifier
- `interaction_type`: Type of user interaction

## Step 8: Production Deployment

### For Different Environments

1. **Development**: Use localhost URL in your data stream
2. **Staging**: Create a separate data stream for staging environment
3. **Production**: Create a separate data stream for production

### Best Practices

1. **Separate Properties**: Consider separate GA4 properties for dev/staging/production
2. **Environment Variables**: Use different measurement IDs for different environments
3. **Privacy Compliance**: The app automatically respects Do Not Track and privacy settings

## Troubleshooting

### Common Issues

1. **No Data Appearing**:
   - Check that `VITE_GA_ENABLED=true`
   - Verify your Measurement ID is correct
   - Ensure you restarted the dev server after changing env variables
   - Check browser console for errors

2. **"Analytics Disabled" Message**:
   - Verify environment variables are set correctly
   - Check if Do Not Track is enabled in your browser
   - Ensure ad blockers aren't interfering

3. **Events Not Showing**:
   - Use DebugView in GA4 for real-time event debugging
   - Check browser network tab for blocked requests
   - Verify custom event names in the Events section

### Debug Commands

Add this to your browser console to check configuration:
```javascript
// Check current analytics configuration
console.log('GA Config:', window.analyticsService?.getPrivacyStatus());
```

## Privacy and Compliance

Your implementation includes:
- ✅ Do Not Track respect
- ✅ PII detection and filtering
- ✅ User opt-out functionality
- ✅ Privacy-focused browser detection
- ✅ GDPR-friendly defaults

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use GA4's DebugView for real-time debugging
3. Verify your Measurement ID is correct
4. Ensure environment variables are properly set

---

**Next Steps**: Once you see data flowing into Google Analytics, you can create custom reports, set up goals, and analyze user behavior patterns in your Bond Calculator application.