# SLF Profile Registration (Operator Profile): Frontend

DENR-EMB Sanitary Landfill Monitoring System
Stack: **React (Vite)**, JavaScript, HTML, CSS

## How to run
You need Node.js 18 or newer.

```
cd operator-profile-frontend
npm install
npm run dev
```
Open **http://localhost:5173**

## Demo mode (no backend needed)
The form works right away. Saved profiles are kept in the browser (localStorage), and the Operator ID starts at `SLF-2026-003` like the design.

When the backend is ready, create a file named `.env` in this folder:
```
VITE_USE_MOCK=false
```
Restart `npm run dev`. The form will then call the real API below.

## What the form does
- **Operator ID** and **Date of Registration** are read-only (ID from the server, date is today).
- **Required fields:** every field has a red `*`. Errors show under the field when you leave it or press submit, and the first wrong field is focused.
- **Checks:** email format, PH mobile or landline number, latitude/longitude range, date not in the future, and the same max lengths as the database columns.
- **Duplicate email:** the email field shows "already registered" (backend returns `EMAIL_EXISTS`).
- **Address:** one box in the UI (`Street, Barangay, City/Municipality, Province`). The frontend splits it into the 4 database columns. Street is optional, so `Barangay, City, Province` also works.
- **Success:** a green message with the new Operator ID, and the form clears.

## API the backend needs
`GET /api/operator-profile/next-id` returns `{ "operator_id": 3 }`

`POST /api/operator-profile` with this JSON (keys match the `operator_profile` table):

| JSON key | Database column | Notes |
|---|---|---|
| name_of_operator | name_of_operator | VARCHAR(255), required |
| client_type | client_type | `LGU`, `Private` or `Others` |
| address_province | address_province | required |
| address_municipality_city | address_municipality_city | required |
| address_brgy | address_brgy | required |
| address_street | address_street | may be `null` |
| date_established | date_established | `YYYY-MM-DD` |
| email_add | email_add | lowercase, unique |
| contact | contact | VARCHAR(30) |
| geotag | geotag | text like `10.3157, 123.8854` |
| ceo_owner_pres | ceo_owner_pres | required |
| name_of_pco_representative | name_of_pco_representative | required |

`operator_id`, `created_at` and `updated_at` are set by the database.

Responses the frontend understands:
- `201` with `{ "operator_id": 3 }`
- `409` with `{ "detail": { "code": "EMAIL_EXISTS", "message": "..." } }`
- any other error with `{ "detail": { "message": "..." } }`

## Project files
```
src/
  App.jsx                         page routes
  api.js                          backend calls + demo mode
  styles.css                      all the design (colors, layout, mobile)
  components/Layout.jsx           green header + sidebar
  components/Field.jsx            label, red asterisk, error text
  components/Icons.jsx            sidebar and message icons
  pages/SlfProfileRegistration.jsx  the form
  pages/ComingSoon.jsx            placeholder for other sidebar pages
  utils/validation.js             validation + address splitting
```
To change the Client Type choices, edit `CLIENT_TYPES` in `pages/SlfProfileRegistration.jsx`.
