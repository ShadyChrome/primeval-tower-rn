# System Patterns: Primeval Tower

## System Architecture
The application is a mobile client-server architecture.
- **Client:** A React Native application responsible for all UI rendering, user interaction, and client-side game logic. It will communicate with the backend via a RESTful API or a similar protocol like GraphQL.
- **Backend:** A server (details TBD, but could be Node.js, Supabase, etc.) that manages game data, user accounts, persistence, and complex calculations that need to be authoritative (e.g., hatching results, combat validation).

## Key Technical Decisions
- **Cross-Platform Development:** Use React Native to target both iOS and Android from a single codebase, reducing development and maintenance effort.
- **Component-Based UI:** The UI will be built using a component-based architecture (as is standard in React Native), promoting reusability and separation of concerns. The main navigation structure will be a bottom tab navigator.
- **State Management:** A robust client-side state management solution (e.g., Redux Toolkit, Zustand) will be used to manage the complex game state, including player data, Primes, inventory, and combat status.
- **Data Persistence:** Game data will be primarily stored on the server to prevent cheating and allow for a consistent experience across multiple devices. The client will cache data locally for performance and offline access where appropriate.

## Design Patterns in Use
- **Observer Pattern:** To be used for game events. For example, when a player's currency changes, the UI components observing that value will automatically update.
- **Service Locator/Dependency Injection:** To manage services like API clients, data managers, and authentication handlers, making them easily accessible throughout the application and simple to mock for testing.
- **State Pattern:** To manage the state of complex entities like a Prime during combat (e.g., `Idle`, `Attacking`, `Stunned`).

## Component Relationships
```mermaid
graph TD
    subgraph Client (React Native)
        App[App Entry Point] --> Nav[Tab Navigator]
        Nav --> Header[Header Component]
        Nav --> HatchingScreen[Hatching Screen]
        Nav --> PrimesScreen[Primes Screen]
        Nav --> HomeScreen[Home Screen]
        Nav --> BagScreen[Bag Screen]
        Nav --> ShopScreen[Shop Screen]

        Header -- displays --> PlayerInfo[Player Name, Level, XP, Resources]

        PrimesScreen --> PrimeList[Prime List]
        PrimeList --> PrimeDetails[Prime Details]
        PrimeDetails --> RuneUI[Rune Equipment UI]

        HomeScreen --> TowerUI[Tower Battle UI]
        TowerUI --> CombatSystem[Combat Logic]
    end

    subgraph Backend
        API[API Endpoint]
        DB[Database]
        Auth[Auth Service]

        API --> DB
        API --> Auth
    end

    Client -- HTTP/API Calls --> Backend

```

## Critical Implementation Paths
1.  **Hatching System:** The full pipeline from purchasing an Egg, applying enhancers, communicating with the backend to determine the hatch result based on complex probability rules, and displaying the new Prime to the user.
2.  **Combat Logic:** Implementing the turn-based, stamina-driven combat system. This includes calculating damage based on the specified formula (Pokémon-like), handling initiative (Summoners War-like), status effects, and threat generation.
3.  **Data Synchronization:** Ensuring that the client state is always in sync with the backend, especially for critical data like currency, Prime ownership, and progression. This path is vital for the integrity of the player's account. 