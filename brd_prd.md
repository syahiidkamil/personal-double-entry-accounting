# Business Requirements Document (BRD)

## Project Overview
A streamlined personal double-entry accounting system that allows developers to track their finances with proper accounting principles. The application runs locally using SQLite and focuses on essential features for financial awareness.

## User Personas

**Primary Persona**: Financially-conscious developers seeking better personal financial control
- Has technical ability to run npm commands
- Values financial responsibility and awareness
- Can follow documentation without guided onboarding
- Wants proper double-entry accounting without corporate complexity

## Core Business Requirements

1. **Authentication System**
   - Simple email/password registration and login
   - JWT-based authentication
   - Single user role

2. **Account Management**
   - Create/view/edit financial accounts (cash, bank, e-wallet)
   - Create/view/edit liability accounts (debts, loans, credit cards)
   - Basic chart of accounts with proper accounting structure
   - Apply account templates for quick setup

3. **Transaction Management**
   - Record income and expenses with proper double-entry
   - Transfer funds between accounts
   - Import transactions from CSV
   - Record debt payments with principal/interest separation

4. **Debt Tracking**
   - Record debts with initial balance, interest rate, payment schedule
   - Track payment history on each debt
   - Calculate remaining balance and payment schedule
   - Handle late fees and extra payments

5. **Financial Reporting**
   - Generate balance sheet showing assets, liabilities, equity
   - Generate income statement (profit/loss)
   - Track monthly spending patterns
   - Calculate net worth over time

## Technical Requirements
- React-based frontend with responsive design
- Node.js backend with RESTful API
- SQLite database for local data storage
- JWT authentication
- Markdown documentation

# Product Requirements Document (PRD)

## Essential Features

### 1. Authentication
- **Login Screen**: Email and password fields with validation
- **Registration Screen**: Email, password, confirm password
- **JWT Token Storage**: Secure local storage with expiration

### 2. Dashboard
- **Financial Summary**: Total assets, liabilities, net worth
- **Recent Transactions**: Last 5 transactions
- **Account Balances**: Quick view of all account balances
- **Sidebar Navigation**: Access to all main features

### 3. Accounts Module
- **Account List**: Display all accounts with current balances
- **Create Account**: Form to add new accounts
  - Types: Asset (Cash, Bank, E-wallet) or Liability (Debt, Credit Card)
  - Required fields: Name, Type, Initial Balance, Currency
  - For debts: Optional fields for interest rate, due date, payment amount
- **Edit Account**: Modify existing account details
- **Account Templates**: Pre-configured sets of accounts

### 4. Transactions Module
- **Add Transaction**: Form with
  - Date
  - Description
  - Amount
  - From account (credit)
  - To account (debit)
  - Category (optional)
  - Notes (optional)
- **Transaction List**: Sortable and filterable history
- **Transfer Function**: Simplified form for moving money between accounts
- **Import Transactions**: CSV import with field mapping

### 5. Debt Management
- **Debt Dashboard**: List of all debts with remaining balances
- **Debt Details View**:
  - Total amount
  - Remaining balance
  - Payment history
  - Next payment due
- **Debt Payment Recording**:
  - Split between principal and interest automatically
  - Option to include late fees
  - Option for extra payments

### 6. Reports
- **Balance Sheet**: Assets, liabilities, and equity at a point in time
- **Income Statement**: Income and expenses over a period
- **Spending Report**: Categorized expenditures with charts
- **Net Worth Tracker**: Net worth history over time

## User Flows

### Adding a New Bank Account
1. User clicks "Accounts" in sidebar
2. Clicks "Add New Account" button
3. Selects "Bank Account" as type
4. Enters name, initial balance
5. Saves account
6. System creates asset account with opening balance

### Recording a Debt
1. User clicks "Accounts" in sidebar
2. Clicks "Add New Account" button
3. Selects "Loan" or "Credit Card" as liability type
4. Enters details including total amount, interest rate, payment schedule
5. Saves debt
6. System creates liability account with opening balance

### Making a Debt Payment
1. User navigates to "Transactions"
2. Clicks "Add Transaction" or "Pay Debt" shortcut
3. Selects debt account and payment source
4. Enters payment amount
5. System automatically splits transaction between principal and interest
6. Balances update accordingly on both accounts

### Transferring Between Accounts
1. User navigates to "Transactions"
2. Clicks "Transfer" button
3. Selects source and destination accounts
4. Enters amount and date
5. Completes transfer
6. Both account balances update

## Documentation Requirements
- README.md with setup instructions
- ACCOUNTING.md explaining double-entry principles
- API documentation for endpoints
- Database schema documentation

This streamlined approach focuses on essential features while maintaining proper double-entry accounting principles, making it suitable for technically-capable users who want financial clarity without unnecessary complexity.