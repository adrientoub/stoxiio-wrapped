# Stoxiio API Documentation

**Base URL:** `https://api-preview.stoxiio.com`

**Authentication:** Bearer Token (JWT) via `Authorization` header
**Content-Type:** `application/json`

---

## 1. Users

### POST /users/authenticate
Authenticate a user and obtain access token.

**Authentication:** Not required

**Request Body:**
```json
{
  "Email": "string",
  "Password": "string",
  "RememberMe": true
}
```

**Response:**
```json
{
  "refreshToken": null,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "creationDate": 1543936903428,
    "lastConnectionDate": 1764806028986,
    "currencyId": 1
  }
}
```

**Cookies Set:**
- `refreshToken` - Refresh token (if RememberMe is true)

---

### GET /users/info
Get current user information.

**Authentication:** Required

**Response:**
```json
{
  "email": "string",
  "creationDate": 1543936903428,       // Unix timestamp (ms)
  "lastConnectionDate": 1762428186404, // Unix timestamp (ms)
  "currencyId": 1
}
```

---

### POST /users/refresh-token
Refresh the authentication token.

**Authentication:** Requires `refreshToken` cookie

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "refreshToken": null,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": null
}
```

**Cookies Set:**
- `refreshToken` - New refresh token with 90-day expiration

---

## 2. Currencies

### GET /currencies
Get list of supported currencies.

**Authentication:** Required

**Response:**
```json
[
  {
    "currencyId": 1,
    "shortName": "EUR",
    "symbol": "€"
  },
  {
    "currencyId": 2,
    "shortName": "USD",
    "symbol": "$"
  },
  {
    "currencyId": 4,
    "shortName": "GBP",
    "symbol": "£"
  },
  {
    "currencyId": 5,
    "shortName": "CHF",
    "symbol": "CHF"
  },
  {
    "currencyId": 6,
    "shortName": "CAD",
    "symbol": "$"
  },
  {
    "currencyId": 7,
    "shortName": "MAD",
    "symbol": "MAD"
  },
  {
    "currencyId": 8,
    "shortName": "AED",
    "symbol": "AED"
  },
  {
    "currencyId": 9,
    "shortName": "HKD",
    "symbol": "HKD"
  }
]
```

---

## 3. Portfolios

### GET /portfolios
Get list of all portfolios for the current user.

**Authentication:** Required

**Response:** Array of portfolio objects (large response with detailed holdings)

---

### GET /portfolios/summary
Get summary data for all portfolios.

**Authentication:** Required

**Response:** Aggregated portfolio summary data (large response with charts and metrics)

---

### GET /portfolios/{portfolioId}
Get detailed information for a specific portfolio.

**Authentication:** Required

**Path Parameters:**
- `portfolioId` (integer) - The portfolio ID (e.g., 77, 78, 100, 101, 103, 126)

**Response:** Detailed portfolio object with holdings, performance data, etc.

---

## 4. Goals

### GET /goals
Get list of financial goals.

**Authentication:** Required

**Response:**
```json
[
  {
    "goalId": "d5cbcd2d-84cc-4e43-2438-08dd03165abd",
    "name": "Retraite ",
    "targetDate": 2899670400000,     // Unix timestamp (ms)
    "targetAmount": 5000000,
    "currencyId": 1
  },
  {
    "goalId": "3aa80627-fd44-4f04-5b56-08dd3d700bbc",
    "name": "First million ",
    "targetDate": 1893369600000,
    "targetAmount": 1000000,
    "currencyId": 1
  },
  {
    "goalId": "dabb6f14-2cd6-4aad-19ec-08dd8b2945a1",
    "name": "4k a month",
    "targetDate": 2051222400000,
    "targetAmount": 1453143.1055,
    "currencyId": 2
  }
]
```

---

## 5. Income Statements

### GET /incomestatements
Get income statement data across years including dividends, portfolio profits, incomes, expenses, and vestings.

**Authentication:** Required

**Response:**
```json
{
  "years": [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  "dividendIncomeStatementsByYear": {
    "2025": [
      {
        "portfolioId": 77,
        "symbol": "MSFT",
        "buyDate": 1750032000000,
        "currencyId": 2,
        "mainCurrencyId": null,
        "totalAmount": 125.83,
        "totalAmountInUserCurrency": 108.8177814834,
        "exchangeRate": 0.85691
      }
    ]
  },
  "portfolioProfitsByYear": {
    "2025": [
      {
        "portfolioId": 77,
        "totalAmountInUserCurrency": 23298.06244252404
      }
    ]
  },
  "incomesByYear": {
    "2025": [
      {
        "dashboardId": 44,
        "totalAmountInUserCurrency": 61224.84000000001
      }
    ]
  },
  "expensesByYear": {
    "2025": [
      {
        "dashboardId": 71,
        "totalAmountInUserCurrency": -1326
      }
    ]
  },
  "vestingsByYear": {
    "2025": [
      {
        "portfolioId": 77,
        "totalAmountInUserCurrency": 376.9650045
      }
    ]
  },
  "incomeStatementByYearChart": {
    "id": "IncomeStatementChart_IncomeStatementByYear",
    "name": "IncomeStatementChart_IncomeStatementByYear",
    "type": "bar",
    "stacked": true,
    "currency": "EUR",
    "unitType": "currency",
    "computeMinMax": false,
    "computeChange": false,
    "timeRangesFilterable": false,
    "dataSets": [
      {
        "chartDataSetId": "IncomeStatementChart_Dataset_PercentageVariation",
        "labelType": 1,
        "label": "IncomeStatementChart_Dataset_PercentageVariation",
        "type": 0,
        "yType": 1,
        "data": [
          { "x": "2025", "y": -0.1300709619188271 }
        ],
        "metadata": null
      }
    ]
  }
}
```

---

## 6. Dashboards

### GET /dashboards
Get list of dashboards filtered by type.

**Authentication:** Required

**Query Parameters:**
- `types` (integer) - Dashboard type filter
  - `2` - Income dashboards
  - `3` - Expense dashboards

**Response:** Array of dashboard summary objects

---

### GET /dashboards/{dashboardId}
Get detailed dashboard information including data sets and entries.

**Authentication:** Required

**Path Parameters:**
- `dashboardId` (integer) - The dashboard ID (e.g., 41, 42, 44, 45, 70, 71, 72)

**Response:**
```json
{
  "dashboardId": 44,
  "name": "Net before tax + ESPP",
  "unit": "€",
  "tracked": true,
  "description": "",
  "currencyId": 1,
  "template": 2,
  "creationDate": 1748382642511,
  "lastModificationDate": 1748382642511,
  "dataSets": [
    {
      "dataSetId": 47,
      "name": "Net before tax + ESPP",
      "description": "",
      "labelType": "DATE",
      "creationDate": 1748382642511,
      "lastModificationDate": 1748382642511,
      "entries": [
        {
          "dataSetEntryId": 2346,
          "label": "1756591200000",
          "value": 4839.12,
          "creationDate": 1756422616571,
          "lastModificationDate": 1756422616571
        }
      ],
      "change": -12470.27,
      "changePercentage": -0.725031294277842,
      "dailyChange": -402.26677419354843,
      "dailyChangePercentage": -1.9763353798351726,
      "previousDailyChange": 412.01700000000005
    }
  ],
  "metadata": null
}
```

---

## Common Data Types

### Currency IDs
| ID | Currency | Symbol |
|----|----------|--------|
| 1  | EUR      | €      |
| 2  | USD      | $      |
| 4  | GBP      | £      |
| 5  | CHF      | CHF    |
| 6  | CAD      | $      |
| 7  | MAD      | MAD    |
| 8  | AED      | AED    |
| 9  | HKD      | HKD    |

### Dashboard Types (template)
| Type | Description |
|------|-------------|
| 2    | Income      |
| 3    | Expense     |

### Timestamps
All timestamps are in **milliseconds** since Unix epoch (January 1, 1970 UTC).

---

## HTTP Methods Supported

From CORS headers:
- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`

---

## Security Headers

The API returns the following security headers:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'`

---

## API Endpoints Summary

| Method | Endpoint                    | Description                          | Auth Required |
|--------|------------------------------|--------------------------------------|---------------|
| GET    | /currencies                  | List supported currencies            | Yes           |
| POST   | /users/authenticate          | Authenticate user and get token      | No            |
| GET    | /users/info                  | Get user profile                     | Yes           |
| POST   | /users/refresh-token         | Refresh authentication token         | Cookie        |
| GET    | /portfolios                  | List all portfolios                  | Yes           |
| GET    | /portfolios/summary          | Get portfolios summary               | Yes           |
| GET    | /portfolios/{id}             | Get specific portfolio               | Yes           |
| GET    | /goals                       | List financial goals                 | Yes           |
| GET    | /incomestatements            | Get income statement data            | Yes           |
| GET    | /dashboards                  | List dashboards (with type filter)   | Yes           |
| GET    | /dashboards/{id}             | Get specific dashboard               | Yes           |
