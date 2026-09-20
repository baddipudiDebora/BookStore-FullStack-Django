# 📚 Full-Stack Django Online Bookstore

[![Cypress BDD Tests](https://github.com/baddipudiDebora/BookStore-FullStack-Django/actions/workflows/daily-tests.yml/badge.svg)](https://github.com/baddipudiDebora/BookStore-FullStack-Django/actions/workflows/daily-tests.yml)
[![Heroku Deployment](https://img.shields.io/badge/Hosted%20On-Heroku-430098?style=flat&logo=heroku)](https://djangopractisedemo.herokuapp.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-3.1.1-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)

A full-stack e-commerce marketplace platform connecting online buyers and sellers. Sellers can manage book inventories while users can browse, search, filter, and purchase books online.

---

## 🛠️ Tech Stack & Dependencies

### **Frontend & UI**
- **HTML5 & CSS3**
- **JavaScript (Vanilla)**
- **Bootstrap 4** (Responsive layout and reusable components)
- **Font-Awesome** (UI Icons)
- **Google Fonts** (Typography)

### **Backend & Core Logic**
- **Python 3** (Business logic implementation)
- **Django Framework (v3.1.1)** (MVT web framework)
- **django-allauth (v0.42.0)** (User authentication and account management)
- **django-crispy-forms** (DRY form rendering)
- **django-countries** (ISO 3166-1 country selection model fields)
- **Pillow (PIL)** (Image handling and upload management)

### **Database, Server & Production Tools**
- **SQLite** (Development database engine)
- **PostgreSQL / psycopg2-binary** (Production database driver)
- **Gunicorn** (WSGI HTTP server for production deployment)
- **WhiteNoise** (Static file serving)
- **dj-database-url** (Database configuration via environment variables)
- **pytz** (Timezone management)
- **Stripe SDK** (Payment processing integration)

## 📋 Epics & User Stories

### Epic 1: User Identity & Account Management
Consolidates all user lifecycle, security, profile, and authorization features for both customers and administrators.

* **US-01 (Registration & Login):** As a customer, I want to create an account and log in securely so that I can access my personalized shopping session.
  * **Given** I am on the registration page, **When** I submit a unique username, valid email, and matching password, **Then** my account should be created and I should be redirected to the login page.
  * **Given** an existing account, **When** I log in with valid credentials, **Then** I should be granted an authenticated session and navigated to the storefront.

* **US-02 (Session & Auth Management):** As a returning user, I want to maintain my login session and log out safely so that my account remains secure.
  * **Given** I am logged in, **When** I click the "Logout" button, **Then** my session token/cookie should be invalidated and I should be redirected to the home page as a guest.
  * **Given** an unauthenticated guest user, **When** I try to access protected routes (e.g., `/checkout`), **Then** I should be redirected to the login page.

* **US-03 (Admin Authorization):** As a store admin, I want restricted access to the Django backend portal so that unauthorized users cannot alter store settings.
  * **Given** a standard non-admin account, **When** I attempt to access `/admin`, **Then** access should be denied with a 403 Forbidden or redirect.
  * **Given** a user with superuser/staff flags enabled, **When** I log into `/admin`, **Then** I should be granted full access to administrative control modules.

---

### Epic 2: Storefront Catalog, Search & Shopping Cart
Consolidates all customer-facing discovery, navigation, item management, and purchasing workflows into a single end-to-end shopping experience.

* **US-04 (Browse, Search & Sort):** As a customer, I want to filter, search by keyword, and sort books (by price, title, or release date) so that I can quickly discover products.
  * **Given** I enter a term into the search bar, **When** I press enter, **Then** only books matching the title, author, or ISBN should display.
  * **Given** the catalog view, **When** I select "Price: Low to High" from the sort dropdown, **Then** the book list should dynamically reorder starting with the lowest price.

* **US-05 (Product Details):** As a customer, I want to view detailed book information and stock availability so that I can decide whether to purchase.
  * **Given** the catalog page, **When** I click on a book title or image, **Then** I should be navigated to its detail page showing cover image, description, price, and current stock count.

* **US-06 (Cart Operations):** As a shopper, I want to add books to my cart, update quantities, and remove items so that I can manage my selections.
  * **Given** a product page, **When** I click "Add to Cart", **Then** the cart counter in the navigation bar should increment immediately.
  * **Given** the cart page, **When** I modify an item quantity or remove an item, **Then** the item total and grand total should recalculate automatically.

* **US-07 (Checkout & Orders):** As an authenticated buyer, I want to enter my shipping details and place an order so that I can complete my transaction and receive an order confirmation.
  * **Given** items in my shopping cart, **When** I submit valid shipping address information on the checkout page, **Then** an order should be saved in the database, my cart should be cleared, and an order confirmation page should display my order summary.

---

### Epic 3: Administrative Store Management & Fulfillment
Consolidates all backend administrative operations, product catalog management, and order fulfillment capabilities.

* **US-08 (Catalog CRUD):** As an admin, I want to create, read, update, and delete book entries in the inventory so that the storefront displays current titles.
  * **Given** I am in the Django Admin portal, **When** I add or edit a book entry and click save, **Then** the updated record should persist in the database and reflect on the frontend catalog.
  * **Given** a book entry in Django Admin, **When** I select delete and confirm, **Then** the product should be removed from the site.

* **US-09 (Inventory Stock Control):** As an admin, I want to adjust stock levels so that sold-out books automatically show as out-of-stock.
  * **Given** a book inventory count set to `0`, **When** a customer views the book on the storefront, **Then** the "Add to Cart" button should be disabled and marked "Out of Stock".

* **US-10 (Order Fulfillment):** As an admin, I want to view customer purchase orders so that I can process and fulfill incoming sales.
  * **Given** customer orders have been placed, **When** I navigate to the Orders section in the Admin portal, **Then** I should see a list of all transactions with customer details, purchased items, total price, and timestamp.
---

## 🔮 Future Enhancements
- [ ] Complete full end-to-end Stripe payment gateway integration during checkout.

## 🚀 Local Development Setup

1. **Clone Repository:**
   ```bash
   git clone [https://github.com/baddipudiDebora/BookStore-FullStack-Django.git](https://github.com/baddipudiDebora/BookStore-FullStack-Django.git)
   cd BookStore-FullStack-Django
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py loaddata books_fixture.json
   python manage.py runserver
   ```

## API Endpoints

The versioned JSON API is available under `/api/v1/` and uses the same database as the server-rendered UI.

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/books/` | Public | List, search, filter, and sort books |
| `GET` | `/api/v1/books/<id>/` | Public | Retrieve one book |
| `GET` | `/api/v1/categories/` | Public | List categories |
| `GET` | `/api/v1/bag/` | Session | Retrieve the current shopping bag |
| `POST` | `/api/v1/books/` | Superuser | Create a book from a JSON payload |

Example book creation request:

```http
POST /api/v1/books/
Content-Type: application/json
```

```json
{
  "category": 1,
  "sku": "API-001",
  "name": "API Book",
  "description": "Created through the bookstore API.",
  "price": "18.99"
}
```

Unauthenticated and non-superuser POST requests are rejected with `403`. Invalid JSON or form data returns `400`.

## API on AWS (API Gateway + Lambda)

An AWS migration scaffold now lives in `aws-api/`.

- **Architecture:** API Gateway (`/v1/*`) → resource-specific Lambda handlers (`books`, `categories`, `bag`, `auth`, `checkout`, `admin_orders`) → same relational DB via `DATABASE_URL`.
- **Runtime approach:** Lambda handlers bootstrap Django settings/models for parity with existing validation and serialization logic.
- **Auth flow:** `/v1/auth/login` returns a signed bearer token, validated by a Lambda authorizer for protected routes.
- **Bag flow in stateless Lambda:** bag payload is supplied in `X-Bag` header (or `bag` field in checkout POST body) because Lambda does not keep Django session state.
- **OpenAPI docs:** `aws-api/openapi.yaml` defines all migrated endpoints and is wired into SAM `template.yaml` via `DefinitionBody`.

### Deploy with SAM

```bash
cd aws-api
sam validate
sam build
sam deploy --guided
```

`samconfig.toml` is included with placeholder defaults only. Use real values for `DatabaseUrl` and `DjangoSecretKey` during deployment (for example via parameter overrides or a secrets workflow).

### View Swagger/OpenAPI locally

```bash
python -m http.server 8000
# Open http://localhost:8000/aws-api/docs/swagger-ui/
```

Optional OpenAPI validation:

```bash
npx @apidevtools/swagger-cli validate aws-api/openapi.yaml
```

### Relationship to current Django `/api/v1/`

The existing Django `api/` app and `/api/v1/` routes are intentionally kept in place and unchanged in this migration PR. The AWS `/v1/` API is added side-by-side so frontend cutover/deprecation can be decided in a follow-up once integration testing is complete.

## Automated Testing

Run the Django tests with:

```bash
python manage.py test
```

Run the Cypress BDD suite with:

```bash
npm ci
npm run cy:run
```

Current Gherkin coverage includes catalog sorting, checkout navigation, API GET endpoints, and unauthorized API POST behavior. Authorized book creation is covered by the Django API tests.

GitHub Actions loads `books_fixture.json` before running the test suite. The workflow also integrates with Jira AFT when these secrets are configured:

```text
JIRA_BASE_URL
JIRA_USER_EMAIL
JIRA_API_TOKEN
JIRA_REPORTER_ACCOUNT_ID
```

The AFT processor records the exact Cypress test case, commit ID, passing screenshot, and recovery comment on the matching automation Jira issue.

The latest Mochawesome HTML report, screenshots, and videos are uploaded as the `cypress-test-artifacts` artifact for each workflow run. [View the Cypress workflow and its test-report artifacts.](https://github.com/baddipudiDebora/BookStore-FullStack-Django/actions/workflows/daily-tests.yml)

### Resilient UI Locators

Cypress uses stable `data-cy` attributes for key UI controls instead of coupling tests to Bootstrap classes or visual styling. For example:

```javascript
cy.get('[data-cy="sort-selector"]').select('price_asc');
cy.get('[data-cy="book-card"]').first().click();
```

 ## 🧪 Shift-Left Automation Strategy Matrix

| Epic | Story ID | User Story Title | Test Strategy | Recommended Target Level | Shift-Left Benefit & Automation Rationale |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **Epic 1: User Identity** | **US-01** | Registration & Login | `API First` | `POST /api/v1/auth/register/`<br>`POST /api/v1/auth/login/` | Validates user creation, duplicate rejection, credential validation, and session authentication. |
| **Epic 1: User Identity** | **US-02** | Session & Auth Management | `GET /api/v1/checkout/`<br>`POST /api/v1/auth/logout/` | Verifies session-protected writes and checkout session behavior. |
| **Epic 1: User Identity** | **US-03** | Admin Authorization | `PATCH/DELETE /api/v1/books/{id}/`<br>`GET /api/v1/admin/orders/` | Verifies superuser-only catalog mutation and order visibility. |
| **Epic 2: Storefront & Cart** | **US-04** | Browse, Search & Sort | `GET /api/v1/books/?q=...`<br>`GET /api/v1/books/?sort=...` | Validates Django ORM filtering, search queries, and ordering in JSON responses. |
| **Epic 2: Storefront & Cart** | **US-05** | Product Details View | `UI Reserved` | Cypress / Playwright DOM | Validates dynamic visual page layout, cover image rendering, dynamic routing, and DOM element accessibility. |
| **Epic 2: Storefront & Cart** | **US-06** | Cart Operations | `Hybrid` | API State + UI Badge Check | API handles item totals and state math; UI smoke test validates real-time shopping cart badge counter updates. |
| **Epic 2: Storefront & Cart** | **US-07** | Checkout & Orders | `Hybrid` | `GET/POST /api/v1/checkout/` + 1 UI smoke | API tests address checkout totals and order creation; the UI flow validates the customer journey. |
| **Epic 3: Admin & Fulfillment**| **US-08** | Catalog CRUD Operations | `API First` | `POST/PATCH/DELETE /api/v1/books/` | Tests superuser book creation, partial updates, deletion, and validation errors. |
| **Epic 3: Admin & Fulfillment**| **US-09** | Inventory Stock Control | `API First` | `PATCH /api/v1/books/{id}/` | Provides the catalog mutation boundary for inventory fields. |
| **Epic 3: Admin & Fulfillment**| **US-10** | Order Fulfillment | `API First` | `GET /api/v1/admin/orders/` | Validates superuser-only order listing and order totals. |
---
## 📁 Project Directory Structure
```text
├── cypress/
│   ├── e2e/
│   │   ├── features/               # Human-readable Gherkin .feature files
│   │   │   ├── api_matrix.feature
│   │   │   ├── api_get.feature
│   │   │   ├── api_post.feature
│   │   │   └── catalog_sorting.feature
│   │   └── step_definitions/       # Cypress implementation logic
│   │       ├── api_get.js
│   │       ├── api_post.js
│   │       └── catalog_sorting.js
│   ├── fixtures/                   # Test data assets
│   └── support/                    # Global configurations & custom commands
├── api/                            # Versioned JSON API views, URLs, and tests
├── aws-api/                        # SAM-based API Gateway + Lambda API migration
├── cypress.config.js               # Cypress configuration & preprocessor bindings
├── scripts/aft-jira.js             # Jira automation failure tracking
├── package.json
└── README.md
---
