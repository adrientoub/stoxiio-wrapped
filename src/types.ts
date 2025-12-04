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

// Portfolio from /portfolios endpoint (array of portfolio objects)
export interface Portfolio {
  walletId: number;
  portfolioId?: number; // alias for walletId
  name: string;
  type: number;
  description: string;
  currencyId: number;
  countryId: number;
  lastUpdateDate: number;
  totalProfitMainCurrency: number;
  totalProfitPercentMainCurrency: number;
  totalAmountMainCurrency: number;
  includedInTotalWorth: boolean;
  stocks?: Stock[];
  profit?: number; // computed field for display
}

export interface Stock {
  stockId: number;
  stockExchangeId: number;
  currencyId: number;
  type: number;
  symbol: string;
  currencyName: string;
  currencySymbol: string;
  description: string;
  buyDate: number;
  vested: boolean;
  vestDate?: number;
  vestGroupId?: string;
  initialNumberOwned: number;
  numberOwned: number;
  totalAmount: number;
  totalAmountMainCurrency: number;
  pru: number;
  pruMainCurrency: number;
  currentPrice: number;
  currentPriceMainCurrency: number;
  change: number;
  changeMainCurrency: number;
  changePercent: number;
  totalProfit: number;
  totalProfitMainCurrency: number;
  totalProfitPercent: number;
  totalProfitPercentMainCurrency: number;
  lastUpdateDate: number;
  isMarketOpen: boolean;
}

// Portfolio Summary - array of chart objects
export interface PortfolioSummaryChart {
  id: string;
  name: string;
  type: string;
  stacked: boolean;
  currency: string;
  unitType: string;
  computeMinMax: boolean;
  computeChange: boolean;
  timeRangesFilterable: boolean;
  dataSets: ChartDataSet[];
}

export interface ChartDataSet {
  chartDataSetId: string;
  labelType: number;
  label: string;
  type: number;
  yType: number;
  data: ChartDataPoint[];
  metadata?: any;
}

export interface ChartDataPoint {
  x: string;
  y: number | null;
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
  incomeStatementByYearChart?: IncomeStatementChart;
}

export interface DividendEntry {
  portfolioId: number;
  symbol: string;
  buyDate: number;
  currencyId: number;
  mainCurrencyId: number | null;
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

export interface IncomeStatementChart {
  id: string;
  name: string;
  type: string;
  stacked: boolean;
  currency: string;
  unitType: string;
  dataSets: ChartDataSet[];
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

export interface Wealth {
  totalWealth: number;
  totalInvestments: number;
  totalUnvested: number;
  totalCash: number;
  totalDebt: number;
  totalRetirementAccounts: number;
  totalRealEstate: number;
  currencyId: number;
  charts: any[]; // We can define this more strictly if needed, but 'any' is fine for now
}

// Wrapped Data - processed for display
export interface WrappedData {
  user: User;
  currencies: Currency[];
  userCurrency: Currency;
  portfolios: Portfolio[];
  portfolioSummary: PortfolioSummaryChart[];
  goals: Goal[];
  incomeStatement: IncomeStatement;
  wealth: Wealth;

  // Computed values for display
  totalPortfolioValue: number;
  totalProfit: number;
  totalProfitPercent: number;
  yearlyProfit: number;
  yearlyProfitPercentage: number;
  previousYearProfit: number;
  totalDividends: number;
  totalIncome: number;
  totalExpenses: number;
  totalVestings: number;
  bestPerformingPortfolio: Portfolio | null;
  topDividendStocks: { symbol: string; amount: number }[];

  // Historical data from income statement chart
  incomeByYear: { year: string; income: number }[];
  expenseByYear: { year: string; expense: number }[];
  profitByYear: { year: string; profit: number }[];
  percentageByYear: { year: string; percentage: number }[];
  dividendByYear: { year: string; dividend: number }[];
  vestingByYear: { year: string; vesting: number }[];
  futureVestings: { year: string; amount: number }[];
}
