import type { AuthResponse, Currency, Portfolio, Goal, IncomeStatement, User } from "./types.js";

const API_BASE = "/api";

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error(`API error: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async authenticate(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/users/authenticate", {
      method: "POST",
      body: JSON.stringify({
        Email: email,
        Password: password,
        RememberMe: true,
      }),
    });

    if (response.accessToken) {
      this.setAccessToken(response.accessToken);
    }

    return response;
  }

  async getUserInfo(): Promise<User> {
    return this.request<User>("/users/info");
  }

  async getCurrencies(): Promise<Currency[]> {
    return this.request<Currency[]>("/currencies");
  }

  async getPortfolios(): Promise<Portfolio[]> {
    return this.request<Portfolio[]>("/portfolios");
  }

  async getPortfoliosSummary(): Promise<any> {
    return this.request<any>("/portfolios/summary");
  }

  async getPortfolio(portfolioId: number): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${portfolioId}`);
  }

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>("/goals");
  }

  async getIncomeStatements(): Promise<IncomeStatement> {
    return this.request<IncomeStatement>("/incomestatements");
  }

  async getDashboards(type?: number): Promise<any[]> {
    const query = type !== undefined ? `?types=${type}` : "";
    return this.request<any[]>(`/dashboards${query}`);
  }

  async getDashboard(dashboardId: number): Promise<any> {
    return this.request<any>(`/dashboards/${dashboardId}`);
  }
}

export const api = new ApiClient();
