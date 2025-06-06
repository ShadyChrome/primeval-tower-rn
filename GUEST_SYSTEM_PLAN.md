# Guest System Implementation Plan

This document outlines the plan for implementing a simple, robust, and maintainable guest user system. This plan was created after a "total cleanup" of a previous, more complex system that proved to be unreliable.

## 1. Core Feature: Persistent Guest Experience

The primary goal is to allow users to play the game as a "guest" without creating a formal account. Their progress and settings must be saved and persisted across multiple app sessions on the same device. This system must be simple and avoid the complexities that caused issues previously.

## 2. Key Requirements

1.  **Persistence**: A guest's game progress and settings must be saved automatically and be available the next time they open the app on the same device.
2.  **Anonymity**: The guest should not need to provide any personal information (like email or password) to play.
3.  **Simplicity**: The underlying system must be as simple as possible, avoiding complex state management, synchronization, or cleanup logic. The previous system failed because it was too complex.
4.  **Security**: While the data (game progress, settings) is not highly sensitive, it should not be publicly accessible or guessable by other users.
5.  **Clear Upgrade Path**: Guests must have a straightforward way to create a permanent account (e.g., with email/password) and have their guest progress automatically transferred to their new permanent account.

## 3. Chosen Approach: Local Device ID (No Auth for Guests)

To meet the requirements, especially simplicity, we will **completely avoid using Supabase Authentication for guest users**.

The core of the new system is a **unique Device ID**, a UUID generated and stored locally on the user's device. This ID is the sole identifier for a guest.

### How it Works:

-   When a user first opens the app, the app checks its local storage for a `device_id`.
-   If not found, it generates a new UUID and saves it locally. This is the guest's permanent identifier.
-   All guest data (progress, settings) is stored in a Supabase table against this `device_id`.
-   There is no `auth.users` entry for guests, no session tokens, and no sign-in/sign-out logic for them.

### Why this is better:

-   **Eliminates Complexity**: It removes the root cause of all our previous problems: `signInAnonymously()` creating new users and the need for cleanup.
-   **Robust**: The logic is simple and direct, with very few moving parts or potential points of failure.
-   **No Cleanup Needed**: Since we are not creating orphaned users in `auth.users`, there is zero cleanup required.

## 4. Implementation Details

### Step A: Database Schema

I will create a single new table in the `public` schema.

```sql
CREATE TABLE public.guest_data (
    -- A unique UUID generated on the client device. This is the primary key.
    device_id TEXT PRIMARY KEY,

    -- A JSONB column to store all game-related progress.
    -- Default is an empty object.
    game_progress JSONB DEFAULT '{}'::jsonb,

    -- A JSONB column for any user-specific settings.
    settings JSONB DEFAULT '{}'::jsonb,

    -- Automatically track when the data was last updated.
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.guest_data IS 'Stores non-sensitive data for guest users, identified by a device-specific ID.';
```

### Step B: Database Security (RLS)

I will enable Row Level Security on the `guest_data` table and add a simple, effective policy.

**The Policy**: Anyone can perform an action (SELECT, INSERT, UPDATE, DELETE) on a row **only if they can provide the correct `device_id` for that row.**

-   This prevents one guest from accessing another guest's data, as the `device_id` is a non-guessable UUID.
-   We will use Supabase's ability to read HTTP headers to pass the `device_id` securely from the client for RLS checks, or we will rely on it being part of the query's `WHERE` clause.

### Step C: Client-Side Logic (`lib/guestManager.ts`)

I will create one new file, `lib/guestManager.ts`, which will be the single source of truth for all guest-related operations. It will contain:

1.  **`getDeviceID()`**:
    -   Checks `AsyncStorage` for a `device_id`.
    -   If it exists, return it.
    -   If not, generate a new UUID, save it to `AsyncStorage`, and then return it.

2.  **`loadGuestData()`**:
    -   Calls `getDeviceID()`.
    -   Queries the `guest_data` table: `SELECT * FROM guest_data WHERE device_id = [the_device_id]`.
    -   Returns the `game_progress` and `settings` JSON objects.

3.  **`saveGuestData(progress, settings)`**:
    -   Calls `getDeviceID()`.
    -   Performs an "upsert" on the `guest_data` table. This will create a new row if one doesn't exist, or update the existing one for the given `device_id`.

### Step D: Upgrade Path to Permanent Account

When a user decides to sign up:

1.  The user signs up using the standard Supabase Auth UI (email/password, etc.).
2.  After a successful signup, the app will have both the `device_id` (from local storage) and the new permanent `user.id` (from the Supabase session).
3.  The app will call a new, secure database function: `migrate_guest_data(device_id_to_migrate)`.
4.  This function, running with elevated privileges on the server, will:
    -   Read the data from `public.guest_data` for the given `device_id`.
    -   Copy that data to a new `public.user_profiles` table, linking it to the newly authenticated `user.id`.
    -   Delete the old row from `public.guest_data`.
    -   Clear the local `device_id` from the device.

This ensures a seamless transition from guest to permanent user. 