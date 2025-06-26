# Application Database Structure (Firestore)

This document outlines the main data collections used in the application, which is built on Google Firestore. Each section describes a collection and the fields you can expect to find in a typical document within that collection.

## `brands`

Stores product brands.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The name of the brand (e.g., "Nike", "Apple").

---

## `productCategories`

Stores product categories, which can be nested.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The name of the category (e.g., "Electronics", "Clothing").
-   **code**: (string) A short code for the category (e.g., "ELEC").
-   **parentId**: (string | null) The ID of the parent category, or `null` if it's a top-level category.

---

## `products`

Stores detailed information about each product available for sale.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The product name.
-   **sku**: (string) Stock Keeping Unit.
-   **image**: (string) URL to the product image.
-   **businessLocation**: (string) The location where the product is available.
-   **unitPurchasePrice**: (number) The cost to acquire one unit of the product.
-   **sellingPrice**: (number) The price at which one unit is sold.
-   **currentStock**: (number) The current quantity available in inventory.
-   **productType**: (string) "Single" or "Variable".
-   **category**: (string) The name of the product's category.
-   **brand**: (string) The name of the product's brand.
-   **tax**: (string) The applicable tax rate name.
-   **unit**: (string) The unit of measurement (e.g., "Pieces", "Kg").

---

## `customers`

Stores information about individual customers.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The customer's full name.
-   **mobile**: (string) The customer's mobile number.
-   **email**: (string | null) The customer's email address.
-   **customerGroup**: (string) The group the customer belongs to (e.g., "Retail", "Wholesale").
-   **address**: (string) The customer's physical address.
-   **contactId**: (string) An optional custom contact ID.
-   ... and other financial fields like `openingBalance`, `totalSaleDue`.

---

## `suppliers`

Stores information about product suppliers.

-   **id**: (string) The auto-generated document ID.
-   **businessName**: (string) The supplier's business name.
-   **name**: (string) The name of the contact person at the supplier.
-   **mobile**: (string) The supplier's mobile number.
-   **email**: (string | null) The supplier's email address.
-   ... and other financial fields like `payTerm`, `totalPurchaseDue`.

---

## `sales`

Stores a record of each sale transaction.

-   **id**: (string) The auto-generated document ID.
-   **invoiceNo**: (string) The unique invoice number for the sale.
-   **date**: (string) The ISO 8601 timestamp of when the sale occurred.
-   **customerName**: (string) The name of the customer who made the purchase.
-   **totalAmount**: (number) The final total amount of the sale.
-   **totalPaid**: (number) The amount paid by the customer.
-   **sellDue**: (number) The remaining balance due.
-   **paymentStatus**: (string) "Paid", "Due", or "Partial".
-   **items**: (array) An array of objects, where each object contains:
    -   **productId**: (string) The ID of the product sold.
    -   **quantity**: (number) The quantity of the product sold.
    -   **unitPrice**: (number) The price per unit at the time of sale.
-   **commissionAgentIds**: (array | null) An array of strings, where each string is the ID of a `commissionProfiles` document.

---

## `purchases`

Stores a record of each purchase transaction from a supplier.

-   **id**: (string) The auto-generated document ID.
-   **referenceNo**: (string) The reference number for the purchase.
-   **date**: (string) The ISO 8601 timestamp of the purchase.
-   **supplier**: (string) The name of the supplier.
-   **grandTotal**: (number) The total amount of the purchase.
-   **paymentDue**: (number) The amount due to be paid.
-   **paymentStatus**: (string) "Paid", "Due", or "Partial".
-   **items**: (array) An array of objects detailing the products purchased.

---

## `expenses`

Stores a record of each business expense.

-   **id**: (string) The auto-generated document ID.
-   **date**: (string) The ISO 8601 timestamp of the expense.
-   **referenceNo**: (string) The reference number for the expense.
-   **expenseCategory**: (string) The name of the expense category.
-   **totalAmount**: (number) The total amount of the expense.
-   **paymentStatus**: (string) "Paid", "Due", or "Partial".

---

## `expenseCategories`

Stores categories for expenses.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The name of the category (e.g., "Rent", "Utilities").
-   **code**: (string) A short code for the category.
-   **parentId**: (string | null) The ID of a parent category for nesting.

---

## `commissionProfiles`

Stores profiles for entities that can earn sales commission.

-   **id**: (string) The auto-generated document ID.
-   **name**: (string) The name of the agent, company, etc.
-   **entityType**: (string) "Agent", "Sub-Agent", "Company", or "Salesperson".
-   **phone**: (string) The contact phone number.
-   **commission**: (object) An object containing the commission structure:
    -   **overall**: (number) The default commission percentage.
    -   **categories**: (array) An array for category-specific rates, e.g., `[{ category: "Electronics", rate: 15 }]`.
-   **totalCommissionPending**: (number) The total outstanding commission to be paid.
-   **totalCommissionPaid**: (number) The total commission that has already been paid out.
