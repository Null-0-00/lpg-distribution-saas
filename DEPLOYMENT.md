# Deployment Guide

## Vercel Deployment

### Required Environment Variables

Before deploying to Vercel, you need to set these environment variables in your Vercel project settings:

#### Essential Variables (Required)
```
NEXTAUTH_SECRET=your-secret-key-here-at-least-32-characters-long
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://username:password@host:5432/database
```

#### Optional Variables
```
REDIS_URL=redis://localhost:6379
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=your-sentry-dsn
```

### Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add each variable with the appropriate value
5. Make sure to set them for "Production", "Preview", and "Development" environments as needed

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

### Database Setup

1. Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. Run migrations in your database:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed the database if needed:
   ```bash
   npx prisma db seed
   ```

### Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the environment variables as listed above
4. Deploy!

### Common Issues

#### Build Fails with "NEXTAUTH_SECRET environment variable is required"
- Make sure `NEXTAUTH_SECRET` is set in your Vercel environment variables
- The secret must be at least 32 characters long

#### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Make sure your database allows connections from Vercel's IP addresses
- Test the connection locally first

#### 404 Errors on API Routes
- Ensure your environment variables are set for the correct environment (Production/Preview)
- Check that `NEXTAUTH_URL` matches your actual domain

### Build Command

The default build command should work:
```bash
npm run build
```

### Important Notes

- This app uses Prisma with PostgreSQL
- Make sure your database is accessible from Vercel
- The app includes authentication via NextAuth.js
- Redis is used for caching (optional but recommended)