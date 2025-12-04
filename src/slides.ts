import type { WrappedData, Currency } from "./types.js";

export interface SlideConfig {
  id: string;
  gradient: string;
  render: (data: WrappedData) => string;
}

function formatCurrency(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? "-" : "";

  if (currency.symbol.length === 1) {
    return `${sign}${currency.symbol}${formatted}`;
  }
  return `${sign}${formatted} ${currency.symbol}`;
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getYear(): number {
  return new Date().getFullYear();
}

export const slides: SlideConfig[] = [
  // Intro slide
  {
    id: "intro",
    gradient: "gradient-1",
    render: (data) => `
      <div class="slide-content">
        <div class="slide-icon">🎉</div>
        <div class="slide-label">Welcome back</div>
        <div class="slide-title">Ready to see how your finances did in ${getYear()}?</div>
        <div class="slide-value" style="font-size: 48px;">${data.user.email.split("@")[0]}</div>
        <div class="slide-subtitle">Let's dive into your financial year...</div>
      </div>
    `,
  },

  // Total Portfolio Value
  {
    id: "portfolio-value",
    gradient: "gradient-3",
    render: (data) => `
      <div class="slide-content">
        <div class="slide-icon">💼</div>
        <div class="slide-label">Total Portfolio Value</div>
        <div class="slide-title">Your investments are now worth</div>
        <div class="slide-value">${formatCurrency(data.totalPortfolioValue, data.userCurrency)}</div>
        <div class="slide-subtitle">Across ${data.portfolios.length} portfolio${data.portfolios.length !== 1 ? "s" : ""}</div>
        <div class="comparison-change ${data.totalProfit >= 0 ? "positive" : "negative"}">
          Total profit: ${formatCurrency(data.totalProfit, data.userCurrency)} (${formatPercentage(data.totalProfitPercent)})
        </div>
      </div>
    `,
  },

  // Portfolio breakdown
  {
    id: "portfolio-breakdown",
    gradient: "gradient-7",
    render: (data) => {
      // Sort by current value (invested + profit)
      const sortedPortfolios = [...data.portfolios].sort(
        (a, b) =>
          b.totalAmountMainCurrency +
          b.totalProfitMainCurrency -
          (a.totalAmountMainCurrency + a.totalProfitMainCurrency),
      );

      const portfolioList = sortedPortfolios
        .slice(0, 5)
        .map((p, i) => {
          const currentValue = p.totalAmountMainCurrency + p.totalProfitMainCurrency;
          const profitPercent = p.totalProfitPercentMainCurrency * 100;
          return `
          <div class="ranking-item">
            <div class="ranking-position">${i + 1}</div>
            <div class="ranking-info">
              <div class="ranking-name">${p.name}</div>
              <div class="ranking-subtitle" style="font-size: 12px; opacity: 0.7; color: ${p.totalProfitMainCurrency >= 0 ? "#4ade80" : "#f87171"}">
                ${p.totalProfitMainCurrency >= 0 ? "+" : ""}${formatCurrency(p.totalProfitMainCurrency, data.userCurrency)} (${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(0)}%)
              </div>
            </div>
            <div class="ranking-value">${formatCurrency(currentValue, data.userCurrency)}</div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="slide-content">
          <div class="slide-icon">📊</div>
          <div class="slide-label">Portfolio Breakdown</div>
          <div class="slide-title">Your portfolios by value</div>
          <div class="ranking-list">
            ${portfolioList}
          </div>
        </div>
      `;
    },
  },

  // Yearly Performance
  {
    id: "yearly-performance",
    gradient: "gradient-4",
    render: (data) => {
      const isPositive = data.yearlyProfit >= 0;
      return `
        <div class="slide-content">
          <div class="slide-icon">${isPositive ? "📈" : "📉"}</div>
          <div class="slide-label">${getYear()} Performance</div>
          <div class="slide-title">This year your portfolios ${isPositive ? "gained" : "lost"}</div>
          <div class="slide-value" style="color: ${isPositive ? "#4ade80" : "#f87171"}">
            ${formatCurrency(data.yearlyProfit, data.userCurrency)}
          </div>
          <div class="slide-subtitle">${formatPercentage(data.yearlyProfitPercentage)} return</div>

          <div class="comparison-container">
            <div class="comparison-item">
              <div class="comparison-year">${getYear() - 1}</div>
              <div class="comparison-value">${formatCurrency(data.previousYearProfit, data.userCurrency)}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-year">${getYear()}</div>
              <div class="comparison-value">${formatCurrency(data.yearlyProfit, data.userCurrency)}</div>
            </div>
          </div>
        </div>
      `;
    },
  },

  // Profit History
  {
    id: "profit-history",
    gradient: "gradient-8",
    render: (data) => {
      const profits = data.profitByYear.filter((p) => p.year !== "null" && p.profit !== null);
      const recentProfits = profits.slice(-5);

      const barsHtml = recentProfits
        .map((p) => {
          const maxProfit = Math.max(...recentProfits.map((r) => Math.abs(r.profit)));
          const height = Math.min(100, (Math.abs(p.profit) / maxProfit) * 100);
          const isPositive = p.profit >= 0;
          return `
          <div class="bar-item">
            <div class="bar-container">
              <div class="bar-fill ${isPositive ? "positive" : "negative"}" style="height: ${height}%"></div>
            </div>
            <div class="bar-label">${p.year}</div>
            <div class="bar-value" style="color: ${isPositive ? "#4ade80" : "#f87171"}">${formatCurrency(p.profit, data.userCurrency)}</div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="slide-content">
          <div class="slide-icon">📊</div>
          <div class="slide-label">Profit History</div>
          <div class="slide-title">Your portfolio gains over the years</div>
          <div class="bar-chart">
            ${barsHtml}
          </div>
        </div>
      `;
    },
  },

  // Best Performing Portfolio
  {
    id: "best-portfolio",
    gradient: "gradient-5",
    render: (data) => {
      if (!data.bestPerformingPortfolio) {
        return `
          <div class="slide-content">
            <div class="slide-icon">🏆</div>
            <div class="slide-label">Top Performer</div>
            <div class="slide-title">No portfolio performance data available</div>
          </div>
        `;
      }

      return `
        <div class="slide-content">
          <div class="slide-icon">🏆</div>
          <div class="slide-label">Top Performer of ${getYear()}</div>
          <div class="slide-title">Your best performing portfolio was</div>
          <div class="slide-value" style="font-size: 36px;">${data.bestPerformingPortfolio.name}</div>
          <div class="slide-subtitle">
            ${formatCurrency(data.bestPerformingPortfolio.profit || 0, data.userCurrency)} profit this year
          </div>
          <div class="comparison-change positive">
            Total value: ${formatCurrency(data.bestPerformingPortfolio.totalAmountMainCurrency + data.bestPerformingPortfolio.totalProfitMainCurrency, data.userCurrency)}
          </div>
        </div>
      `;
    },
  },

  // Dividends
  {
    id: "dividends",
    gradient: "gradient-2",
    render: (data) => {
      const topStocks = data.topDividendStocks.slice(0, 3);
      const stocksList =
        topStocks.length > 0
          ? `
          <div class="ranking-list">
            ${topStocks
              .map(
                (stock, i) => `
              <div class="ranking-item">
                <div class="ranking-position">${i + 1}</div>
                <div class="ranking-info">
                  <div class="ranking-name">${stock.symbol}</div>
                </div>
                <div class="ranking-value">${formatCurrency(stock.amount, data.userCurrency)}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : "";

      return `
        <div class="slide-content">
          <div class="slide-icon">💸</div>
          <div class="slide-label">Passive Income</div>
          <div class="slide-title">You received in dividends</div>
          <div class="slide-value">${formatCurrency(data.totalDividends, data.userCurrency)}</div>
          <div class="slide-subtitle">Money while you sleep 😴</div>
          ${stocksList}
        </div>
      `;
    },
  },

  // Vestings (Stock Awards)
  {
    id: "vestings",
    gradient: "gradient-8",
    render: (data) => {
      if (data.totalVestings === 0) {
        return `
          <div class="slide-content">
            <div class="slide-icon">🎁</div>
            <div class="slide-label">Stock Vestings</div>
            <div class="slide-title">No stock vestings this year</div>
            <div class="slide-subtitle">Maybe next year! 🤞</div>
          </div>
        `;
      }

      // Show vesting history
      const vestings = data.vestingByYear.filter((v) => v.year !== "null" && v.vesting > 0);
      const recentVestings = vestings.slice(-4);
      const vestingHistory = recentVestings
        .map(
          (v) => `
        <div class="comparison-item">
          <div class="comparison-year">${v.year}</div>
          <div class="comparison-value">${formatCurrency(v.vesting, data.userCurrency)}</div>
        </div>
      `,
        )
        .join("");

      return `
        <div class="slide-content">
          <div class="slide-icon">🎁</div>
          <div class="slide-label">Stock Vestings</div>
          <div class="slide-title">Your stock awards vested worth</div>
          <div class="slide-value">${formatCurrency(data.totalVestings, data.userCurrency)}</div>
          <div class="slide-subtitle">Equity compensation for the win! 🚀</div>
          <div class="comparison-container" style="flex-wrap: wrap">
            ${vestingHistory}
          </div>
        </div>
      `;
    },
  },

  // Income vs Expenses
  {
    id: "income-expenses",
    gradient: "gradient-4",
    render: (data) => {
      const savings = data.totalIncome + data.totalExpenses; // expenses are negative
      const savingsRate = data.totalIncome > 0 ? (savings / data.totalIncome) * 100 : 0;

      return `
        <div class="slide-content">
          <div class="slide-icon">💰</div>
          <div class="slide-label">Cash Flow</div>
          <div class="slide-title">Your income vs expenses</div>

          <div class="comparison-container">
            <div class="comparison-item">
              <div class="comparison-year">Income</div>
              <div class="comparison-value" style="color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3)">${formatCurrency(data.totalIncome, data.userCurrency)}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-year">Expenses</div>
              <div class="comparison-value" style="color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3)">${formatCurrency(Math.abs(data.totalExpenses), data.userCurrency)}</div>
            </div>
          </div>

          <div class="comparison-change ${savings >= 0 ? "positive" : "negative"}">
            ${savings >= 0 ? "Saved" : "Overspent"}: ${formatCurrency(Math.abs(savings), data.userCurrency)}
            <br>
            <span style="font-size: 14px; opacity: 0.8">${savingsRate.toFixed(0)}% savings rate</span>
          </div>
        </div>
      `;
    },
  },

  // Income Evolution
  {
    id: "income-evolution",
    gradient: "gradient-1",
    render: (data) => {
      const incomes = data.incomeByYear.filter((i) => i.year !== "null" && i.income > 0);
      const recentIncomes = incomes.slice(-5);

      if (recentIncomes.length < 2) {
        return `
          <div class="slide-content">
            <div class="slide-icon">📈</div>
            <div class="slide-label">Income Growth</div>
            <div class="slide-title">Not enough income data to show evolution</div>
          </div>
        `;
      }

      const firstYear = recentIncomes[0];
      const lastYear = recentIncomes[recentIncomes.length - 1];
      const growth = ((lastYear.income - firstYear.income) / firstYear.income) * 100;

      const incomeList = recentIncomes
        .map(
          (i) => `
        <div class="ranking-item">
          <div class="ranking-position">${i.year}</div>
          <div class="ranking-value">${formatCurrency(i.income, data.userCurrency)}</div>
        </div>
      `,
        )
        .join("");

      return `
        <div class="slide-content">
          <div class="slide-icon">💵</div>
          <div class="slide-label">Income Evolution</div>
          <div class="slide-title">Your income over the years</div>
          <div class="comparison-change ${growth >= 0 ? "positive" : "negative"}">
            ${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% since ${firstYear.year}
          </div>
          <div class="ranking-list" style="margin-top: 20px;">
            ${incomeList}
          </div>
        </div>
      `;
    },
  },

  // Goals Progress
  {
    id: "goals",
    gradient: "gradient-3",
    render: (data) => {
      if (data.goals.length === 0) {
        return `
          <div class="slide-content">
            <div class="slide-icon">🎯</div>
            <div class="slide-label">Financial Goals</div>
            <div class="slide-title">No goals set yet</div>
            <div class="slide-subtitle">Set some goals to track your progress!</div>
          </div>
        `;
      }

      // Calculate progress for each goal (estimate based on total portfolio)
      const goalsHtml = data.goals
        .slice(0, 3)
        .map((goal) => {
          const progress = Math.min(100, (data.totalPortfolioValue / goal.targetAmount) * 100);
          const targetDate = new Date(goal.targetDate);
          const yearsLeft = Math.max(0, (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365));

          return `
          <div class="progress-goal">
            <div class="progress-header">
              <span class="progress-name">${goal.name}</span>
              <span class="progress-percentage">${progress.toFixed(0)}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-amounts">
              <span>${formatCurrency(data.totalPortfolioValue, data.userCurrency)}</span>
              <span>${formatCurrency(goal.targetAmount, data.userCurrency)} (${yearsLeft.toFixed(0)}y left)</span>
            </div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="slide-content">
          <div class="slide-icon">🎯</div>
          <div class="slide-label">Financial Goals</div>
          <div class="slide-title">Your progress towards your dreams</div>
          <div class="progress-container">
            ${goalsHtml}
          </div>
        </div>
      `;
    },
  },

  // Summary / Final Slide
  {
    id: "summary",
    gradient: "gradient-8",
    render: (data) => {
      const totalGains = data.yearlyProfit + data.totalDividends + data.totalVestings;

      return `
        <div class="slide-content final-slide">
          <div class="slide-icon">✨</div>
          <div class="slide-label">${getYear()} Wrapped</div>
          <div class="slide-title">Your total financial gains this year</div>
          <div class="slide-value">${formatCurrency(totalGains, data.userCurrency)}</div>

          <div class="slide-detail">
            <div class="slide-detail-row">
              <span class="slide-detail-label">Portfolio Gains</span>
              <span class="slide-detail-value">${formatCurrency(data.yearlyProfit, data.userCurrency)}</span>
            </div>
            <div class="slide-detail-row">
              <span class="slide-detail-label">Dividends</span>
              <span class="slide-detail-value">${formatCurrency(data.totalDividends, data.userCurrency)}</span>
            </div>
            <div class="slide-detail-row">
              <span class="slide-detail-label">Vestings</span>
              <span class="slide-detail-value">${formatCurrency(data.totalVestings, data.userCurrency)}</span>
            </div>
            <div class="slide-detail-row">
              <span class="slide-detail-label">Net Savings</span>
              <span class="slide-detail-value">${formatCurrency(data.totalIncome + data.totalExpenses, data.userCurrency)}</span>
            </div>
          </div>

          <div class="slide-subtitle" style="margin-top: 24px">
            Here's to an even better ${getYear() + 1}! 🥂
          </div>
        </div>
      `;
    },
  },
];
