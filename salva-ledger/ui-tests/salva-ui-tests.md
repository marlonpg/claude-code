# Vet Transport Ledger UI Tests

## Config
base_url: http://localhost:3000
viewport: 375x667

## Test: Login Screen
### Step 1
action: Navigate to the login page
expected: Page should contain a login form with email and password fields

### Step 2
action: Type "admin@example.com" into the email field
expected: Email field should contain "admin@example.com"

### Step 3
action: Type "password123" into the password field
expected: Password field should contain "password123"

### Step 4
action: Click the login button
expected: Should navigate to the dashboard or show an error message

## Test: Dashboard Screen
### Step 1
action: Navigate to the dashboard
expected: Page should show financial summary cards

### Step 2
action: Click on "Total income" card
expected: Should navigate to income report page

### Step 3
action: Click on "Total expenses" card
expected: Should navigate to expense report page

## Test: Service List Screen
### Step 1
action: Navigate to service list
expected: Page should show list of services

### Step 2
action: Click the "+" button to add new service
expected: Should navigate to service creation form

### Step 3
action: Click on a service to view details
expected: Should show service details page

## Test: Create/Edit Service Screen
### Step 1
action: Navigate to service creation form
expected: Form should have all required fields

### Step 2
action: Fill in service description
expected: Description field should contain entered text

### Step 3
action: Fill in total amount
expected: Amount field should contain entered value

### Step 4
action: Select veterinarian
expected: Veterinarian dropdown should show selected value

### Step 5
action: Select driver
expected: Driver dropdown should show selected value

### Step 6
action: Click save button
expected: Service should be saved and added to list