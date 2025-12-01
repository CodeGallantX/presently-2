# Vercel Deployment Setup

This guide explains how to configure environment variables for the Presently app on Vercel.

## Environment Variables Required

The following environment variables must be set in Vercel for the application to work correctly:

### Required Variables

1. **`VITE_SUPABASE_ANON_KEY`** (Required)
   - Description: The public anonymous key for your Supabase project
   - Where to get it: Supabase Dashboard → Settings → API → `anon` `public` key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Optional Variables

2. **`VITE_GEMINI_API_KEY`** (Optional)
   - Description: Google Gemini API key for AI features
   - Where to get it: Google AI Studio
   - Example: `AIzaSy...`

## Setting Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application for changes to take effect

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variable
vercel env add VITE_SUPABASE_ANON_KEY

# When prompted, paste your Supabase anon key
# Select which environments to apply it to (Production, Preview, Development)
```

### Method 3: Via `.env` file (Local Development Only)

For local development, create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys
VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
```

**⚠️ Important**: Never commit `.env` files to Git! They are already in `.gitignore`.

## Verifying Environment Variables

### On Vercel

1. After setting variables, go to **Deployments**
2. Click on the latest deployment
3. Go to **Build Logs**
4. Look for the message: `✅ Supabase client initialized successfully`
5. If you see `⚠️ Supabase is not properly configured`, the environment variable is missing or invalid

### Locally

Run the development server:

```bash
npm run dev
```

Check the browser console:
- ✅ Success: `✅ Supabase client initialized successfully`
- ❌ Error: `⚠️ Supabase is not properly configured`

## Troubleshooting

### Issue: "Supabase is not configured" error after deployment

**Solution:**
1. Verify the environment variable is set in Vercel
2. Make sure the variable name is exactly `VITE_SUPABASE_ANON_KEY` (case-sensitive)
3. Ensure the variable is available in the correct environment (Production/Preview/Development)
4. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push
   ```

### Issue: Environment variable works locally but not on Vercel

**Solution:**
1. Vite requires environment variables to be prefixed with `VITE_`
2. Variables must be set at **build time** in Vercel
3. After adding/updating variables, you **must redeploy** for changes to take effect

### Issue: Cannot see environment variables in browser console on production

**Solution:**
- The detailed logging (`✅ Supabase client initialized successfully`) only appears in development mode
- In production, check the application behavior instead:
  - Can you register/login?
  - Are there errors in the console?
  - Check Network tab for Supabase API calls

## Security Best Practices

1. **Never expose sensitive keys**: The `VITE_` prefix makes variables public in the built JavaScript bundle. Only use this for public keys like Supabase anon key.

2. **Use Supabase RLS**: Always enable Row Level Security (RLS) in Supabase to protect your data, since the anon key is public.

3. **Rotate keys regularly**: If you suspect a key has been compromised, rotate it in Supabase and update Vercel immediately.

4. **Different keys for different environments**: Use separate Supabase projects for development, staging, and production.

## Deployment Checklist

- [ ] Supabase project is created and configured
- [ ] Database schema is set up (run `supabase/schema.sql`)
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Vercel
- [ ] Environment variable is available in all environments
- [ ] Project is deployed/redeployed
- [ ] Registration and login work correctly
- [ ] No console errors related to Supabase

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Setup Guide](./supabase/README.md)
