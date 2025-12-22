# Test Coverage Analysis: IFRS16 Calculator

## Executive Summary

**Current Test Coverage: 0%**

This IFRS16 calculator is a vanilla JavaScript web application with **no automated tests**. For a financial calculator that performs critical accounting calculations (lease liability, interest expense, amortization schedules), this represents a significant risk. Financial tools require high accuracy and should have comprehensive test coverage.

---

## Current State

### Project Structure
```
IFRS16calculator/
├── index.html          # Main UI (660 lines)
├── script.js           # Core logic (514 lines)
├── style.css           # Styling
├── about.html          # Static pages
├── contact.html
├── privacy-policy.html
├── terms.html
└── [No test files]
```

### Testing Infrastructure
| Component | Status |
|-----------|--------|
| Test Framework | ❌ None |
| Test Files | ❌ None |
| package.json | ❌ None |
| CI/CD Pipeline | ❌ None |
| Code Coverage Tool | ❌ None |

---

## Critical Functions Requiring Tests

### 1. **Present Value Calculation** (Priority: CRITICAL)

**Location:** `script.js:186-198`

```javascript
const ratePeriodic = (rateAnnual / 100) / 12;
let presentValue = 0;

if (ratePeriodic === 0) {
    presentValue = payment * termPeriods;
} else {
    presentValue = payment * ((1 - Math.pow(1 + ratePeriodic, -termPeriods)) / ratePeriodic);
    if (timing === 'start') {
        presentValue = presentValue * (1 + ratePeriodic);
    }
}
```

**Required Tests:**
- [ ] Zero interest rate calculation
- [ ] Ordinary annuity (timing='end') calculation
- [ ] Annuity due (timing='start') calculation
- [ ] Verify against known financial formulas
- [ ] Edge case: single period
- [ ] Edge case: maximum periods (600)
- [ ] Precision/rounding validation

**Example Test Cases:**
| Payment | Term | Rate | Timing | Expected PV |
|---------|------|------|--------|-------------|
| $5,000 | 36 | 4.5% | end | ~$167,735.66 |
| $5,000 | 36 | 4.5% | start | ~$168,363.45 |
| $1,000 | 12 | 0% | end | $12,000.00 |
| $10,000 | 1 | 6% | end | ~$9,950.25 |

---

### 2. **Amortization Schedule Generation** (Priority: CRITICAL)

**Location:** `script.js:219-265`

**Required Tests:**
- [ ] Interest expense calculation (effective interest method)
- [ ] Principal reduction calculation
- [ ] Closing balance calculation
- [ ] Annuity due vs ordinary annuity schedules
- [ ] Final period balance cleanup (< $1 → $0)
- [ ] Schedule totals accuracy
- [ ] Each row's closing balance = next row's opening balance

**Validation Rules:**
- Total Principal Reduction = Initial Lease Liability
- Total Interest + Total Principal = Total Payments
- Closing Balance after final period = $0 (or negligible)

---

### 3. **Input Validation** (Priority: HIGH)

**Location:** `script.js:95-140`

**Required Tests:**
| Field | Test Case | Expected Result |
|-------|-----------|-----------------|
| payment | Empty | Error: "positive payment amount" |
| payment | Negative | Error: "positive payment amount" |
| payment | Zero | Error: "positive payment amount" |
| payment | Valid (e.g., 5000) | No error |
| term | Empty | Error: "positive whole number" |
| term | Decimal (e.g., 12.5) | Error: "positive whole number" |
| term | > 600 | Error: "Maximum 600 periods" |
| term | Valid (e.g., 36) | No error |
| rate | Negative | Error: "valid rate (0 or higher)" |
| rate | > 100 | Error: "cannot exceed 100%" |
| rate | 0 | No error |
| rate | Valid (e.g., 4.5) | No error |

---

### 4. **CSV Export** (Priority: MEDIUM)

**Location:** `script.js:356-397`

**Required Tests:**
- [ ] Empty schedule handling
- [ ] Proper CSV escaping (commas, quotes, newlines)
- [ ] Correct column headers
- [ ] Data matches displayed table
- [ ] Filename format with timestamp

---

### 5. **Helper Functions** (Priority: MEDIUM)

#### `formatMoney()` (`script.js:403-410`)
**Tests:**
- [ ] Positive numbers formatted correctly
- [ ] Handles decimals (2 places)
- [ ] Handles large numbers
- [ ] Handles zero

#### `showToast()` (`script.js:435-489`)
**Tests:**
- [ ] Success toast styling
- [ ] Error toast styling
- [ ] Warning toast styling
- [ ] Info toast styling
- [ ] Auto-dismissal after 3 seconds
- [ ] Replaces existing toast

---

## Proposed Testing Strategy

### Phase 1: Setup Testing Infrastructure

1. **Initialize npm project**
   ```bash
   npm init -y
   ```

2. **Install Jest**
   ```bash
   npm install --save-dev jest @types/jest
   ```

3. **Configure Jest** (`jest.config.js`)
   ```javascript
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['./tests/setup.js'],
     collectCoverage: true,
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     }
   };
   ```

4. **Refactor for Testability**
   - Extract pure calculation functions
   - Separate DOM manipulation from business logic
   - Export functions for testing

---

### Phase 2: Unit Tests (Priority Order)

#### 2.1 Core Calculations (`tests/calculations.test.js`)
```javascript
describe('IFRS16 Calculations', () => {
  describe('Present Value', () => {
    test('calculates PV for ordinary annuity', () => {
      // Known financial calculation
      const pv = calculatePresentValue(5000, 36, 4.5, 'end');
      expect(pv).toBeCloseTo(167735.66, 2);
    });

    test('calculates PV for annuity due', () => {
      const pv = calculatePresentValue(5000, 36, 4.5, 'start');
      expect(pv).toBeCloseTo(168363.45, 2);
    });

    test('handles zero interest rate', () => {
      const pv = calculatePresentValue(1000, 12, 0, 'end');
      expect(pv).toBe(12000);
    });
  });

  describe('Amortization Schedule', () => {
    test('total principal equals initial liability', () => {
      const schedule = generateSchedule(5000, 36, 4.5, 'end');
      const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
      expect(totalPrincipal).toBeCloseTo(schedule[0].openingBalance, 2);
    });

    test('closing balance is zero after final period', () => {
      const schedule = generateSchedule(5000, 36, 4.5, 'end');
      const lastRow = schedule[schedule.length - 1];
      expect(lastRow.closingBalance).toBe(0);
    });
  });
});
```

#### 2.2 Validation (`tests/validation.test.js`)
```javascript
describe('Input Validation', () => {
  describe('Payment Field', () => {
    test('rejects empty value', () => {
      expect(validatePayment('')).toBe(false);
    });

    test('rejects negative value', () => {
      expect(validatePayment(-100)).toBe(false);
    });

    test('accepts positive value', () => {
      expect(validatePayment(5000)).toBe(true);
    });
  });

  // Similar tests for term and rate
});
```

#### 2.3 CSV Export (`tests/export.test.js`)
```javascript
describe('CSV Export', () => {
  test('escapes values containing commas', () => {
    const csv = generateCSV([['a,b', 'c']]);
    expect(csv).toContain('"a,b"');
  });

  test('escapes values containing quotes', () => {
    const csv = generateCSV([['a"b', 'c']]);
    expect(csv).toContain('"a""b"');
  });
});
```

---

### Phase 3: Integration Tests

```javascript
describe('Calculator Integration', () => {
  test('example values produce correct output', () => {
    // Load example values
    loadExampleValues();

    // Calculate
    calculateSchedule();

    // Verify summary
    expect(getSummaryValue('liability')).toBeCloseTo(167735.66, 0);
    expect(getSummaryValue('asset')).toBeCloseTo(167735.66, 0);
  });
});
```

---

### Phase 4: Edge Case Tests

```javascript
describe('Edge Cases', () => {
  test('single period lease', () => {
    const pv = calculatePresentValue(10000, 1, 6, 'end');
    // Should be close to payment / (1 + rate/12)
    expect(pv).toBeCloseTo(9950.25, 2);
  });

  test('maximum periods (600)', () => {
    // 50-year lease at 12 periods/year
    const pv = calculatePresentValue(1000, 600, 5, 'end');
    expect(pv).toBeGreaterThan(0);
  });

  test('very low interest rate', () => {
    const pv = calculatePresentValue(1000, 12, 0.01, 'end');
    expect(pv).toBeGreaterThan(11990);
    expect(pv).toBeLessThan(12010);
  });

  test('high interest rate', () => {
    const pv = calculatePresentValue(1000, 12, 99, 'end');
    expect(pv).toBeGreaterThan(0);
  });
});
```

---

## Recommended Test Coverage Targets

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| Present Value Calculation | 0% | 100% | Critical |
| Amortization Schedule | 0% | 100% | Critical |
| Input Validation | 0% | 100% | High |
| CSV Export | 0% | 90% | Medium |
| Helper Functions | 0% | 80% | Medium |
| UI/DOM Interactions | 0% | 50% | Low |
| **Overall** | **0%** | **85%** | - |

---

## Code Refactoring for Testability

The current code tightly couples business logic with DOM manipulation. To enable proper testing, refactor to separate concerns:

### Current Structure (Untestable)
```javascript
function calculateSchedule() {
  // Reads from DOM
  const payment = parseFloat(document.getElementById('payment').value);

  // Business logic mixed in
  const ratePeriodic = (rateAnnual / 100) / 12;

  // Writes to DOM
  tbody.innerHTML = "";
}
```

### Proposed Structure (Testable)
```javascript
// calculator-core.js - Pure functions, no DOM
export function calculatePresentValue(payment, term, rate, timing) {
  const ratePeriodic = (rate / 100) / 12;
  if (ratePeriodic === 0) return payment * term;

  let pv = payment * ((1 - Math.pow(1 + ratePeriodic, -term)) / ratePeriodic);
  if (timing === 'start') pv *= (1 + ratePeriodic);
  return pv;
}

export function generateSchedule(payment, term, rate, timing) {
  // Returns array of schedule rows
}

// script.js - DOM handling only
function calculateSchedule() {
  const inputs = readInputs();
  const pv = calculatePresentValue(...inputs);
  const schedule = generateSchedule(...inputs);
  renderSchedule(schedule);
}
```

---

## Financial Accuracy Testing

For a financial calculator, tests should verify against known correct values:

### Verification Sources
1. **Excel Financial Functions** - Use `PV()` and `PMT()` functions
2. **Financial Calculators** - HP 12C, TI BA II Plus
3. **IFRS 16 Illustrative Examples** - From the official standard

### Sample Verification Test
```javascript
test('matches Excel PV function', () => {
  // Excel: =PV(4.5%/12, 36, -5000)
  // Result: $167,735.66
  const result = calculatePresentValue(5000, 36, 4.5, 'end');
  expect(result).toBeCloseTo(167735.66, 2);
});
```

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Set up npm and Jest
- [ ] Refactor script.js to extract pure functions
- [ ] Create basic test file structure

### Week 2: Core Tests
- [ ] Present value calculation tests (10+ cases)
- [ ] Amortization schedule tests (10+ cases)
- [ ] Validation tests (15+ cases)

### Week 3: Edge Cases & Integration
- [ ] Edge case tests
- [ ] Integration tests
- [ ] CSV export tests

### Week 4: Coverage & CI
- [ ] Reach 85% coverage target
- [ ] Set up GitHub Actions for CI
- [ ] Add pre-commit hooks

---

## Conclusion

This IFRS16 calculator has **zero test coverage** for critical financial calculations. Given that incorrect calculations could lead to material misstatements in financial reports, implementing comprehensive tests should be a top priority.

**Immediate Actions:**
1. Set up Jest testing framework
2. Refactor code to separate business logic from DOM
3. Add unit tests for core calculations
4. Verify calculations against known financial formulas
5. Target 85%+ code coverage

The investment in testing will provide confidence that the calculator produces accurate IFRS 16-compliant results.
