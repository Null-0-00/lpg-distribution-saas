# Vercel + Supabase Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Vercel Setup
1. Connect your GitHub repository to Vercel
2. Configure the following environment variables in Vercel dashboard:

### 2. Required Environment Variables

```bash
# Database (from Supabase dashboard)
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase (from Supabase dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# NextAuth.js (CRITICAL)
NEXTAUTH_SECRET="[generate-32-character-random-string]"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# Environment
NODE_ENV="production"
```

### 3. Generate NEXTAUTH_SECRET
```bash
# Use this command to generate a secure secret:
openssl rand -base64 32
```

### 4. Database Setup
```bash
# Run these commands after deployment:
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Test Deployment
- Visit: `https://your-app-name.vercel.app`
- Test login with: `admin@demo.com` / `admin123`

## 🔧 Troubleshooting

### Authentication Issues
1. **Check Environment Variables**: Ensure all variables are set in Vercel
2. **Verify NEXTAUTH_URL**: Must match your Vercel domain exactly
3. **Database Connection**: Verify Supabase connection strings
4. **Enable Debug Mode**: Add `NEXTAUTH_DEBUG="true"` temporarily

### Common Fixes
- Clear browser cache and cookies
- Check Vercel function logs
- Verify Supabase database is accessible
- Ensure all migrations are applied

### Debug Mode
Add this to Vercel environment variables for debugging:
```bash
NEXTAUTH_DEBUG="true"
```

Remove after fixing issues to avoid exposing sensitive information.

## 📊 Monitoring
- Monitor Vercel function execution times
- Check Supabase connection pool usage
- Review authentication logs in Vercel dashboard

## 🔒 Security Checklist
- ✅ NEXTAUTH_SECRET is 32+ characters
- ✅ Database connection uses connection pooling
- ✅ Supabase RLS (Row Level Security) is enabled
- ✅ Environment variables are not exposed to client
- ✅ HTTPS is enforced (automatic with Vercel)

## 🎯 Performance Optimizations
- Connection pooling configured (pgbouncer=true)
- JWT session strategy for faster authentication
- Middleware optimized for Vercel edge functions
- Static assets cached appropriately