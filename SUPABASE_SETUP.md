# Supabase Setup for Menu Settings

This guide will help you set up Supabase to store menu item availability settings in production.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `alos-coffee-menu` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
6. Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL script
4. This will create the `menu_settings` table

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `/settings` and enter the password: `HARRYLU`
3. Try toggling some menu items
4. Check that changes persist after page refresh

## Step 6: Deploy to Production

1. Add the environment variables to your production platform (Vercel, Netlify, etc.)
2. Deploy your application
3. The settings will now be stored in Supabase instead of local files

## Database Schema

The `menu_settings` table has the following structure:

- `id`: Primary key (always 1)
- `disabled_items`: Array of menu item IDs that are sold out
- `updated_at`: Timestamp of last update

## Security Notes

- The current setup allows public read/write access to the settings
- For better security, you could implement authentication
- The password protection is client-side only
- Consider adding server-side validation for production

## Troubleshooting

### "Failed to fetch disabled items"
- Check that your environment variables are correct
- Verify the Supabase project is active
- Check the browser console for detailed error messages

### "Failed to update disabled items"
- Ensure the database table was created correctly
- Check that RLS policies are set up properly
- Verify your API keys have the correct permissions

## Cost Considerations

- Supabase free tier includes:
  - 500MB database
  - 50,000 monthly active users
  - 2GB bandwidth
  - This should be sufficient for most small to medium coffee shops

## Backup Strategy

- Supabase automatically backs up your database
- You can also export data manually from the dashboard
- Consider setting up automated backups for critical data 