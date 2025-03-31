# Accounting for Non-Accountants

This guide explains fundamental accounting concepts for software developers and non-finance professionals building a personal double-entry accounting system.

## Accounting Fundamentals

### What is Double-Entry Accounting?

Double-entry accounting is a system where every transaction affects at least two accounts. For each transaction:
- At least one account is debited
- At least one account is credited
- Total debits must equal total credits

This method ensures balanced books and helps catch errors.

### The Accounting Equation

The foundation of double-entry accounting is:

```
Assets = Liabilities + Equity
```

This equation must always remain balanced.

## Account Types

### 1. Assets (Things You Own)

Assets are resources with economic value that you own or control.

Examples:
- Cash and bank accounts
- Investments (stocks, bonds, mutual funds)
- Property and possessions
- Accounts receivable (money owed to you)
- Digital assets (PayPal balances, cryptocurrencies)

Asset accounts normally have debit balances (increase with debits, decrease with credits).

### 2. Liabilities (Things You Owe)

Liabilities are obligations and debts you owe to others.

Examples:
- Credit card balances
- Loans (personal, auto, student)
- Mortgages
- Unpaid bills
- Taxes owed

Liability accounts normally have credit balances (increase with credits, decrease with debits).

### 3. Equity (Your Net Worth)

Equity represents your financial interest in your assets after deducting liabilities.

In personal accounting, equity accounts include:
- Opening balance equity (initial net worth)
- Retained earnings (accumulated savings/losses)
- Drawing accounts (personal withdrawals)

Equity accounts normally have credit balances (increase with credits, decrease with debits).

### 4. Income/Revenue (Money Coming In)

Income accounts track money you earn.

Examples:
- Salary and wages
- Interest income
- Dividend income
- Rental income
- Side business revenue

Income accounts normally have credit balances (increase with credits, decrease with debits).

### 5. Expenses (Money Going Out)

Expense accounts track costs and expenditures.

Examples:
- Rent/mortgage payments
- Utilities
- Groceries
- Entertainment
- Transportation

Expense accounts normally have debit balances (increase with debits, decrease with credits).

## Debits and Credits

The terms "debit" and "credit" can be confusing because they don't always mean what they do in everyday banking.

In accounting:
- Debit means left side of the ledger
- Credit means right side of the ledger

Their effect depends on the account type:

| Account Type | Debit Effect | Credit Effect |
|--------------|--------------|---------------|
| Asset        | Increase ↑   | Decrease ↓    |
| Liability    | Decrease ↓   | Increase ↑    |
| Equity       | Decrease ↓   | Increase ↑    |
| Income       | Decrease ↓   | Increase ↑    |
| Expense      | Increase ↑   | Decrease ↓    |

## Transaction Examples

### Example 1: Receiving Salary

When you receive your $3,000 salary:

```
Debit: Checking Account (Asset) $3,000
Credit: Salary Income (Income) $3,000
```

This transaction increases your checking account (an asset) and records income from your salary.

### Example 2: Paying Rent

When you pay $1,000 for rent:

```
Debit: Rent Expense (Expense) $1,000
Credit: Checking Account (Asset) $1,000
```

This transaction records the expense and reduces your checking account balance.

### Example 3: Credit Card Purchase

When you buy $100 of groceries with a credit card:

```
Debit: Grocery Expense (Expense) $100
Credit: Credit Card (Liability) $100
```

This transaction records the expense and increases your credit card liability.

### Example 4: Paying a Credit Card Bill

When you pay $500 toward your credit card:

```
Debit: Credit Card (Liability) $500
Credit: Checking Account (Asset) $500
```

This transaction reduces both your checking account balance and your credit card liability.

## Handling Multi-Currency Transactions

For multi-currency personal accounting:

1. **Basic Approach**: Record transactions in their original currency without conversion
   - Pros: Simple, accurate record of actual amounts
   - Cons: Doesn't give unified view of finances

2. **Main Currency Approach**: Convert all transactions to a main currency
   - Pros: Consistent reporting, easier analysis
   - Cons: Exchange rate fluctuations can distort historical data

3. **Dual Recording**: Record both original currency and converted amount
   - Pros: Complete information, flexible reporting
   - Cons: More complex to implement

For a personal system, starting with the basic approach and adding conversion capabilities later is often practical.

## Debt Management in Personal Accounting

Debts are tracked as liability accounts with additional properties:

- **Principal**: Original borrowed amount
- **Current Balance**: Amount still owed
- **Interest Rate**: Annual percentage rate
- **Terms**: Payment schedule, minimum payments
- **Extra Attributes**: Origination date, maturity date, loan type

To properly track a debt:

1. Create a liability account for each debt
2. Record regular payments as:
   ```
   Debit: Loan Liability (reduces the liability)
   Debit: Interest Expense (for the interest portion)
   Credit: Checking Account (for the full payment amount)
   ```

## Basic Financial Reports

### 1. Balance Sheet

Shows your financial position at a point in time:
- Lists all assets, liabilities, and equity
- Must always balance (Assets = Liabilities + Equity)
- Snapshot of net worth

### 2. Income Statement (Profit & Loss)

Shows your income and expenses over a period:
- Lists all income and expense accounts
- Shows net income (profit) or loss
- Helps track spending and saving patterns

### 3. Transaction Register

Detailed list of all transactions:
- Date, description, accounts, amounts
- Search and filter functionality
- Reconciliation status

## Chart of Accounts

A chart of accounts is a structured list of all accounts in your system. For personal finance, a simple structure might be:

```
1000-1999: ASSETS
  1000: Cash and Bank Accounts
    1010: Checking Account
    1020: Savings Account
    1030: Cash on Hand
  1100: Investments
    1110: Stock Investments
    1120: Retirement Accounts
  1200: Digital Assets
    1210: PayPal Balance
    1220: Cryptocurrency

2000-2999: LIABILITIES
  2000: Credit Cards
    2010: Visa Card
    2020: MasterCard
  2100: Loans
    2110: Auto Loan
    2120: Student Loan
    2130: Mortgage

3000-3999: EQUITY
  3000: Opening Balance Equity
  3100: Retained Earnings

4000-4999: INCOME
  4000: Salary & Wages
  4100: Investment Income
    4110: Interest
    4120: Dividends
  4200: Other Income

5000-5999: EXPENSES
  5000: Housing
    5010: Rent
    5020: Utilities
  5100: Food
    5110: Groceries
    5120: Dining Out
  5200: Transportation
    5210: Gas
    5220: Public Transit
  5300: Health
  5400: Entertainment
  5500: Debt Payments
    5510: Interest Expense
```

## Common Accounting Terms

- **Reconciliation**: Matching your records against external statements
- **Journal Entry**: The record of a transaction in the system
- **Ledger**: A collection of related accounts
- **Trial Balance**: A list of all accounts with their balances
- **Fiscal Period**: The time period covered by financial reports
- **Accrual**: Recording transactions when they occur, not when cash changes hands
- **Cash Basis**: Recording transactions only when cash changes hands
- **Depreciation**: Spreading the cost of an asset over its useful life

## Implementing in Software

When building personal accounting software:

1. **Data Integrity**: Ensure debits always equal credits
2. **Validation**: Prevent unbalanced transactions
3. **Account Structure**: Support hierarchy and classifications
4. **Date Handling**: Allow backdated transactions and future dating
5. **Reporting**: Enable flexible date ranges and filtering
6. **Categories**: Separate from the account structure for analysis

Remember that accounting rules are enforced by your application, not the database. Business logic should validate that transactions follow accounting principles.
