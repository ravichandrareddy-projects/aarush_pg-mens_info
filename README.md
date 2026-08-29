# Aarush Mens Luxury PG Management System

A complete, high-performance **PG / Hostel Management System** for **Aarush Mens Luxury PG**. Built with React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, and Progressive Web App (PWA) standalone mobile capabilities.

---

## 🌟 Property & Building Specifications

- **Total Rooms**: 67 Bedrooms + Facilities
- **Total Capacity**: 240 Beds (all initial beds start 100% EMPTY)
- **Floor Breakdown**:
  - **Ground Floor**: Room G01 (4-sharing) + Management Office
  - **1st Floor**: 11 rooms (101–106: 3-sharing, 107–111: 4-sharing = 38 beds)
  - **2nd Floor**: 11 rooms (201–206: 3-sharing, 207–211: 4-sharing = 38 beds)
  - **3rd Floor**: 11 rooms (301: 4-sharing, 302–304: 3-sharing, 305: 4-sharing, 306: 3-sharing, 307–311: 4-sharing = 40 beds)
  - **4th Floor**: 11 rooms (401–402: 3-sharing, 403: 4-sharing, 404: 3-sharing, 405–409: 4-sharing, 410: 5-sharing, 411: 4-sharing = 42 beds)
  - **5th Floor**: 11 rooms (501–506: 3-sharing, 507–509: 4-sharing, 510: 5-sharing, 511: 4-sharing = 39 beds)
  - **6th Floor**: 11 rooms (601–606: 3-sharing, 607–609: 4-sharing, 610: 5-sharing, 611: 4-sharing = 39 beds)
  - **7th Floor**: Dining Area & Mess Facility

---

## ⚡ Core Features

1. **100% Zero Dummy Data**: Starts with 0 occupied beds, 240 empty beds, zero fake residents.
2. **Dynamic Dashboard**: Derived stats (Rooms, Beds, Occupied, Empty, Paid, Pending).
3. **Resident Onboarding**: Floor -> Room -> Bed wizard with masked Aadhaar (`XXXX-XXXX-1234`), photo upload, and initial rent payment ledger.
4. **Resident Profile & Lifecycle**: Move Resident (bed reassignment), Mark as Left (checkout), and Payment Status Ledger.
5. **Empty Beds Directory**: Filterable directory for all 240 empty beds by floor and sharing capacity.
6. **Mobile PWA & Vercel Auto-Updates**: Progressive Web App manifest (`manifest.json`) for 1-click installation on Android & iPhone with instant Vercel over-the-air updates.

---

## 🛠️ Local Development Setup

```bash
# Install dependencies
npm install

# Start local server on port 3000
npm run dev

# Production Build
npm run build
```

---

## 🚀 Mobile & PWA Deployment

- **Vercel Deployment**: Connect GitHub repo `ravichandrareddy-projects/aarush_pg-mens_info` to Vercel for instant PWA deployment.
- **Android APK**: Package via `@capacitor/android` or [PWABuilder.com](https://www.pwabuilder.com).
