import type { WrappedData, Currency } from "./types.js";
import confetti from "canvas-confetti";

export interface SlideConfig {
  id: string;
  gradient: string;
  render: (data: WrappedData) => string;
  onShow?: (data: WrappedData) => void;
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

// Confetti helpers
const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF4500', '#1DB954', '#1E90FF']
  });
};

const triggerFireworks = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
};

export const slides: SlideConfig[] = [
  // Intro slide
  {
    id: "intro",
    gradient: "from-indigo-600 to-purple-700",
    render: (data) => `
      <div class="flex flex-col items-center justify-center h-full text-center p-6 max-w-2xl mx-auto">
        <div class="text-8xl mb-6 animate-bounce">🎉</div>
        <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4 animate-fade-in-up">Welcome back</div>
        <div class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in-up delay-100">
          Ready to see how your finances did in <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500">${getYear()}</span>?
        </div>
        <div class="text-4xl md:text-6xl font-black text-white mb-8 animate-scale-in delay-200">
          ${data.user.email.split("@")[0]}
        </div>
        <div class="text-xl text-white/80 animate-fade-in-up delay-300">Let's dive into your financial year...</div>
      </div>
    `,
    onShow: () => {
      triggerConfetti();
    }
  },

  // Total Portfolio Value
  {
    id: "portfolio-value",
    gradient: "from-blue-600 to-cyan-500",
    render: (data) => `
      <div class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="text-7xl mb-6 animate-pulse">💼</div>
        <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Total Portfolio Value</div>
        <div class="text-2xl text-white/90 mb-4">Your investments are now worth</div>
        <div class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-6 tracking-tight">
          ${formatCurrency(data.totalPortfolioValue, data.userCurrency)}
        </div>
        <div class="text-xl text-white/70 mb-8">Across ${data.portfolios.length} portfolio${data.portfolios.length !== 1 ? "s" : ""}</div>

        <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 ${data.totalProfit >= 0 ? "text-green-400" : "text-red-400"} font-bold text-xl animate-bounce-in">
          <span>${data.totalProfit >= 0 ? "▲" : "▼"}</span>
          <span>${formatCurrency(data.totalProfit, data.userCurrency)}</span>
          <span class="opacity-70">(${formatPercentage(data.totalProfitPercent)})</span>
        </div>
      </div>
    `,
  },

  // Portfolio breakdown
  {
    id: "portfolio-breakdown",
    gradient: "from-pink-600 to-rose-500",
    render: (data) => {
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
          const isProfit = p.totalProfitMainCurrency >= 0;

          return `
          <div class="flex items-center p-4 bg-white/10 rounded-xl mb-3 hover:bg-white/20 transition-all transform hover:scale-[1.02] cursor-default group">
            <div class="text-2xl font-black text-white/30 w-12 group-hover:text-white/50 transition-colors">#${i + 1}</div>
            <div class="flex-1 text-left">
              <div class="font-bold text-lg text-white">${p.name}</div>
              <div class="text-xs font-medium ${isProfit ? "text-green-300" : "text-red-300"}">
                ${isProfit ? "+" : ""}${formatCurrency(p.totalProfitMainCurrency, data.userCurrency)} (${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(0)}%)
              </div>
            </div>
            <div class="font-bold text-xl text-white">${formatCurrency(currentValue, data.userCurrency)}</div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 w-full max-w-3xl mx-auto">
          <div class="text-6xl mb-6">📊</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Portfolio Breakdown</div>
          <div class="text-3xl font-bold text-white mb-8">Your portfolios by value</div>
          <div class="w-full space-y-2 animate-slide-up">
            ${portfolioList}
          </div>
        </div>
      `;
    },
  },

  // Yearly Performance
  {
    id: "yearly-performance",
    gradient: "from-emerald-600 to-teal-500",
    render: (data) => {
      const isPositive = data.yearlyProfit >= 0;
      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6 animate-wiggle">${isPositive ? "📈" : "📉"}</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">${getYear()} Performance</div>
          <div class="text-3xl text-white mb-4">This year your portfolios ${isPositive ? "gained" : "lost"}</div>

          <div class="text-7xl md:text-9xl font-black mb-4 ${isPositive ? "text-green-300" : "text-red-300"} drop-shadow-lg">
            ${formatCurrency(data.yearlyProfit, data.userCurrency)}
          </div>

          <div class="text-2xl font-bold text-white/80 mb-12 bg-white/10 px-6 py-2 rounded-full">
            ${formatPercentage(data.yearlyProfitPercentage)} return
          </div>

          <div class="flex gap-8 w-full max-w-lg">
            <div class="flex-1 bg-black/20 p-6 rounded-2xl backdrop-blur-sm">
              <div class="text-sm text-white/50 mb-2">${getYear() - 1}</div>
              <div class="text-2xl font-bold text-white">${formatCurrency(data.previousYearProfit, data.userCurrency)}</div>
            </div>
            <div class="flex-1 bg-white/20 p-6 rounded-2xl backdrop-blur-sm border border-white/30 transform scale-110 shadow-xl">
              <div class="text-sm text-white/80 mb-2">${getYear()}</div>
              <div class="text-3xl font-bold text-white">${formatCurrency(data.yearlyProfit, data.userCurrency)}</div>
            </div>
          </div>
        </div>
      `;
    },
    onShow: (data) => {
      if (data.yearlyProfit > 0) triggerConfetti();
    }
  },

  // Profit History
  {
    id: "profit-history",
    gradient: "from-violet-600 to-fuchsia-600",
    render: (data) => {
      const profits = data.profitByYear.filter((p) => p.year !== "null" && p.profit !== null);
      const recentProfits = profits.slice(-5);

      const barsHtml = recentProfits
        .map((p) => {
          const maxProfit = Math.max(...recentProfits.map((r) => Math.abs(r.profit)));
          const height = Math.min(100, (Math.abs(p.profit) / maxProfit) * 100);
          const isPositive = p.profit >= 0;

          // Find percentage for this year
          const percentageData = data.percentageByYear.find(pc => pc.year === p.year);
          const percentage = percentageData ? percentageData.percentage : 0;

          return `
          <div class="flex flex-col items-center gap-1 flex-1 h-full justify-end group">
            <div class="flex flex-col items-center mb-2 animate-fade-in-up">
               <div class="text-xs font-bold ${isPositive ? "text-green-300" : "text-red-300"}">
                ${formatCurrency(p.profit, data.userCurrency)}
              </div>
              <div class="text-[10px] font-bold text-white/60">
                ${formatPercentage(percentage)}
              </div>
            </div>
            <div class="relative w-full max-w-[60px] h-[160px] bg-black/20 rounded-t-xl flex items-end overflow-hidden">
              <div class="w-full transition-all duration-1000 ease-out ${isPositive ? "bg-gradient-to-t from-green-500 to-green-300" : "bg-gradient-to-t from-red-500 to-red-300"} group-hover:opacity-90" style="height: ${height}%"></div>
            </div>
            <div class="text-sm font-bold text-white/70">${p.year}</div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 w-full">
          <div class="text-6xl mb-6">📊</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Profit History</div>
          <div class="text-3xl font-bold text-white mb-8">Your portfolio gains over the years</div>
          <div class="flex items-end justify-center gap-4 h-[280px] w-full max-w-2xl relative">
            ${barsHtml}
          </div>
        </div>
      `;
    },
  },

  // Best Performing Portfolio
  {
    id: "best-portfolio",
    gradient: "from-amber-500 to-orange-600",
    render: (data) => {
      if (!data.bestPerformingPortfolio) {
        return `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="text-8xl mb-6">🏆</div>
            <div class="text-2xl font-bold text-white">No portfolio performance data available</div>
          </div>
        `;
      }

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div class="text-8xl mb-6 animate-bounce">🏆</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Top Performer of ${getYear()}</div>
          <div class="text-3xl text-white mb-8">Your best performing portfolio was</div>

          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div class="relative bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
              <div class="text-4xl md:text-6xl font-black text-white mb-4">${data.bestPerformingPortfolio.name}</div>
              <div class="text-2xl text-green-300 font-bold mb-2">
                ${formatCurrency(data.bestPerformingPortfolio.profit || 0, data.userCurrency)} profit this year
              </div>
              <div class="text-white/60">
                Total Value: ${formatCurrency(data.bestPerformingPortfolio.totalAmountMainCurrency + data.bestPerformingPortfolio.totalProfitMainCurrency, data.userCurrency)}
              </div>
            </div>
          </div>
        </div>
      `;
    },
    onShow: () => {
      triggerFireworks();
    }
  },

  // Dividends
  {
    id: "dividends",
    gradient: "from-green-600 to-emerald-700",
    render: (data) => {
      const topStocks = data.topDividendStocks.slice(0, 3);
      const stocksList =
        topStocks.length > 0
          ? `
          <div class="w-full max-w-md mt-8 space-y-3">
            ${topStocks
              .map(
                (stock, i) => `
              <div class="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">${i + 1}</div>
                  <div class="font-bold text-lg">${stock.symbol}</div>
                </div>
                <div class="font-mono font-bold text-green-300">${formatCurrency(stock.amount, data.userCurrency)}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
          : "";

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6 animate-pulse">💸</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Passive Income</div>
          <div class="text-3xl text-white mb-4">You received in dividends</div>
          <div class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-200 to-green-500 mb-4">
            ${formatCurrency(data.totalDividends, data.userCurrency)}
          </div>
          <div class="text-xl text-white/70 italic">Money while you sleep 😴</div>
          ${stocksList}
        </div>
      `;
    },
    onShow: () => {
      // Rain effect with money emojis? For now just confetti
      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          angle: 90,
          spread: 100,
          origin: { y: 0 },
          colors: ['#85bb65', '#ffffff']
        });
      }
    }
  },

  // Vestings (Stock Awards)
  {
    id: "vestings",
    gradient: "from-purple-800 to-indigo-900",
    render: (data) => {
      if (data.totalVestings === 0) {
        return `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="text-8xl mb-6">🎁</div>
            <div class="text-2xl font-bold text-white mb-2">No stock vestings this year</div>
            <div class="text-white/60">Maybe next year! 🤞</div>
          </div>
        `;
      }

      const vestings = data.vestingByYear.filter((v) => v.year !== "null" && v.vesting > 0);
      const recentVestings = vestings.slice(-4);
      const vestingHistory = recentVestings
        .map(
          (v) => `
        <div class="bg-white/10 p-4 rounded-xl text-center min-w-[100px]">
          <div class="text-sm text-white/50 mb-1">${v.year}</div>
          <div class="font-bold text-white">${formatCurrency(v.vesting, data.userCurrency)}</div>
        </div>
      `,
        )
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6 animate-bounce">🎁</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Stock Vestings</div>
          <div class="text-3xl text-white mb-6">Your stock awards vested worth</div>
          <div class="text-6xl md:text-8xl font-black text-purple-300 mb-6 drop-shadow-lg">
            ${formatCurrency(data.totalVestings, data.userCurrency)}
          </div>
          <div class="text-xl text-white/80 mb-12">Equity compensation for the win! 🚀</div>
          <div class="flex flex-wrap justify-center gap-4">
            ${vestingHistory}
          </div>
        </div>
      `;
    },
  },

  // Income vs Expenses
  {
    id: "income-expenses",
    gradient: "from-slate-800 to-slate-900",
    render: (data) => {
      const savings = data.totalIncome + data.totalExpenses; // expenses are negative
      const savingsRate = data.totalIncome > 0 ? (savings / data.totalIncome) * 100 : 0;

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6">💰</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Cash Flow</div>
          <div class="text-3xl text-white mb-12">Your income vs expenses</div>

          <div class="flex gap-8 mb-12 w-full max-w-2xl">
            <div class="flex-1 bg-green-500/20 p-6 rounded-2xl border border-green-500/30">
              <div class="text-sm uppercase tracking-wider text-green-300 mb-2">Income</div>
              <div class="text-2xl md:text-4xl font-bold text-white">${formatCurrency(data.totalIncome, data.userCurrency)}</div>
            </div>
            <div class="flex-1 bg-red-500/20 p-6 rounded-2xl border border-red-500/30">
              <div class="text-sm uppercase tracking-wider text-red-300 mb-2">Expenses</div>
              <div class="text-2xl md:text-4xl font-bold text-white">${formatCurrency(Math.abs(data.totalExpenses), data.userCurrency)}</div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-xl w-full">
            <div class="text-xl text-white/70 mb-2">${savings >= 0 ? "You Saved" : "You Overspent"}</div>
            <div class="text-5xl font-black ${savings >= 0 ? "text-green-400" : "text-red-400"} mb-4">
              ${formatCurrency(Math.abs(savings), data.userCurrency)}
            </div>
            <div class="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-bold">
              ${savingsRate.toFixed(0)}% savings rate
            </div>
          </div>
        </div>
      `;
    },
  },

  // Income Evolution
  {
    id: "income-evolution",
    gradient: "from-blue-800 to-indigo-900",
    render: (data) => {
      const incomes = data.incomeByYear.filter((i) => i.year !== "null" && i.income > 0);
      const recentIncomes = incomes.slice(-5);

      if (recentIncomes.length < 2) {
        return `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="text-8xl mb-6">📈</div>
            <div class="text-2xl font-bold text-white">Not enough income data to show evolution</div>
          </div>
        `;
      }

      const firstYear = recentIncomes[0];
      const lastYear = recentIncomes[recentIncomes.length - 1];
      const growth = ((lastYear.income - firstYear.income) / firstYear.income) * 100;

      const incomeList = recentIncomes
        .map(
          (i) => `
        <div class="flex justify-between items-center p-3 border-b border-white/10 last:border-0">
          <div class="font-medium text-white/60">${i.year}</div>
          <div class="font-bold text-white">${formatCurrency(i.income, data.userCurrency)}</div>
        </div>
      `,
        )
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6">💵</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Income Evolution</div>
          <div class="text-3xl text-white mb-8">Your income over the years</div>

          <div class="text-6xl font-black ${growth >= 0 ? "text-green-400" : "text-red-400"} mb-2">
            ${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%
          </div>
          <div class="text-white/60 mb-12">since ${firstYear.year}</div>

          <div class="bg-black/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-sm">
            ${incomeList}
          </div>
        </div>
      `;
    },
  },

  // Goals Progress
  {
    id: "goals",
    gradient: "from-teal-600 to-cyan-700",
    render: (data) => {
      if (data.goals.length === 0) {
        return `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="text-8xl mb-6">🎯</div>
            <div class="text-2xl font-bold text-white mb-2">No goals set yet</div>
            <div class="text-white/60">Set some goals to track your progress!</div>
          </div>
        `;
      }

      const goalsHtml = data.goals
        .slice(0, 3)
        .map((goal) => {
          const progress = Math.min(100, (data.totalPortfolioValue / goal.targetAmount) * 100);
          const targetDate = new Date(goal.targetDate);
          const yearsLeft = Math.max(0, (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365));

          return `
          <div class="bg-white/10 rounded-2xl p-6 mb-4 w-full">
            <div class="flex justify-between items-end mb-2">
              <span class="font-bold text-xl">${goal.name}</span>
              <span class="font-bold text-2xl text-cyan-300">${progress.toFixed(0)}%</span>
            </div>
            <div class="h-3 bg-black/20 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
            </div>
            <div class="flex justify-between text-sm text-white/60">
              <span>${formatCurrency(data.totalPortfolioValue, data.userCurrency)}</span>
              <span>Target: ${formatCurrency(goal.targetAmount, data.userCurrency)} (${yearsLeft.toFixed(1)}y left)</span>
            </div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 w-full max-w-2xl mx-auto">
          <div class="text-8xl mb-6">🎯</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Financial Goals</div>
          <div class="text-3xl text-white mb-8">Your progress towards your dreams</div>
          <div class="w-full">
            ${goalsHtml}
          </div>
        </div>
      `;
    },
  },

  // Future Vestings
  {
    id: "future-vestings",
    gradient: "from-cyan-600 to-blue-700",
    render: (data) => {
      const futureVestings = data.futureVestings || [];

      if (futureVestings.length === 0) {
        return `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="text-8xl mb-6">🔮</div>
            <div class="text-2xl font-bold text-white mb-2">What's next?</div>
            <div class="text-white/60">No upcoming vestings scheduled yet.</div>
          </div>
        `;
      }

      const nextYears = futureVestings.slice(0, 3);
      let totalFutureVesting = 0;

      const vestingList = nextYears
        .map((v) => {
          totalFutureVesting += v.amount;
          return `
          <div class="flex justify-between items-center p-4 bg-white/10 rounded-xl mb-3">
            <div class="font-bold text-xl text-white">${v.year}</div>
            <div class="font-bold text-xl text-cyan-300">${formatCurrency(v.amount, data.userCurrency)}</div>
          </div>
        `;
        })
        .join("");

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 w-full max-w-2xl mx-auto">
          <div class="text-8xl mb-6 animate-pulse">🔮</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">What's Next?</div>
          <div class="text-3xl text-white mb-8">Upcoming stock vestings</div>

          <div class="w-full mb-8">
            ${vestingList}
          </div>

          <div class="text-xl text-white/80">
            Total upcoming value: <span class="font-bold text-white">${formatCurrency(totalFutureVesting, data.userCurrency)}</span>
          </div>
          <div class="text-sm text-white/50 mt-2">(Estimated based on current prices)</div>
        </div>
      `;
    },
  },

  // Summary / Final Slide
  {
    id: "summary",
    gradient: "from-fuchsia-600 to-purple-600",
    render: (data) => {
      const totalGains = data.yearlyProfit + data.totalDividends + data.totalVestings;

      return `
        <div class="flex flex-col items-center justify-center h-full text-center p-6">
          <div class="text-8xl mb-6 animate-spin-slow">✨</div>
          <div class="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-4">${getYear()} Wrapped</div>
          <div class="text-3xl text-white mb-6">Your total financial gains this year</div>
          <div class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 mb-12 drop-shadow-2xl">
            ${formatCurrency(totalGains, data.userCurrency)}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div class="bg-white/10 p-4 rounded-xl flex justify-between items-center">
              <span class="text-white/70">Portfolio Gains</span>
              <span class="font-bold">${formatCurrency(data.yearlyProfit, data.userCurrency)}</span>
            </div>
            <div class="bg-white/10 p-4 rounded-xl flex justify-between items-center">
              <span class="text-white/70">Dividends</span>
              <span class="font-bold">${formatCurrency(data.totalDividends, data.userCurrency)}</span>
            </div>
            <div class="bg-white/10 p-4 rounded-xl flex justify-between items-center">
              <span class="text-white/70">Vestings</span>
              <span class="font-bold">${formatCurrency(data.totalVestings, data.userCurrency)}</span>
            </div>
            <div class="bg-white/10 p-4 rounded-xl flex justify-between items-center">
              <span class="text-white/70">Net Savings</span>
              <span class="font-bold">${formatCurrency(data.totalIncome + data.totalExpenses, data.userCurrency)}</span>
            </div>
          </div>

          <div class="mt-12 text-xl text-white/80 font-medium">
            Here's to an even better ${getYear() + 1}! 🥂
          </div>

          <button class="mt-8 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl" onclick="window.location.reload()">
            Watch Again
          </button>
        </div>
      `;
    },
    onShow: () => {
      triggerFireworks();
    }
  },
];
