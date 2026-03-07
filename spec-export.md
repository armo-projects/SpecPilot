# Invoice extraction export test - Codex Ready Build Prompt

You are implementing the feature described below.

Use this document as the execution specification.

Keep implementation decisions aligned with listed requirements, API contracts, and tests.

## Feature Objective

Users should upload invoices and extract line items automatically.

## Additional Context

MVP scope only

## Requirements

- Users can upload invoice files (PDF, image).
- System automatically extracts line items from uploaded invoices.
- Users can view extracted line items for verification.
- Users can export extracted line items in CSV format.
- Basic error handling for unsupported file types or extraction failures.

## Assumptions

- Invoices are in English and follow common invoice layouts.
- Extraction accuracy is sufficient for MVP but may require manual correction later.
- User authentication and authorization are out of MVP scope.
- Uploads are limited to a reasonable file size (e.g., 10MB).

## Frontend Tasks

1. **Invoice Upload UI** (`HIGH`)
   - Create a file upload component supporting PDF and image files with validation and progress indication.
2. **Display Extracted Line Items** (`HIGH`)
   - Design a table view to show extracted line items with columns like description, quantity, unit price, total.
3. **Export Button** (`HIGH`)
   - Add a button to export the extracted line items as a CSV file.
4. **Error and Status Messages** (`MEDIUM`)
   - Show user-friendly messages for upload errors, extraction failures, and success notifications.

## Backend Tasks

1. **File Upload Endpoint** (`HIGH`)
   - Implement API endpoint to receive invoice files and store them temporarily for processing.
2. **Invoice Line Item Extraction Service** (`HIGH`)
   - Integrate or develop a service to parse uploaded invoices and extract line items.
3. **Extraction Result API** (`HIGH`)
   - Create API to return extracted line items to frontend for display.
4. **CSV Export API** (`MEDIUM`)
   - Provide an endpoint or logic to generate CSV export of extracted line items.
5. **Basic Validation and Error Handling** (`HIGH`)
   - Validate file types and handle extraction errors gracefully.

## Database Schema

### Invoice
| Field | Type | Required |
| --- | --- | --- |
| id | UUID (primary key) | Yes |
| userId | UUID | Yes |
| filename | string | Yes |
| uploadDate | datetime | Yes |
| status | string | Yes |

### LineItem
| Field | Type | Required |
| --- | --- | --- |
| id | UUID (primary key) | Yes |
| invoiceId | UUID (foreign key) | Yes |
| description | string | Yes |
| quantity | decimal | Yes |
| unitPrice | decimal | Yes |
| totalPrice | decimal | Yes |

## API Endpoints

### Endpoint 1
```http
POST /api/invoices/upload
```
Purpose: Upload invoice file and trigger extraction.

### Endpoint 2
```http
GET /api/invoices/{invoiceId}/line-items
```
Purpose: Retrieve extracted line items for a given invoice.

### Endpoint 3
```http
GET /api/invoices/{invoiceId}/export
```
Purpose: Export extracted line items as CSV.

## Edge Cases

- Unsupported file format upload attempts.
- Invoices with no line items detected.
- Partial extraction where some line items are missing or malformed.
- Large file uploads exceeding size limits.
- Network interruptions during upload or extraction.

## Acceptance Tests

- Upload valid PDF invoice and verify correct line item extraction.
- Upload unsupported file type and verify error message.
- Retrieve line items for invoice with extraction data.
- Export extracted line items and verify CSV format and content.
- Handle invoice with no line items gracefully.

## Risks and Unknowns

- Extraction accuracy may vary widely depending on invoice format.
- File upload size and format validation may cause user frustration if too restrictive.
- Performance bottlenecks if extraction service is slow or resource intensive.
- Security risks related to file uploads (e.g., malware).
- Incomplete or incorrect line item extraction leading to user dissatisfaction.

Implementation note: If requirements conflict, prioritize explicit API contracts and test cases.
