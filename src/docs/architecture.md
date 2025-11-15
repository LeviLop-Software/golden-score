# Project Architecture

## Overview
Company Checker MVP - A Next.js application for evaluating and scoring companies based on various metrics.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript/TypeScript
- **Styling**: TailwindCSS v4 with RTL support
- **i18n**: react-i18next (Hebrew as default)
- **Charts**: react-chartjs-2 + Chart.js
- **PDF Generation**: jsPDF + jspdf-autotable
- **HTTP Client**: axios
- **Icons**: lucide-react

## Project Structure

```
mvp-company-checker/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with i18n provider
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles with Tailwind
│   └── I18nProvider.tsx     # i18n client provider
│
├── src/
│   ├── components/          # React components
│   │   ├── SearchBar.jsx    # Company search component
│   │   ├── CompanyCard.jsx  # Display company info
│   │   ├── DashboardLayout.jsx  # Main layout wrapper
│   │   ├── KpiCard.jsx      # Key Performance Indicator card
│   │   ├── ChartCard.jsx    # Chart display wrapper
│   │   └── ListCard.jsx     # Generic list component
│   │
│   ├── services/            # API services
│   │   └── companyService.js  # Company data API calls
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useCompanySearch.js  # Search functionality hook
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── scoring.js       # Company scoring algorithms
│   │   └── pdf.js           # PDF report generation
│   │
│   ├── types/               # Type definitions
│   │   └── company.js       # Company model/shape
│   │
│   ├── locales/             # i18n translations
│   │   └── he/
│   │       └── translation.json  # Hebrew translations
│   │
│   ├── mock/                # Mock data
│   │   └── sample-company.json  # Sample company data
│   │
│   ├── docs/                # Documentation
│   │   └── architecture.md  # This file
│   │
│   └── i18n.tsx             # i18n configuration
│
├── public/                  # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.js
└── README.md
```

## Key Features

### 1. Company Search
- Search companies by name or registration number
- Real-time search with debouncing (TODO)
- Search history (TODO)

### 2. Company Scoring
- Multi-factor scoring algorithm:
  - Financial Health (40%)
  - Reputation (30%)
  - Compliance (20%)
  - Sustainability (10%)
- Score categories: Excellent, Good, Fair, Poor
- Visual indicators with color coding

### 3. Data Visualization
- KPI cards for key metrics
- Charts for trends and comparisons
- Interactive dashboard layout

### 4. PDF Export
- Generate detailed company reports
- Comparison reports for multiple companies
- Hebrew text support (TODO)

### 5. Internationalization
- Hebrew as default language
- RTL support throughout the UI
- Easy to add additional languages

## Data Flow

```
User Input (SearchBar)
    ↓
useCompanySearch Hook
    ↓
companyService API call
    ↓
Company Data Processing
    ↓
scoring.js (Calculate scores)
    ↓
Component Rendering (CompanyCard, KpiCard, etc.)
    ↓
Optional: PDF Export (pdf.js)
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── I18nProvider
    └── DashboardLayout
        ├── SearchBar
        ├── CompanyCard
        │   ├── KpiCard (multiple)
        │   └── ChartCard (multiple)
        └── ListCard
```

## API Integration

### Endpoints (To be implemented)
- `GET /api/companies/search?q={query}` - Search companies
- `GET /api/companies/{id}` - Get company details
- `GET /api/companies/{id}/score` - Get company score
- `GET /api/companies` - List all companies (with filters)

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Scoring Algorithm

The overall company score is calculated as a weighted average:

```javascript
overallScore = (
  financialScore * 0.4 +
  reputationScore * 0.3 +
  complianceScore * 0.2 +
  sustainabilityScore * 0.1
)
```

Each sub-score is calculated based on specific metrics (to be defined).

## TODO & Next Steps

### High Priority
1. Implement actual API endpoints
2. Add authentication/authorization
3. Implement scoring algorithm with real data
4. Add Hebrew font support to PDF generation
5. Implement chart components with Chart.js
6. Add search debouncing and caching

### Medium Priority
1. Add filtering and sorting to company lists
2. Implement pagination
3. Add company comparison feature
4. Create admin dashboard
5. Add data export (CSV, Excel)

### Low Priority
1. Dark mode support
2. Mobile app version
3. Advanced analytics
4. Real-time notifications
5. Multi-language support (English, Arabic)

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow ESLint configuration
- Use descriptive variable names
- Add JSDoc comments for functions
- Keep components small and focused

### Git Workflow
1. Create feature branch from main
2. Implement feature with tests
3. Create pull request
4. Code review
5. Merge to main

### Commit Messages
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

## Testing Strategy (TODO)
- Unit tests for utilities (scoring, PDF generation)
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests with Playwright

## Performance Considerations
- Lazy load components where possible
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper caching strategies

## Security Considerations
- Sanitize user inputs
- Implement rate limiting on API
- Use HTTPS for all communications
- Store sensitive data securely
- Regular security audits

---

**Last Updated**: November 16, 2025
**Version**: 0.1.0
**Author**: Development Team
