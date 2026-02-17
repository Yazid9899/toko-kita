# Toko-Kita

Toko-Kita is a local-first admin system for inventory and order operations.
It is built for small to medium catalog businesses that need to manage products, variants, customers, orders, and procurement from one dashboard.

## What The App Does

Toko-Kita combines these flows in one app:
- Product and variant catalog management.
- Customer management.
- Order creation and fulfillment tracking.
- Automatic preorder and procurement tracking when stock is insufficient.
- Basic admin authentication and protected routes.

## Full Feature List

### Authentication and Access
- Local admin login with username and password.
- JWT-based authentication with HTTP-only cookie.
- Auth status check endpoint at `/api/auth/user`.
- Protected routes for all app pages except `/login`.
- Logout endpoint and client-side auth cache reset.

### Dashboard
- KPI cards:
- Total revenue.
- Unpaid orders.
- Orders to pack.
- Procurement items to buy.
- Recent orders table with quick navigation to order detail.
- Urgent procurement table for items still in `TO_BUY`.
- Revenue is computed from order items and discount.

### Customer Management
- Create customer.
- Edit customer.
- Delete customer.
- Search customers by name or phone.
- Customer types: `PERSONAL` and `RESELLER`.
- Copy customer address to clipboard from the table.
- Delete protection: customers with existing orders cannot be deleted.

### Inventory and Product Management
- Brand management:
- Create brand.
- Edit brand.
- Product management:
- Create product with brand, type (`apparel` or `accessory`), and description.
- Edit product details.
- Product attributes:
- Create attribute (name, code, sort order, active state).
- Edit attribute.
- Soft-delete behavior by setting attribute `isActive = false`.
- Attribute options:
- Create option values per attribute.
- Edit option values and active state.
- Product variants:
- Create variant from attribute-option selections.
- Edit variant SKU, unit, stock, preorder setting, options, and IDR price.
- Delete variant.
- Variant validation:
- One option per attribute.
- Attribute and option must belong to product.
- Inactive attribute/option cannot be used in new variant selections.
- Duplicate variant combinations are blocked by a unique variant key per product.
- Variant filtering:
- Filter variants by attribute option combinations.
- Inventory visibility:
- Stock levels shown in variant table.
- Stock warning colors.
- Color swatch rendering for known color names.

### Order Management
- Create order with:
- Customer selection.
- Variant search by product name, variant label, or SKU.
- Product filter and stock state filter (`all`, `in stock`, `preorder`).
- Quantity controls per item.
- Discount input.
- Notes.
- Automatic order number generation with `TK-XXXXXX` format.
- Orders list:
- Tabs: all, unpaid, and to pack.
- Search by order number, customer name, or phone.
- Inline status updates:
- Payment status (`NOT_PAID`, `DOWN_PAYMENT`, `PAID`).
- Packing status (`NOT_READY`, `PACKING`, `PACKED`).
- Order detail page:
- Line-item breakdown and totals.
- Preorder flags per order item.
- Procurement section for the order when needed.
- Print invoice via browser print.
- Inline customer detail editing.
- Workflow action buttons with undo support via toast action.

### Procurement and Restocking
- Auto procurement creation on order creation when requested quantity exceeds current stock.
- Procurement statuses:
- `TO_BUY`
- `ORDERED`
- `ARRIVED`
- Procurement list with:
- Status tabs.
- Search by item, SKU, order number, or customer.
- One-click status transitions.
- Undo action back to `TO_BUY` for `ORDERED` and `ARRIVED`.
- When a procurement item is marked `ARRIVED`, stock is automatically incremented by `neededQty`.

### Validation, Contracts, and Data Handling
- Shared route contracts and schemas in `shared/routes.ts`.
- Input validation with Zod.
- Database schema and enums defined in `shared/schema.ts`.
- React Query for fetching, mutation, cache invalidation, and UI refresh.
- Toast feedback for success and error states.

## Core Business Rules

- Orders decrement stock immediately when stock is sufficient.
- Orders mark items as preorder when quantity exceeds stock.
- Preorder gaps create procurement records with `neededQty`.
- Procurement `ARRIVED` updates variant stock automatically.
- Customers with related orders cannot be deleted.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Wouter, Tailwind CSS, shadcn/ui.
- State and data: TanStack React Query, React Hook Form, Zod.
- Backend: Node.js, Express.
- Database: PostgreSQL.
- ORM and schema: Drizzle ORM, drizzle-kit, drizzle-zod.
- Auth: JWT, HTTP-only cookie, local admin accounts.

## Project Structure

- `client/src`: frontend pages, components, hooks.
- `server`: Express server, routes, auth, storage.
- `shared`: shared DB schema and typed API route contracts.
- `script`: seed and utility scripts.

## Local Setup

### Prerequisites
- Node.js v18+.
- PostgreSQL running locally or remotely.

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env` in the project root:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/toko_kita
SESSION_SECRET=your_random_secret_here
JWT_SECRET=your_jwt_secret_here
ADMIN_SEED_USERS=admin:admin123,admin2:change_me
```

### 3. Create database tables
```bash
npm run db:push
```

### 4. Seed admin users
```bash
npm run seed:admins
```

### 5. Optional seed data
```bash
npm run seed:products
npm run seed:customers
npm run seed:orders
```

Or run all seeds:

```bash
npm run seed:all
```

### 6. Run development server
```bash
npm run dev
```

App URL: `http://localhost:5000`

## Available Scripts

- `npm run dev`: start development server.
- `npm run build`: build production bundle.
- `npm run start`: run production server.
- `npm run check`: TypeScript type check.
- `npm run db:push`: push Drizzle schema to database.
- `npm run seed:admins`: seed admin users from `ADMIN_SEED_USERS`.
- `npm run seed:products`: seed products and variants.
- `npm run seed:customers`: seed customers.
- `npm run seed:orders`: seed orders and related data.
- `npm run seed:all`: run all seed scripts.

## Current Scope Notes

- Product delete is not implemented in UI/API (only disabled action in menu).
- Image upload pipeline is not implemented.
- Auth uses local admin accounts only (no external auth provider).
