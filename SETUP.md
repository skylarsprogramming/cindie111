# Cindie Setup Instructions

## 🔐 Security Configuration

Your Firebase configuration has been secured. The sensitive files are now properly excluded from git.

## 📋 Setup Steps

### 1. Environment Variables

#### For Next.js (main app):
```bash
# Copy the example file
cp env.local.example .env.local

# Edit with your values (already filled with your Firebase config)
# The file contains your actual Firebase keys but won't be committed to git
```

#### For Vite (web app):
```bash
# Navigate to web directory
cd web

# Copy the example file
cp env.example .env

# Edit with your values (already filled with your Firebase config)
```

### 2. Firebase Service Account

The Firebase Admin SDK service account file is already configured:
- `cindie-ai-firebase-adminsdk-fbsvc-0d1e7b197a.json` (excluded from git)
- Server automatically uses this for backend authentication

### 3. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `cindie-ai` project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `cindie-ai.firebaseapp.com` (already there)
   - Your production domain (e.g., `yourdomain.com`)
   - `localhost` (for development)

### 4. N8N Webhook

Update your webhook URL in `js/n8n-integration.js`:
```javascript
this.webhookUrl = 'https://your-n8n-instance.app.n8n.cloud/webhook/generate-ai-lesson';
```

## 🚀 Running the Application

### Development
```bash
# Install dependencies
npm install

# Start the server
cd server && npm install && npm run dev

# In another terminal, start the Next.js app
npm run dev

# For the Vite app (optional)
cd web && npm install && npm run dev
```

### Production
```bash
# Build and start
npm run build
npm start
```

## 🔒 Security Features

✅ **API Keys Hidden**: All Firebase keys moved to environment variables  
✅ **Service Account**: Backend uses secure service account authentication  
✅ **Git Protection**: Sensitive files excluded from version control  
✅ **Environment Validation**: Apps validate config before starting  
✅ **Error Handling**: Graceful fallbacks when config is missing  

## 📁 File Structure

```
├── .env.local.example          # Next.js env template
├── web/env.example             # Vite env template
├── cindie-ai-firebase-adminsdk-fbsvc-0d1e7b197a.json  # Service account (gitignored)
├── server/                     # Express server with Firebase Admin
├── src/                        # Next.js app with secure Firebase client
├── web/                        # Vite app with environment-based config
└── js/                         # Static HTML Firebase integration
```

## 🛠️ Troubleshooting

### "Firebase configuration is missing"
- Ensure `.env.local` exists with your Firebase keys
- Check that `NEXT_PUBLIC_FIREBASE_*` variables are set

### "Firebase Admin failed to initialize"
- Verify the service account file exists in the root directory
- Check file permissions

### Authentication not working
- Verify authorized domains in Firebase Console
- Check browser console for CORS errors
- Ensure HTTPS in production

## 🔄 Updating Keys

If you need to rotate your Firebase keys:

1. Generate new keys in Firebase Console
2. Update your `.env.local` and `web/.env` files
3. Update the service account file (if needed)
4. Redeploy your application

The old keys will continue to work until you remove them from Firebase Console.
