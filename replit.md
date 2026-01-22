# Toko-Kita: Order & Inventory Management System

## Overview
A web-based order and inventory management system for a small WhatsApp-based business. The system tracks customers, products with variants, orders, and automatically generates procurement lists when stock is insufficient.

## Tech Stack
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (Google/GitHub/email login)

## Design System
- **Primary Color**: #5C6AC4 (Indigo) - used for main actions, buttons, active states
- **Secondary Color**: #00848E (Teal) - used for procurement, secondary actions
- **Background**: #F8FAFC (Light gray-blue) - main page background
- **Cards**: White with subtle shadows and rounded corners (rounded-2xl)

## Project Structure
```
client/
  src/
    components/     # Reusable UI components (Layout, StatusBadge, etc.)
    pages/          # Page components (Dashboard, Orders, Customers, Products, Procurement)
    hooks/          # Custom React hooks for data fetching
    lib/            # Utility functions and configurations
server/
  routes.ts        # API route definitions
  storage.ts       # Database storage interface
shared/
  schema.ts        # Database schema and types (Drizzle + Zod)
```

## Key Features
1. **Dashboard**: Overview with stats (revenue, unpaid orders, to pack, to buy) and recent activity
2. **Orders**: Create, view, and manage orders with payment/packing status tracking
3. **Customers**: Manage customer database with quick-add from order creation
4. **Products**: Inventory management with product variants (size, color, etc.)
5. **Procurement**: Auto-generated list when order quantity exceeds stock

## Recent Changes (January 2026)
- Premium UI overhaul with DashStack-inspired styling
- Added quick customer creation dialog within order flow
- Consistent color scheme and spacing across all pages
- Enhanced accessibility with DialogDescription and data-testid attributes
- Improved responsive design for mobile and desktop
- Complete customer CRUD functionality on /customers page:
  - Edit customer dialog with form pre-filled
  - Delete customer with confirmation dialog
  - Delete constraint: prevents deletion of customers with existing orders
  - Server error messages properly propagated to user
- UI refactored to use semantic tokens (text-foreground, bg-muted, etc.) for dark mode compatibility
- All components now use shadcn default variants (no custom hover/active states)

## User Preferences
- Premium, modern admin panel aesthetic
- Consistent styling across pages
- Fast order creation workflow
