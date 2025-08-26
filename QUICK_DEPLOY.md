# 🚀 Quick Deployment Guide

## ⚡ Get Live in 5 Minutes

### 1. Create Environment File
```bash
# Copy the template
cp env.production.template .env.local

# Edit with your values
notepad .env.local
```

**Required values:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NODE_ENV=production`
- `NEXTAUTH_SECRET` - Generate a random 32+ character string

### 2. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Or use the web interface:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables
4. Deploy

### 3. Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### 4. Deploy to Any Hosting Platform

```bash
# Build locally
npm run build

# Upload .next folder to your hosting platform
# Set environment variables on your hosting platform
```

## 🔧 Environment Variables

**Copy this to your `.env.local`:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
NEXTAUTH_SECRET=generate-random-32-char-string-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## ✅ Recent Fixes Applied

- **Japan Dialing Code**: Fixed +81 label (was showing +49)
- **Timezone**: Changed from America/Toronto to America/Barbados for age calculations
- **Logger Security**: Implemented proper log levels (debug/info/warn/error) with PII redaction
- **Performance**: Fixed useEffect dependency issues and hoisted watched values
- **Timezone Consistency**: Date input max attributes now use Barbados timezone consistently
- **Database Optimization**: Replaced multiple table inserts with single RPC call to `create_player_profile`
- **React Hook Form**: Added `shouldUnregister: true` and fixed controlled/uncontrolled input issues
- **Success Page**: Fixed nested update warning by decoupling timeout from interval
- **Manifest**: Added PWA manifest.json to prevent 404 errors
- **Error Logging**: Ensured `logger.error` always logs in production for real failures
- **Error Boundaries**: Added comprehensive error handling to prevent white-screen crashes
- **Performance Monitoring**: Integrated Vercel Analytics & Speed Insights for production monitoring
- **Production Build**: ✅ Builds successfully with no critical errors

## 🚨 Critical Checks

- [ ] `.env.local` file created with production values
- [ ] `NODE_ENV=production` set
- [ ] Supabase credentials are production (not development)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS/SSL enabled

## 📱 Test Your Deployment

1. **Homepage:** Should load without errors
2. **Customer Form:** Test form submission
3. **Admin Panel:** Test login and functionality
4. **Mobile:** Test responsive design
5. **Performance:** Run Lighthouse audit

## 🆘 Need Help?

- **Build Issues:** Check `PRODUCTION_READINESS_REPORT.md`
- **Security:** Review `SECURITY.md`
- **Full Checklist:** See `PRODUCTION_CHECKLIST.md`
- **Deployment Scripts:** Use `deploy.bat` (Windows) or `deploy.sh` (Linux/Mac)

---

**🎉 Your site is ready to go live!** 

The application has been thoroughly tested, all critical issues resolved, and recent fixes applied. Follow the steps above to deploy to your chosen hosting platform.
