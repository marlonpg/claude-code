# Salva Uti Vet UI Tests

## Config
- base_url: https://marlonpg.github.io/salvautivet/
- viewport: 1280x720

## Test: Homepage
### Step 1 — Load homepage
- action: Navigate to https://marlonpg.github.io/salvautivet/
- expected: Homepage loads successfully, navigation menu with items "Início", "Serviços", "Por Que Nós", "Contato" is visible

## Test: Menu Navigation
### Step 1 — Navigate to Início
- action: Click the menu item with text "Início" in the navigation bar
- expected: Page scrolls or navigates to the home/intro section

### Step 2 — Navigate to Serviços
- action: Click the menu item with text "Serviços" in the navigation bar
- expected: Page scrolls or navigates to the services section, services content is displayed

### Step 3 — Navigate to Por Que Nós
- action: Click the menu item with text "Por Que Nós" in the navigation bar
- expected: Page scrolls or navigates to the "why us" section, relevant content is displayed

### Step 4 — Navigate to Contato
- action: Click the menu item with text "Contato" in the navigation bar
- expected: Page scrolls or navigates to the contact section, contact information or form is displayed