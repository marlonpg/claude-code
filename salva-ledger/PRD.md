# 🐾 Vet Transport Ledger SPA  
### Product & Technical Specification

---

# 1. 🎯 Product Vision

## 1.1 Objective

Build a **Mobile-First Single Page Application (SPA)** to manage:

- Service income
- Operational expenses
- Tax calculation
- Profit calculation
- Monthly summaries
- Financial transparency for Vet Transport business

This system replaces the current Excel-style table and adds:

- Data consistency
- Automatic calculations
- Reports
- Audit traceability
- Mobile usability in emergency situations

---

# 2. 👥 Target Users

## Primary Users
- Owner
- Administrative assistant
- Driver (optional restricted access)

## Usage Context
- Mostly on mobile devices
- Often during or immediately after transport
- Possibly inside vehicle
- Quick data entry required

---

# 3. 📱 UX Strategy (Mobile-First)

## Core UX Principles

- One-hand usage
- Large tap targets
- Minimal typing
- Smart defaults
- Auto calculations
- No horizontal scrolling
- Offline-first support (critical)

---

# 4. 🧾 Current Spreadsheet Analysis

## Current Fields

| Field | Meaning |
|-------|---------|
| CONCLUIDO? | Whether service is completed |
| Nº | Service number |
| Descrição | Animal / service name |
| Valor | Total charged |
| Requerente | Who requested |
| Veterinário | Vet cost |
| Extra | Additional cost |
| Motorista | Driver |
| Mês | Month |
| Data | Service date |
| Resultado | Net profit |
| Imposto | Tax |

---

# 5. 🧱 High-Level Architecture

## 5.1 Architecture Style

- SPA (React / Vue / Svelte)
- REST API (Spring Boot 3.x preferred)
- PostgreSQL
- JWT Authentication
- PWA support

---

## 5.2 Logical Architecture

Client (Mobile SPA)  
⬇  
Backend API (Stateless)  
⬇  
Database  

---

## 5.3 Suggested Tech Stack

### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- React Query
- Zod for validation
- Service Worker (PWA)

### Backend
- Spring Boot 3.4.x
- Java 21
- PostgreSQL
- Flyway
- Spring Security (JWT)
- MapStruct
- JPA (Hibernate)

---

# 6. 🗂 Domain Modeling

## 6.1 Core Entities

### 6.1.1 Service

```plaintext
Service
-------
id (UUID)
number (Integer)
description (String)
totalAmount (BigDecimal)
requesterName (String)
veterinarianId (FK)
driverId (FK)
extraCost (BigDecimal)
driverCost (BigDecimal)
vetCost (BigDecimal)
taxAmount (BigDecimal)
netProfit (BigDecimal)
status (PENDING, COMPLETED, CANCELLED)
serviceDate (LocalDate)
createdAt
updatedAt
```

---

### 6.1.2 Veterinarian

```plaintext
Veterinarian
------------
id
name
defaultFee (optional)
active
```

---

### 6.1.3 Driver

```plaintext
Driver
------
id
name
defaultFee
active
```

---

### 6.1.4 Expense

```plaintext
Expense
-------
id
description
amount
category (FUEL, MAINTENANCE, EQUIPMENT, TAX, OTHER)
date
```

---

# 7. 💰 Business Logic Rules

## 7.1 Profit Calculation

```
netProfit = totalAmount 
            - vetCost 
            - driverCost 
            - extraCost 
            - taxAmount
```

Must be automatically calculated server-side.

---

## 7.2 Tax Rule

Make configurable:

```
taxAmount = totalAmount * TAX_PERCENTAGE
```

Store tax configuration in:

```plaintext
BusinessSettings
----------------
taxPercentage
currency
```

---

# 8. 📱 UX Screens & Tasks

---

# 8.1 Login Screen

## UX Details
- Large input fields
- Autofocus email
- Biometric login future-ready
- Error feedback inline

## Tasks

- [ ] Create Login Page
- [ ] Implement JWT authentication
- [ ] Secure token storage (httpOnly cookie preferred)
- [ ] Add "Remember me"

---

# 8.2 Dashboard Screen

## Purpose
Quick financial snapshot.

## Display Cards

- Total income (month)
- Total expenses (month)
- Total profit (month)
- Pending services
- Completed services

## UX Design

- Big financial numbers
- Green = profit
- Red = expenses
- Sticky month selector

## Tasks

- [ ] Create Dashboard API endpoint
- [ ] Aggregate monthly data
- [ ] Build summary cards
- [ ] Implement month filter dropdown

---

# 8.3 Service List Screen

## UX

- Vertical list
- Each item card contains:
  - Description
  - Date
  - Total amount
  - Status badge
  - Net profit
- Swipe left → delete
- Swipe right → mark complete

## Tasks

- [ ] Create paginated API
- [ ] Add infinite scroll
- [ ] Implement swipe gestures
- [ ] Add floating “+” button

---

# 8.4 Create/Edit Service Screen

## UX Goals

- One-screen form
- Numeric keypad for money
- Auto-calculate preview
- Save button fixed bottom

## Form Fields

- Description
- Date (default today)
- Total Amount
- Veterinarian (dropdown)
- Vet Cost
- Driver (dropdown)
- Driver Cost
- Extra Cost
- Tax (auto or manual override)
- Status

## UX Smart Behaviors

- Auto-fill vet default fee
- Auto-fill driver default fee
- Live net profit preview
- Prevent negative profit warning
- Currency mask formatting

## Tasks

- [ ] Build form UI
- [ ] Add real-time calculation
- [ ] Add client-side validation
- [ ] Add server-side validation
- [ ] Handle optimistic updates

---

# 8.5 Expense Screen

## UX

- Simple list
- Category filter
- Monthly filter
- Add expense button

## Tasks

- [ ] CRUD for expenses
- [ ] Add categories enum
- [ ] Implement filtering
- [ ] Include in dashboard calculation

---

# 8.6 Reports Screen

## Types of Reports

- Monthly income report
- Monthly expense report
- Profit report
- Export to PDF
- Export to Excel

## Tasks

- [ ] Create reporting API
- [ ] Implement CSV export
- [ ] Implement PDF export
- [ ] Add date range picker

---

# 9. 🔐 Security

- JWT expiration
- Role-based access (ADMIN, DRIVER)
- Input validation everywhere
- Audit logging for financial changes

---

# 10. 📦 Non-Functional Requirements

## Performance
- Page load < 2s
- API < 500ms
- Pagination required

## Availability
- Offline data caching
- Sync when back online

## Data Integrity
- Use transactions for service creation
- No manual netProfit editing

---

# 11. 📊 Database Design

## Indexes

- serviceDate
- status
- month/year
- veterinarianId
- driverId

---

# 12. 🔄 Dev Roadmap (Implementation Phases)

## Phase 1 – Core Backend

- [ ] Setup Spring Boot project
- [ ] Configure PostgreSQL
- [ ] Create entities
- [ ] Create repositories
- [ ] Implement Service CRUD
- [ ] Implement calculation logic
- [ ] Add Flyway migrations
- [ ] Add integration tests

---

## Phase 2 – Basic Frontend

- [ ] Setup React + Vite
- [ ] Build layout system
- [ ] Implement authentication
- [ ] Build Service CRUD UI
- [ ] Connect API

---

## Phase 3 – Dashboard & Reports

- [ ] Build aggregation queries
- [ ] Implement dashboard UI
- [ ] Add charts (Recharts)
- [ ] Implement export

---

## Phase 4 – Advanced Features

- [ ] PWA support
- [ ] Offline mode
- [ ] Role-based UI
- [ ] Audit history
- [ ] Backup system

---

# 13. 🧠 Future Enhancements

- Automatic invoice generation
- WhatsApp share receipt
- Driver payout report
- Tax yearly report
- Integration with accounting software
- Multi-company support

---

# 14. 🧪 Testing Strategy

## Backend
- Unit tests for calculation
- Repository tests
- Security tests
- Integration tests

## Frontend
- Component tests
- Form validation tests
- E2E tests (Cypress)

---

# 15. 💡 Architectural Considerations

## Why SPA?
- Faster UX
- Mobile performance
- Offline support

## Why Server-side Calculation?
- Prevent fraud
- Maintain financial integrity

## Why PostgreSQL?
- Strong ACID guarantees
- Financial safety
- Reliable indexing

---

# 16. 🚨 Risk Analysis

| Risk | Mitigation |
|------|------------|
| Data corruption | Transactions |
| Wrong tax calculation | Centralized tax config |
| User input mistakes | Strong validation |
| Mobile usability issues | UX testing |

---

# 17. 🏁 MVP Definition

MVP includes:

- Login
- Service CRUD
- Auto calculation
- Expense CRUD
- Dashboard monthly summary

No reports export initially.

---

# 18. 📈 KPIs for Success

- Time to register service < 60 seconds
- Zero calculation errors
- 100% service traceability
- Reduced manual corrections