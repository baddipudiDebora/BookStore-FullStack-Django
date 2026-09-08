# 📚 Full-Stack Django Online Bookstore

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

---
## 📁 Project Directory Structure
```text
├── cypress/
│   ├── e2e/
│   │   ├── features/               # Human-readable Gherkin .feature files
│   │   │   └── catalog_sorting.feature
│   │   └── step_definitions/       # Cypress implementation logic
│   │       └── catalog_sorting.js
│   ├── fixtures/                   # Test data assets
│   └── support/                    # Global configurations & custom commands
├── cypress.config.js               # Cypress configuration & preprocessor bindings
├── package.json
└── README.md
---

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

---

## 🧪 Testing & Validation

### **Manual Test Scenarios Executed**
Comprehensive manual testing was performed to verify core feature fulfillment across the platform:
1. Verify user can view detailed product pages.
2. Verify search functionality by product name and description.
3. Verify search result sorting across all combinations (Category A-Z/Z-A, Ratings High/Low, Price High/Low, Name A-Z/Z-A).
4. Verify guest users and authenticated users can add items to the shopping bag.
5. Verify adding multiple items and removing items from the shopping bag.
6. Verify user registration, login workflow, and profile creation/editing.
7. Verify Superuser capabilities for adding, editing, and deleting product listings via the frontend UI.

### **Responsiveness & Cross-Browser Testing**
- Styled with Bootstrap 4 for full responsiveness across Desktop, Tablet, and Mobile devices.
- Screen sizes tested: Desktop/Laptop view, iPad, iPhone 6/7/8 viewports.

---

## 🚀 Local Development Setup

1. **Clone Repository:**
   ```bash
   git clone [https://github.com/baddipudiDebora/BookStore-FullStack-Django.git](https://github.com/baddipudiDebora/BookStore-FullStack-Django.git)
   cd BookStore-FullStack-Django
