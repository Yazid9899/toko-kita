## Packages
recharts | Dashboard charts and analytics visualization
date-fns | Date formatting for tables and order details
framer-motion | Smooth transitions and layout animations
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
Authentication is handled via JWT-based local admin login (credentials stored in the database).
Frontend checks /api/auth/user via use-auth.ts hook.
Images are handled as static assets or external URLs (no file upload implemented yet).
