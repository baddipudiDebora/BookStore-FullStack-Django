# 📚 Full-Stack Django Online Bookstore

[![Heroku Deployment](https://img.shields.io/badge/Hosted%20On-Heroku-430098?style=flat&logo=heroku)](https://djangopractisedemo.herokuapp.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-3.1.1-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)

A full-stack e-commerce marketplace platform connecting online buyers and sellers. Sellers can manage book inventories while users can browse, search, filter, and purchase books online.

🔗 **Live Application:** [djangopractisedemo.herokuapp.com](https://djangopractisedemo.herokuapp.com/)

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

## 📋 Features & User Stories

### **User Catalog & Search**
- As a User, I should be able to view product details on the website.
- As a User, I should be able to search products by name using the search box on the home page.
- As a User, I should be able to search products by description using the search box on the home page.

### **Sorting & Filtering**
- As a User, I should be able to arrange search results by **Category** (A-Z, Z-A).
- As a User, I should be able to arrange search results by **Review Ratings** (High to Low, Low to High).
- As a User, I should be able to arrange search results by **Cost** (High to Low, Low to High).
- As a User, I should be able to arrange search results by **Product Name** (A-Z, Z-A).

### **Shopping Bag & User Accounts**
- As a User, I should be able to add items to the shopping bag without logging in.
- As a User, I should be able to add items to the shopping bag after logging in.
- As a User, I should be able to add multiple quantities of a product to the shopping bag.
- As a User, I should be able to remove products from the shopping bag.
- As a User, I should be able to register an account, log in, and build/edit my profile.

### **Superuser / Admin Product Management**
- As a Superuser, I should be able to create and manage (edit) product listings directly from the website UI.
- As a Superuser, I should be able to remove products from the catalog.

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
