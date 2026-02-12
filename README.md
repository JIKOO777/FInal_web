
# Wearly

## Project link: 
### https://final-web-zlfl.onrender.com
## Final Project Report

---

# 1. Project Overview

The objective of this project is to demonstrate:

* A complete, production-ready web application
* Implementation of backend and security concepts
* Authentication and authorization with roles
* Secured API endpoints
* Clear architectural and security decisions

The application is a full-stack e-commerce platform for a clothing store (“Wearly”) with user accounts, cart functionality, likes, and order processing.

---

# 2. Project Base Requirements

According to the requirements , the application must:

* Use **Node.js + Express**
* Use **MongoDB**
* Follow a **modular project structure**
* Be based on Assignment 4 (same project)
* Be deployed with a working Web UI

### Implementation

The backend uses:

* Node.js
* Express
* MongoDB with Mongoose
* Modular structure:

  * Controllers
  * Models
  * Middleware
  * Config
  * Routes

The frontend is a structured HTML/CSS/JS interface with dynamic data loading from the REST API.

---

# 3. Database Logic & Domain Data

### Requirement:

* Minimum of TWO related collections
* Realistic domain-based data
* Logical relations
* Pagination for large datasets

### Implementation:

The application uses multiple related collections:

* **User**
* **Product**
* **Category**
* **Order**

### Relationships:

* Product → Category (Many-to-One)
* Order → User (Many-to-One)
* Order → Product (Many-to-Many via items)
* User → Likes (Array of Product IDs)
* User → Cart (Embedded items referencing Products)

### Large Dataset Handling

Pagination is implemented in:

* Products
* Categories
* Orders
* Users (Admin)

Filtering and sorting are implemented for products:

* Category filter
* Search query
* Price range
* Sort by price or date

---

# 4. Authentication

### Requirement:

* Sessions or JWT
* Login/logout
* Password hashing using bcrypt

### Implementation:

* JWT-based authentication
* Login endpoint
* Logout endpoint
* Registration endpoint
* Password hashing using bcrypt (handled in auth service)
* Token required for protected endpoints

Authentication flow:

1. User registers (password hashed)
2. User logs in
3. JWT token returned
4. Token attached to future requests

---

# 5. Authorization & Roles

### Requirement:

* At least two roles (user, admin)
* Role-based access control
* Users modify only their own data
* Admin has extended permissions

### Implementation:

Roles:

* `USER`
* `ADMIN`

### Owner Access Control

* Users can only view their own orders
* Users can modify only their own cart and profile
* Users cannot access other users' data

### Admin Permissions

Admin can:

* View all users
* Change user roles
* View all orders
* Update order status
* Create/update/delete products
* Create/update/delete categories

Role-based middleware protects admin endpoints.

---

# 6. API Endpoint Security

### Requirement:

* All write endpoints protected
* No public update/delete operations
* Safe error handling and validation

### Implementation:

Protected endpoints include:

* Product creation/update/delete
* Category creation/update/delete
* Cart modification
* Order creation
* Role updates
* Profile updates

Security measures:

* JWT authentication middleware
* Role verification middleware
* Owner validation for orders
* Input validation
* Safe error responses
* No hardcoded secrets
* Environment variables for configuration

---

# 7. Core Functionality & UI CRUD

### CRUD Operations Implemented:

Products:

* Create (Admin)
* Read
* Update (Admin)
* Delete (Admin)

Categories:

* Full CRUD (Admin)

Cart:

* Add
* Update
* Remove
* Clear

Orders:

* Create
* Read
* Status update (Admin)

The UI supports stable user flows:

* Browse catalog
* Filter products
* View product details
* Like products
* Add to cart
* Place order
* View order history
* Admin management

---

# 8. Deployment & Environment Setup

### Implementation:

* Application deployed to public hosting
* Environment variables used for:

  * MongoDB URI
  * JWT Secret
  * Port configuration
* No hardcoded secrets in source code

Example `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=secure_secret
```

# 9. Conclusion

The Wearly application satisfies all technical and grading requirements described in the Final Project specification :

* Modular Node.js + Express backend
* MongoDB with related domain collections
* Authentication with bcrypt
* Role-based authorization
* Protected API endpoints
* Pagination and filtering
* Public deployment with environment variables
* Complete CRUD functionality with UI

The system demonstrates production-level architecture, security implementation, and domain-based database design appropriate for final evaluation.
