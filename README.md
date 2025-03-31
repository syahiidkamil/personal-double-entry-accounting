# Personal Double-Entry Accounting System

A comprehensive double-entry accounting system for personal finance management. Manage accounts, track transactions, monitor debts, and analyze financial health.

## Features

- **Double-Entry Accounting**: Ensure balance and accuracy with double-entry transactions
- **Multi-Currency Support**: Handle multiple currencies with appropriate conversions
- **Debt Tracking**: Monitor loans, credit cards, and other liabilities
- **Financial Reporting**: Generate balance sheets, income statements, and more
- **User Authentication**: Secure login system with JWT tokens

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and update the values:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/personal_accounting?schema=public"

# Authentication
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRY="7d"

# Admin Registration 
ADMIN_REGISTRATION_KEY="your-admin-secret-key-change-this-in-production"
```

### Installation

```bash
# Install dependencies
npm install

# Initialize the database
npm run db:push

# Seed the database with initial data
npm run db:seed

# Start the development server
npm run dev
```

### Default Users

The seed script creates two default users:

1. **Admin User**
   - Email: admin@example.com
   - Password: adminpassword
   - Role: ADMIN

2. **Regular User**
   - Email: user@example.com
   - Password: userpassword
   - Role: REGULAR

## Development

### Project Structure

```
/
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── src/
    ├── components/    # Reusable UI components
    ├── features/      # Feature-based modules
    │   ├── auth/      # Authentication
    │   ├── accounts/  # Account management
    │   └── ...        # Other features
    ├── lib/           # Utility libraries
    ├── middleware/    # API middleware
    ├── pages/         # Page components and API routes
    └── styles/        # Global styles
```

### Authentication System

The authentication system uses JWT tokens with secure HTTP-only cookies:

- **Registration**: Users register with an invitation code (admin can generate these)
- **Login**: Email/password authentication with JWT token generation
- **Auth Context**: React context provides authentication state to components
- **Protected Routes**: Routes that require authentication
- **Admin Routes**: Routes that require admin privileges

### Database Schema

The system uses Prisma ORM with PostgreSQL. Key tables include:

- `users`: User accounts and preferences
- `invitation_codes`: One-time codes for registration
- `account_categories`: Categories for organizing accounts
- `accounts`: Financial accounts (bank accounts, credit cards, etc.)
- `transactions`: Financial transactions
- `transaction_entries`: Individual debit/credit entries for transactions
- `debts`: Debt tracking entities
- `debt_payments`: Payments made toward debts

## License

MIT
