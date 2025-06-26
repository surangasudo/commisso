# Application Database Structure (Firestore)

This document outlines the proposed database structure for the Ultimate POS & ERP system, built on Google Firestore. Each section describes a collection and its intended purpose.

*Note: For efficiency, line items (like `purchase_lines` or `sale_lines`) are often stored as an array of objects within the parent document (`purchases` or `sales`) rather than as separate collections. This is a common NoSQL pattern to reduce read operations.*

---

## `businesses`

Stores information about each business/shop, supporting multi-business setups.

-   **name**: (string) The legal name of the business.
-   **ownerId**: (string) The user ID of the business owner.
-   ... and other top-level business details.

---

## `business_locations`

Manages multiple store locations or warehouses for each business.

-   **businessId**: (string) The ID of the parent `businesses` document.
-   **name**: (string) The name of the location (e.g., "Downtown Store", "Main Warehouse").
-   **address**: (object) The physical address of the location.
-   ... and other location-specific settings.

---

## `users`

User accounts, roles, permissions, and assigned locations.

-   **name**: (string) The user's full name.
-   **email**: (string) The user's login email.
-   **roleId**: (string) The ID of the `roles` document assigned to the user.
-   **assignedLocations**: (array) An array of `business_locations` IDs the user can access.
-   **commissionPercentage**: (number | null) The user's sales commission rate, if applicable.
-   ... and other user profile information.

---

## `roles`

Defines user roles and their specific permissions.

-   **name**: (string) The name of the role (e.g., "Admin", "Cashier", "Manager").
-   **permissions**: (object) A map of permissions, e.g., `{ products: { create: true, read: true } }`.

---

## `contacts`

Stores customer and supplier details, including ledgers and payment terms.

-   **type**: (string) "Customer", "Supplier", or "Both".
-   **name**: (string) The contact's name or business name.
-   **mobile**: (string) The contact's mobile number.
-   **email**: (string) The contact's email address.
-   **totalPurchaseDue**: (number) The outstanding balance for purchases (for suppliers).
-   **totalSaleDue**: (number) The outstanding balance for sales (for customers).
-   ... and other contact details like address, tax number, etc.

---

## `products`

The main product catalog.

-   **name**: (string) The product name.
-   **sku**: (string) Stock Keeping Unit.
-   **productType**: (string) "Single" or "Variable".
-   **categoryId**: (string) The ID of the `product_categories` document.
-   **brandId**: (string) The ID of the `product_brands` document.
-   **unitId**: (string) The ID of the `product_units` document.
-   **purchasePrice**: (number) The cost price of the product.
-   **sellingPrice**: (number) The default selling price.
-   ... and other product details like image URL, stock levels per location, etc.

---

## `product_variations`

Stores variants of products (e.g., size, color).

-   **productId**: (string) The ID of the parent `products` document.
-   **name**: (string) The name of the variation (e.g., "Red, Medium").
-   **sku**: (string) A unique SKU for this specific variant.
-   **price**: (number) The price for this specific variant.

---

## `product_categories`, `product_brands`, `product_units`

These collections store classification data for products.

-   **name**: (string) The name of the category, brand, or unit.
-   **code**: (string, optional) A short code.
-   **parentId**: (string, optional) For creating nested categories/units.

---

## `sales` and `purchases`

Records of all sale and purchase transactions.

-   **invoiceNo` or `referenceNo`**: (string) The unique identifier for the transaction.
-   **date**: (timestamp) The date and time of the transaction.
-   **contactId**: (string) The ID of the customer or supplier from the `contacts` collection.
-   **locationId**: (string) The ID of the `business_locations` document where the transaction occurred.
-   **status**: (string) e.g., "Final", "Draft", "Quotation" for sales; "Received", "Pending" for purchases.
-   **paymentStatus**: (string) "Paid", "Due", "Partial".
-   **totalAmount**: (number) The final total amount of the transaction.
-   **items**: (array) An array of objects detailing the products, quantities, and prices for the transaction.
-   **commissionAgentId**: (string, optional) The ID of the agent (`commissionProfiles` or `users`) for the sale.
-   ... and other transaction details like tax, discount, shipping, etc.

---

## `commissionProfiles`

Stores details of commission agents (users or designated agents eligible for sales commissions).

-   **name**: (string) The name of the agent, company, etc.
-   **entityType**: (string) "Agent", "Sub-Agent", "Company", or "Salesperson".
-   **phone**: (string) The contact phone number.
-   **commission**: (object) The commission structure (overall rate and category-specific rates).
-   **totalCommissionPending**: (number) Outstanding commission to be paid.
-   **totalCommissionPaid**: (number) Total commission already paid.

---

## `expenses` and `expense_categories`

Stores records of business expenses and their categories.

-   **date**: (timestamp) The date of the expense.
-   **categoryId**: (string) The ID of the `expense_categories` document.
-   **locationId**: (string) The ID of the business location.
-   **totalAmount**: (number) The total amount of the expense.
-   **reason**: (string) A note explaining the expense.

---

## Other Collections

-   **`stock_adjustments`**: Records manual stock corrections.
-   **`stock_transfers`**: Tracks the movement of stock between locations.
-   **`tax_rates`**: Definitions for different taxes (e.g., GST, VAT).
-   **`price_groups`**: For different pricing tiers (e.g., retail, wholesale).
-   **`cash_registers`**: Manages cash register sessions, including opening/closing balances and reconciliation.
-   **`hrm_payrolls`**: (If HRM module enabled) Stores payroll records, potentially including commission as a component.
-   **`settings`**: A collection (often with a single document) for storing system-wide configuration.
