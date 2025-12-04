# Finance Wrapped 💰

A Spotify Wrapped-style yearly financial summary app for Stoxiio users.

![Finance Wrapped Preview](preview.png)

## Features

- 🎨 Beautiful animated slides with gradient backgrounds
- 📊 Portfolio performance overview
- 💸 Dividend income summary
- 🎁 Stock vesting tracking
- 💰 Income vs Expenses analysis
- 🎯 Financial goals progress
- 📱 Responsive design with swipe support
- ⌨️ Keyboard navigation (arrow keys, space)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the finance-wrapped directory:
   ```bash
   cd finance-wrapped
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build TypeScript:
   ```bash
   npm run build
   ```

4. Start the proxy server:
   ```bash
   npm run proxy
   ```

5. Open your browser to:
   ```
   http://localhost:3000
   ```

### Development

For development with auto-rebuild on TypeScript changes:

```bash
npm start
```

This runs both the proxy server and TypeScript compiler in watch mode.

## How It Works

### Proxy Server

The app includes a simple Express proxy server (`proxy.js`) that:
- Forwards all `/api/*` requests to `https://api-preview.stoxiio.com`
- Handles CORS issues
- Passes through authentication headers and cookies
- Serves static files

### Slides

The app presents your financial data in a series of animated slides:

1. **Welcome** - Personalized greeting
2. **Portfolio Value** - Total current value across all portfolios
3. **Yearly Performance** - Profit/loss for the year with YoY comparison
4. **Top Performer** - Your best performing portfolio
5. **Dividends** - Passive income received with top stocks
6. **Vestings** - Stock award vestings value
7. **Cash Flow** - Income vs expenses with savings rate
8. **Goals** - Progress towards financial goals
9. **Summary** - Total financial gains breakdown

## Tech Stack

- **Frontend**: HTML5, CSS3, TypeScript
- **Proxy**: Node.js, Express
- **Styling**: Custom CSS with CSS variables and gradients
- **Fonts**: Inter (Google Fonts)

## API Endpoints Used

- `POST /users/authenticate` - Login
- `GET /users/info` - User profile
- `GET /currencies` - Currency list
- `GET /portfolios` - Portfolio list
- `GET /portfolios/summary` - Aggregated portfolio data
- `GET /goals` - Financial goals
- `GET /incomestatements` - Income, dividends, vestings, expenses

## Customization

### Adding New Slides

Edit `src/slides.ts` to add new slides. Each slide has:

```typescript
{
  id: 'unique-id',
  gradient: 'gradient-1', // CSS class for background
  render: (data: WrappedData) => `<html content>`,
}
```

### Styling

Edit `styles.css` to customize:
- Colors and gradients (CSS variables in `:root`)
- Animations
- Layout

## License

MIT
