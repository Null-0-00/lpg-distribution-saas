# Translation Audit Report

Generated: 7/25/2025, 1:42:29 AM

## Summary

- **Total Files Analyzed**: 255
- **Files with Issues**: 168
- **Total Hardcoded Strings**: 1162
- **Total Missing Keys**: 244
- **Overall Coverage**: 59.64%
- **Unused Translation Keys**: 26

## Page Coverage Analysis

| Page                | Coverage | Status       | Issues |
| ------------------- | -------- | ------------ | ------ |
| dashboard           | 0%       | ❌ undefined | 1      |
| sales               | 90.57%   | ⚠️ partial   | 2      |
| analytics           | 96.15%   | ✅ complete  | 1      |
| reports/daily-sales | 89.39%   | ⚠️ partial   | 2      |
| inventory           | 98.75%   | ✅ complete  | 2      |
| shipments           | 96.55%   | ✅ complete  | 2      |
| drivers             | 37.93%   | ❌ missing   | 2      |
| users               | 67.02%   | ❌ missing   | 1      |
| receivables         | 32.88%   | ❌ missing   | 2      |
| assets              | 4.23%    | ❌ missing   | 1      |
| expenses            | 100%     | ✅ complete  | 1      |
| reports             | 35.29%   | ❌ missing   | 4      |
| product-management  | 10%      | ❌ missing   | 1      |
| settings            | 76.19%   | ⚠️ partial   | 1      |

## Top Issues by Page

### reports

- Coverage: 35.29%
- Issues:
  - daily-sales\page.tsx: 7 hardcoded strings
  - daily-sales\page.tsx: 1 missing translation keys
  - page.tsx: 103 hardcoded strings
  - page.tsx: 1 missing translation keys

### sales

- Coverage: 90.57%
- Issues:
  - page.tsx: 5 hardcoded strings
  - page.tsx: 1 missing translation keys

### reports/daily-sales

- Coverage: 89.39%
- Issues:
  - page.tsx: 7 hardcoded strings
  - page.tsx: 1 missing translation keys

### inventory

- Coverage: 98.75%
- Issues:
  - page.tsx: 1 hardcoded strings
  - page.tsx: 1 missing translation keys

### shipments

- Coverage: 96.55%
- Issues:
  - page.tsx: 5 hardcoded strings
  - page.tsx: 5 missing translation keys

### drivers

- Coverage: 37.93%
- Issues:
  - analytics\page.tsx: 25 hardcoded strings
  - page.tsx: 29 hardcoded strings

### receivables

- Coverage: 32.88%
- Issues:
  - page.tsx: 49 hardcoded strings
  - page.tsx: 3 missing translation keys

### dashboard

- Coverage: 0%
- Issues:
  - Page directory not found

### analytics

- Coverage: 96.15%
- Issues:
  - page.tsx: 3 hardcoded strings

### users

- Coverage: 67.02%
- Issues:
  - page.tsx: 31 hardcoded strings

## Unused Translation Keys (26)

```
noData
view
print
download
upload
submit
back
forward
confirm
stock
purchase
sale
lastMonth
yesterday
week
warning
info
dataNotFound
operationSuccessful
addNewUser
... and 6 more
```

## Recommendations

1. **Replace Hardcoded Text**: 1162 hardcoded strings found across 113 files
2. **Add Missing Translation Keys**: 244 missing keys need to be added to translations.ts
3. **Improve Coverage**: Overall coverage is 59.64%, target should be 95%+
4. **Priority Pages**: Focus on dashboard, drivers, users, receivables, assets, reports, product-management (coverage < 70%)
