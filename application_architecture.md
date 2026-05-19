# 🗺️ VenuePro System Architecture & User Flow Guide

Welcome to the definitive structural documentation for **VenuePro**. This document explains the operational flow, system connectivity, database schema mappings, and how different application sectors communicate in real-time.

---

## 1. ⚙️ High-Level System Connectivity

VenuePro is built as a highly responsive, multi-tenant B2B SaaS application. It uses a modern decoupled architecture connecting a dynamic client interface to a secure backend.

```mermaid
graph TD
    %% Styling
    classDef client fill:#dbeafe,stroke:#2563eb,stroke-width:2px;
    classDef context fill:#fef08a,stroke:#ca8a04,stroke-width:2px;
    classDef db fill:#d1fae5,stroke:#059669,stroke-width:2px;
    classDef external fill:#f3e8ff,stroke:#7e22ce,stroke-width:2px;

    %% Frontend Components
    A["Vite + React Public Client<br/>(Storefront, T&C, Privacy)"]:::client
    B["Authenticated Dashboard Layout<br/>(Calendar, CRM, Bookings, Staff)"]:::client
    C["Brand & Typography Engine<br/>(CSS Variables Context)"]:::context

    %% Backend Components
    D["Supabase Auth Engine<br/>(Row Level Security / JWT)"]:::external
    E["Supabase Realtime API<br/>(WebSockets)"]:::external
    F["PostgreSQL Database<br/>(Banquets, Halls, Leads, Bookings)"]:::db
    G["Supabase Database Triggers<br/>(Profiles, Payments Balance sync)"]:::db

    %% Connections
    A -->|Unauthenticated Routing| B
    B -->|Persists Preferences| C
    C -->|Dynamically Shifts Style| B
    B -->|Signs in / Validates JWT| D
    B -->|Reads / Writes Operations| E
    E -->|Database Action Sync| F
    F -->|Enforces Business Logic Triggers| G
```

---

## 2. 👥 User Roles & Operational Flow

VenuePro partitions operations among three primary user personas, ensuring secure access control throughout the venue workspace.

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Venue Owner / Manager
    actor Staff as Cleaning Staff / Chef
    actor Customer as Event Booking Client

    %% Flow 1: Lead Intake
    rect rgb(240, 246, 255)
        note right of Customer: 1. Lead Intake & CRM Pipeline
        Customer->>Tenant: Places booking inquiry (WhatsApp, Google Maps, Walk-in)
        Tenant->>Tenant: Records Inquiry in Kanban Board (Leads Page)
        Tenant->>Tenant: Converts Lead to Active Booking (Calculates slots & advances)
    end

    %% Flow 2: Invoicing & Payment
    rect rgb(240, 253, 244)
        note right of Tenant: 2. Invoice Generation & Payments
        Tenant->>Customer: Issues Bilingual Invoice (GST & Custom SAC categories)
        Customer->>Tenant: Pays deposit advance (Records via Payments page)
        Tenant->>Tenant: Supabase Trigger computes balance_amount & updates status
    end

    %% Flow 3: Cleanliness & Handovers
    rect rgb(254, 243, 199)
        note right of Staff: 3. Operations & Hall Allocation
        Tenant->>Staff: Assigns Staff role to Designated Property Hall (Manager / Cleanness)
        Staff->>Staff: Logs in to localized staff portal
        Staff->>Staff: Sees checkout times, cleans room, marks turnaround complete
        Staff->>Tenant: Status flashes Green on Venue Detail View
    end
```

---

## 3. 💾 PostgreSQL Relational Schema Schema Map

At the core of our database engine lie highly structured tables guarded by Supabase Row-Level Security (RLS). Here is how keys are referenced:

```mermaid
erDiagram
    organizations {
        uuid id PK
        varchar name
        timestamp created_at
    }
    profiles {
        uuid id PK
        uuid organization_id FK
        varchar email
        varchar full_name
        varchar role "Owner | Manager | Cleaner"
    }
    venues {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar address
    }
    halls {
        uuid id PK
        uuid venue_id FK
        varchar name
        integer capacity
        decimal base_price
    }
    bookings {
        uuid id PK
        uuid hall_id FK
        uuid customer_id FK
        date event_date
        varchar slot "Morning | Evening | Full Day"
        decimal total_amount
        decimal advance_paid
        decimal balance_amount "Computed via Trigger"
        varchar status "Confirmed | Hold | Cancelled"
    }
    leads {
        uuid id PK
        uuid venue_id FK
        varchar customer_name
        varchar status "Inquiry | Proposal | Won | Lost"
    }

    organizations ||--o{ profiles : "has users"
    organizations ||--o{ venues : "owns properties"
    venues ||--o{ halls : "contains spaces"
    venues ||--o{ leads : "receives inquiry"
    halls ||--o{ bookings : "schedules slots"
```

---

## 🛡️ Key Architectural Principles
1. **Dynamic Design Real-Time Re-rendering:** The `Brand & Design System` console dynamically injects and modifies custom properties (`--global-font`, `--primary`, `--accent`) straight to the `document.documentElement` object in React. This re-paints all tailwind-themed components instantaneously without full page refreshes.
2. **Atomic SQL Integrity:** Balance calculations are processed by a database trigger ([20260517000004_fix_schema_mismatches.sql](file:///c:/Users/kskis/.gemini/antigravity/scratch/VenuePro/supabase/migrations/20260517000004_fix_schema_mismatches.sql)), ensuring that `balance_amount = total_amount - advance_paid` is computed server-side. This completely eliminates manual synchronization bugs!
3. **Decoupled Security Layer:** Every query from our custom hooks uses standard JWT parameters issued by Supabase Auth, mapping queries specifically to the authenticated user's `organization_id` (RLS).
