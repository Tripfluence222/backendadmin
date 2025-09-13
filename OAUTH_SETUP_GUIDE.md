# 🔐 OAuth App Configuration Guide

## 📋 **Overview**

This guide will help you set up OAuth applications with Facebook, Google, Eventbrite, and Meetup to enable real provider integrations in your Tripfluence Admin application.

## 🚀 **Prerequisites**

- Admin access to each platform's developer console
- Your application running on `http://localhost:3000` (development)
- Production domain ready (for production setup)

---

## 📱 **1. Facebook & Instagram Setup**

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"Create App"**
3. Choose **"Business"** as app type
4. Fill in app details:
   - **App Name**: `Tripfluence Admin`
   - **App Contact Email**: Your email
   - **Business Account**: Select your business account

### Step 2: Configure Facebook Login
1. In your app dashboard, go to **"Facebook Login"** → **"Settings"**
2. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```

### Step 3: Configure Instagram Basic Display
1. Go to **"Instagram Basic Display"** → **"Basic Display"**
2. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/instagram
   https://yourdomain.com/api/auth/callback/instagram
   ```

### Step 4: Get App Credentials
1. Go to **"Settings"** → **"Basic"**
2. Copy your **App ID** and **App Secret**
3. Add to your `.env` file:
   ```bash
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   ```

### Step 5: Configure Page Access (for Facebook Pages)
1. Go to **"Facebook Login"** → **"Settings"**
2. Add these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_content_publish`

---

## 🔍 **2. Google Business Profile Setup**

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name: `Tripfluence Admin`
4. Click **"Create"**

### Step 2: Enable APIs
1. Go to **"APIs & Services"** → **"Library"**
2. Search and enable:
   - **Google My Business API**
   - **Google+ API** (if available)

### Step 3: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Application type: **"Web application"**
4. Name: `Tripfluence Admin Web Client`
5. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

### Step 4: Configure OAuth Consent Screen
1. Go to **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in required fields:
   - **App name**: `Tripfluence Admin`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/business.manage`

### Step 5: Get Credentials
1. Copy **Client ID** and **Client Secret**
2. Add to your `.env` file:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

---

## 🎪 **3. Eventbrite Setup**

### Step 1: Create Eventbrite App
1. Go to [Eventbrite API Keys](https://www.eventbrite.com/platform/api-keys/)
2. Click **"Create API Key"**
3. Fill in details:
   - **Application Name**: `Tripfluence Admin`
   - **Description**: `Admin panel for managing events and social media`
   - **Website URL**: `http://localhost:3000`

### Step 2: Configure OAuth Settings
1. In your API key settings, add redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/eventbrite
   https://yourdomain.com/api/auth/callback/eventbrite
   ```

### Step 3: Get Credentials
1. Copy **Client Key** and **Client Secret**
2. Add to your `.env` file:
   ```bash
   EVENTBRITE_CLIENT_ID=your_client_key_here
   EVENTBRITE_CLIENT_SECRET=your_client_secret_here
   ```

### Step 4: Request Permissions
1. Contact Eventbrite support to request:
   - `event:read`
   - `event:write`
   - `user:read`

---

## 🤝 **4. Meetup Setup**

### Step 1: Create Meetup App
1. Go to [Meetup API Keys](https://secure.meetup.com/meetup_api/key/)
2. Click **"Create API Key"**
3. Fill in details:
   - **Application Name**: `Tripfluence Admin`
   - **Description**: `Admin panel for event management`
   - **Application URL**: `http://localhost:3000`
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/meetup`

### Step 2: Configure OAuth Settings
1. Add redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/meetup
   https://yourdomain.com/api/auth/callback/meetup
   ```

### Step 3: Get Credentials
1. Copy **Consumer Key** and **Consumer Secret**
2. Add to your `.env` file:
   ```bash
   MEETUP_CLIENT_ID=your_consumer_key_here
   MEETUP_CLIENT_SECRET=your_consumer_secret_here
   ```

### Step 4: Request Permissions
1. Request these scopes:
   - `ageless`
   - `group_edit`
   - `event_management`

---

## 🔧 **5. Environment Configuration**

### Complete `.env` File
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tripfluence_admin"

# Redis
REDIS_URL="redis://localhost:6379"

# Feature Flags
FEATURE_REAL_PROVIDERS=true

# Facebook & Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_CONFIG_ID=your_facebook_page_config_id
INSTAGRAM_CONFIG_ID=your_instagram_config_id

# Google Business Profile
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Eventbrite
EVENTBRITE_CLIENT_ID=your_eventbrite_client_id
EVENTBRITE_CLIENT_SECRET=your_eventbrite_client_secret

# Meetup
MEETUP_CLIENT_ID=your_meetup_client_id
MEETUP_CLIENT_SECRET=your_meetup_client_secret

# OAuth Configuration
OAUTH_REDIRECT_BASE=http://localhost:3000
GRAPH_API_BASE=https://graph.facebook.com/v18.0
GBP_API_BASE=https://mybusiness.googleapis.com/v4

# Encryption
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Security
WEBHOOK_SECRET=your-webhook-secret-key-minimum-32-characters
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
```

---

## 🧪 **6. Testing OAuth Connections**

### Test Facebook Connection
```bash
curl "http://localhost:3000/api/auth/connect/facebook?businessId=test-business-id"
```

### Test Google Connection
```bash
curl "http://localhost:3000/api/auth/connect/google?businessId=test-business-id"
```

### Test Eventbrite Connection
```bash
curl "http://localhost:3000/api/auth/connect/eventbrite?businessId=test-business-id"
```

### Test Meetup Connection
```bash
curl "http://localhost:3000/api/auth/connect/meetup?businessId=test-business-id"
```

---

## 🚨 **7. Common Issues & Solutions**

### Issue: "Invalid redirect URI"
**Solution**: Ensure redirect URIs in OAuth apps match exactly:
- Development: `http://localhost:3000/api/auth/callback/[provider]`
- Production: `https://yourdomain.com/api/auth/callback/[provider]`

### Issue: "Insufficient permissions"
**Solution**: 
- Facebook: Request additional permissions in app settings
- Google: Add required scopes in OAuth consent screen
- Eventbrite: Contact support for permission requests
- Meetup: Request additional scopes

### Issue: "App not approved"
**Solution**:
- Facebook: Submit for app review (required for production)
- Google: Complete OAuth consent screen verification
- Eventbrite: Contact support for production access
- Meetup: Request production access

### Issue: "Rate limit exceeded"
**Solution**: Implement proper rate limiting in your application using the provider adapters' built-in rate limit parsing.

---

## 🔒 **8. Security Best Practices**

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate credentials** regularly
4. **Monitor API usage** and set up alerts
5. **Implement proper error handling** for OAuth flows
6. **Use HTTPS** in production
7. **Validate redirect URIs** to prevent attacks

---

## 📈 **9. Production Deployment**

### Environment Variables
Update your production environment with:
- Production redirect URIs
- Production domain in `OAUTH_REDIRECT_BASE`
- Secure encryption keys
- Production database and Redis URLs

### App Review Process
- **Facebook**: Submit for app review (required for public apps)
- **Google**: Complete OAuth consent screen verification
- **Eventbrite**: Request production access
- **Meetup**: Request production access

---

## ✅ **10. Verification Checklist**

- [ ] Facebook app created and configured
- [ ] Instagram Basic Display enabled
- [ ] Google Cloud project created
- [ ] Google My Business API enabled
- [ ] Eventbrite API key created
- [ ] Meetup API key created
- [ ] All redirect URIs configured
- [ ] Environment variables set
- [ ] OAuth flows tested
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Security measures applied

---

## 🎉 **You're Ready!**

Once all OAuth apps are configured and tested, your Tripfluence Admin application will be able to:

- ✅ Connect to Facebook Pages and Instagram Business accounts
- ✅ Post to Google Business Profile
- ✅ Create and manage events on Eventbrite
- ✅ Create and manage events on Meetup
- ✅ Handle OAuth token refresh automatically
- ✅ Provide complete audit logging
- ✅ Maintain security and compliance

**Next Steps**: Start connecting real accounts and testing the full workflow!
