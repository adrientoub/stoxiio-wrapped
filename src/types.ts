// API Types
export interface User {
  email: string;
  creationDate: number;
  lastConnectionDate: number;
  currencyId: number;
}

export interface AuthResponse {
  refreshToken: string | null;
  accessToken: string;
  user: User | null;
}

export interface Currency {
  currencyId: number;
  shortName: string;
  symbol: string;
}

export interface Portfolio {
  portfolioId: number;
  name: string;
  currencyId: number;
  totalValue?: number;
  totalInvested?: number;
  profit?: number;
  profitPercentage?: number;
  holdings?: Holding[];
}

export interface Holding {
  symbol: string;
  name?: string;
  quantity: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  profitPercentage: number;
  portfolios: Portfolio[];
}

export interface Goal {
  goalId: string;
  name: string;
  targetDate: number;
  targetAmount: number;
  currencyId: number;
  currentAmount?: number;
}

export interface IncomeStatement {
  years: number[];
  dividendIncomeStatementsByYear: Record<string, DividendEntry[]>;
  portfolioProfitsByYear: Record<string, PortfolioProfit[]>;
  incomesByYear: Record<string, IncomeEntry[]>;
  expensesByYear: Record<string, ExpenseEntry[]>;
  vestingsByYear: Record<string, VestingEntry[]>;
}

export interface DividendEntry {
  portfolioId: number;
  symbol: string;
  buyDate: number;
  currencyId: number;
  totalAmount: number;
  totalAmountInUserCurrency: number;
  exchangeRate: number;
}

export interface PortfolioProfit {
  portfolioId: number;
  totalAmountInUserCurrency: number;
}

export interface IncomeEntry {
  dashboardId: number;
  totalAmountInUserCurrency: number;
}

export interface ExpenseEntry {
  dashboardId: number;
  totalAmountInUserCurrency: number;
}

export interface VestingEntry {
  portfolioId: number;
  totalAmountInUserCurrency: number;
}

export interface Dashboard {
  dashboardId: number;
  name: string;
  unit: string;
  tracked: boolean;
  currencyId: number;
  template: number;
  dataSets: DataSet[];
}

export interface DataSet {
  dataSetId: number;
  name: string;
  entries: DataSetEntry[];
  change?: number;
  changePercentage?: number;
}

export interface DataSetEntry {
  dataSetEntryId: number;
  label: string;
  value: number;
}

// Wrapped Data - processed for display
export interface WrappedData {
  user: User;
  currencies: Currency[];
  userCurrency: Currency;
  portfolios: Portfolio[];
  portfolioSummary: any;
  goals: Goal[];
  incomeStatement: IncomeStatement;

  // Computed values for display
  totalPortfolioValue: number;
  yearlyProfit: number;
  yearlyProfitPercentage: number;
  previousYearProfit: number;
  totalDividends: number;
  totalIncome: number;
  totalExpenses: number;
  totalVestings: number;
  bestPerformingPortfolio: Portfolio | null;
  topDividendStocks: { symbol: string; amount: number }[];
}
