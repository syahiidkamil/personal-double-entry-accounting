# Next.js CSR Authentication Template

A comprehensive template for building client-side rendered (CSR) Next.js applications with authentication, protected routes, and a simple API.

## Features

- **Complete Authentication System**
  - Login and Registration
  - Protected Routes
  - Role-Based Access Control (Admin vs Regular Users)

- **API Integration**
  - Auth API (Login, Register)
  - Products API (CRUD operations)
  - Admin Dashboard

- **Modular Architecture**
  - Feature-based organization
  - Clean separation of concerns
  - Reusable components and hooks

- **Client-Side Rendering**
  - Tailwind CSS for styling
  - Responsive design
  - Optimized for performance

## Project Structure

The project follows a feature-based structure:

```
src/
├── components/        # Shared UI components
├── context/           # Global context providers
├── features/          # Feature modules
│   ├── auth/          # Authentication feature
│   ├── products/      # Products feature
│   └── admin/         # Admin dashboard feature
├── lib/               # Utility libraries
├── pages/             # Next.js pages and API routes
└── utils/             # Utility functions
```

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Authentication

The template uses a simple token-based authentication system with localStorage for persistence. In a production environment, you should implement proper JWT handling, HTTP-only cookies, and more secure authentication practices.

### Default Admin Account

- Email: admin@example.com
- Password: adminpassword

## API Routes

- `/api/auth/login`: POST - Authenticate user
- `/api/auth/register`: POST - Register new user
- `/api/products`: GET (public), POST (admin)
- `/api/products/[id]`: GET (public), PUT/DELETE (admin)

## Customization

This template is designed to be a starting point. You can:

- Replace the simple JSON database with MongoDB, PostgreSQL, etc.
- Enhance security with proper JWT implementation
- Add more features or expand existing ones
- Customize the UI to match your brand

## License

MIT
