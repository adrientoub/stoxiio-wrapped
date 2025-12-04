import { api } from './api.js';
import { slides } from './slides.js';
import type { WrappedData, Currency, Portfolio, PortfolioProfit } from './types.js';

// DOM Elements
const loginScreen = document.getElementById('login-screen')!;
const loadingScreen = document.getElementById('loading-screen')!;
const wrappedContainer = document.getElementById('wrapped-container')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginError = document.getElementById('login-error')!;
const loadingBarFill = document.querySelector('.loading-bar-fill') as HTMLElement;
const loadingStatus = document.querySelector('.loading-status')!;
const slidesContainer = document.getElementById('slides-container')!;
const progressDots = document.getElementById('progress-dots')!;
const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;

let currentSlide = 0;
let wrappedData: WrappedData | null = null;

// Screen transitions
function showScreen(screen: HTMLElement) {
  [loginScreen, loadingScreen, wrappedContainer].forEach(s => {
    s.classList.remove('active');
  });
  screen.classList.add('active');
}

// Loading progress
function updateLoadingProgress(percent: number, status: string) {
  loadingBarFill.style.width = `${percent}%`;
  loadingStatus.textContent = status;
}

// Fetch all data
async function fetchAllData(): Promise<WrappedData> {
  const year = new Date().getFullYear().toString();
  const previousYear = (new Date().getFullYear() - 1).toString();

  updateLoadingProgress(10, 'Fetching your profile...');
  const user = await api.getUserInfo();

  updateLoadingProgress(20, 'Loading currencies...');
  const currencies = await api.getCurrencies();
  const userCurrency = currencies.find(c => c.currencyId === user.currencyId) || currencies[0];

  updateLoadingProgress(35, 'Fetching portfolios...');
  const portfolios = await api.getPortfolios();

  updateLoadingProgress(50, 'Calculating portfolio summary...');
  const portfolioSummary = await api.getPortfoliosSummary();

  updateLoadingProgress(65, 'Loading your goals...');
  const goals = await api.getGoals();

  updateLoadingProgress(80, 'Analyzing income statements...');
  const incomeStatement = await api.getIncomeStatements();

  updateLoadingProgress(95, 'Crunching final numbers...');

  // Calculate derived values
  const yearlyProfits = incomeStatement.portfolioProfitsByYear[year] || [];
  const previousYearProfits = incomeStatement.portfolioProfitsByYear[previousYear] || [];
  const yearlyDividends = incomeStatement.dividendIncomeStatementsByYear[year] || [];
  const yearlyIncomes = incomeStatement.incomesByYear[year] || [];
  const yearlyExpenses = incomeStatement.expensesByYear[year] || [];
  const yearlyVestings = incomeStatement.vestingsByYear[year] || [];

  const yearlyProfit = yearlyProfits.reduce((sum, p) => sum + p.totalAmountInUserCurrency, 0);
  const previousYearProfit = previousYearProfits.reduce((sum, p) => sum + p.totalAmountInUserCurrency, 0);
  const totalDividends = yearlyDividends.reduce((sum, d) => sum + d.totalAmountInUserCurrency, 0);
  const totalIncome = yearlyIncomes.reduce((sum, i) => sum + i.totalAmountInUserCurrency, 0);
  const totalExpenses = yearlyExpenses.reduce((sum, e) => sum + e.totalAmountInUserCurrency, 0);
  const totalVestings = yearlyVestings.reduce((sum, v) => sum + v.totalAmountInUserCurrency, 0);

  // Calculate total portfolio value from summary
  let totalPortfolioValue = 0;
  if (portfolioSummary && Array.isArray(portfolioSummary)) {
    totalPortfolioValue = portfolioSummary.reduce((sum: number, p: any) => {
      return sum + (p.currentValueInUserCurrency || p.currentValue || 0);
    }, 0);
  } else if (portfolioSummary?.totalValue) {
    totalPortfolioValue = portfolioSummary.totalValue;
  } else {
    // Fallback: estimate from portfolios
    totalPortfolioValue = portfolios.reduce((sum, p: any) => {
      return sum + (p.currentValueInUserCurrency || p.currentValue || p.totalValue || 0);
    }, 0);
  }

  // Calculate yearly profit percentage (estimate)
  const totalInvested = totalPortfolioValue - yearlyProfit;
  const yearlyProfitPercentage = totalInvested > 0 ? (yearlyProfit / totalInvested) * 100 : 0;

  // Find best performing portfolio
  let bestPerformingPortfolio: Portfolio | null = null;
  if (yearlyProfits.length > 0) {
    const bestProfit = yearlyProfits.reduce((best, current) =>
      current.totalAmountInUserCurrency > best.totalAmountInUserCurrency ? current : best
    );
    const portfolioMatch = portfolios.find((p: any) => p.portfolioId === bestProfit.portfolioId);
    if (portfolioMatch) {
      bestPerformingPortfolio = {
        ...portfolioMatch,
        profit: bestProfit.totalAmountInUserCurrency,
      } as Portfolio;
    }
  }

  // Aggregate dividends by stock
  const dividendsByStock = new Map<string, number>();
  yearlyDividends.forEach(d => {
    const current = dividendsByStock.get(d.symbol) || 0;
    dividendsByStock.set(d.symbol, current + d.totalAmountInUserCurrency);
  });

  const topDividendStocks = Array.from(dividendsByStock.entries())
    .map(([symbol, amount]) => ({ symbol, amount }))
    .sort((a, b) => b.amount - a.amount);

  updateLoadingProgress(100, 'Ready!');

  return {
    user,
    currencies,
    userCurrency,
    portfolios,
    portfolioSummary,
    goals,
    incomeStatement,
    totalPortfolioValue,
    yearlyProfit,
    yearlyProfitPercentage,
    previousYearProfit,
    totalDividends,
    totalIncome,
    totalExpenses,
    totalVestings,
    bestPerformingPortfolio,
    topDividendStocks,
  };
}

// Render slides
function renderSlides(data: WrappedData) {
  slidesContainer.innerHTML = '';
  progressDots.innerHTML = '';

  slides.forEach((slide, index) => {
    // Create slide element
    const slideEl = document.createElement('div');
    slideEl.className = `slide ${slide.gradient}`;
    slideEl.id = `slide-${slide.id}`;
    slideEl.innerHTML = slide.render(data);

    if (index === 0) {
      slideEl.classList.add('active');
    }

    slidesContainer.appendChild(slideEl);

    // Create progress dot
    const dot = document.createElement('div');
    dot.className = `progress-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    progressDots.appendChild(dot);
  });

  updateNavButtons();
}

// Navigation
function goToSlide(index: number) {
  if (index < 0 || index >= slides.length) return;

  const slideElements = slidesContainer.querySelectorAll('.slide');
  const dots = progressDots.querySelectorAll('.progress-dot');

  slideElements.forEach((slide, i) => {
    slide.classList.remove('active', 'prev');
    if (i < index) {
      slide.classList.add('prev');
    } else if (i === index) {
      slide.classList.add('active');
    }
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  currentSlide = index;
  updateNavButtons();
}

function updateNavButtons() {
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === slides.length - 1;
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

// Event listeners
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnText = loginForm.querySelector('.btn-text') as HTMLElement;
  const btnLoading = loginForm.querySelector('.btn-loading') as HTMLElement;

  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';
  loginError.textContent = '';

  try {
    await api.authenticate(emailInput.value, passwordInput.value);

    showScreen(loadingScreen);

    wrappedData = await fetchAllData();

    // Small delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    renderSlides(wrappedData);
    showScreen(wrappedContainer);

  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = error instanceof Error ? error.message : 'Login failed. Please try again.';
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
});

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!wrappedContainer.classList.contains('active')) return;

  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

slidesContainer?.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

slidesContainer?.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (diff > swipeThreshold) {
    nextSlide();
  } else if (diff < -swipeThreshold) {
    prevSlide();
  }
}

// Initialize
console.log('🎉 Finance Wrapped loaded!');
