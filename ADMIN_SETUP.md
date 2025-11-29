# Admin Setup Instructions

## Setting Your Admin Code

To set a custom admin code, create a `.env.local` file in the root directory with:

```
ADMIN_CODE=your-secret-code-here
```

**Important:** 
- The default admin code is `vishwesh`
- Never commit `.env.local` to git (it's already in .gitignore)
- Restart the dev server after changing the admin code

## Using Admin Mode

1. Click the "Admin" button in the top right corner of the map page
2. Enter your admin code
3. Once authenticated, you'll see an "Admin Panel" instead of "My Ratings"
4. In Admin Panel, you can delete ANY rating (not just your own)
5. Click "Logout" to exit admin mode

## Security Note

The admin code is checked server-side, so it's secure. Only you know the code, and only authenticated admins can delete other people's reviews.

