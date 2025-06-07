# Tech Context: Primeval Tower

## Technologies Used
- **Frontend:** React Native
- **Language:** TypeScript
- **UI Framework:** Standard React Native components, potentially with a library like React Native Paper or a custom component library to achieve the desired pastel/flat aesthetic.
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Backend:** Supabase
- **Database:** Supabase (PostgreSQL)

## Development Setup
1.  **Node.js & npm/yarn:** Required for running the React Native development environment.
2.  **Expo CLI / React Native CLI:** The project seems to be a bare React Native project (`primeaval-tower-rn`), so the React Native CLI is likely used.
3.  **Code Editor:** Visual Studio Code is recommended, with extensions for Prettier, ESLint, and TypeScript.
4.  **Emulators/Simulators:** Android Studio (for Android Emulator) and Xcode (for iOS Simulator) are required for testing.
5.  **Environment Variables:** A `.env` file will be used to manage environment-specific variables like API endpoints.

## Technical Constraints
- **Performance:** As a game with potentially complex UI and animations, performance is a key constraint. Care must be taken to optimize rendering, avoid unnecessary re-renders, and offload heavy computations from the UI thread.
- **Network Dependency:** Many core features (hatching, combat validation) require a network connection to the backend. The app should handle offline scenarios gracefully, informing the user when a connection is required.
- **Platform Consistency:** The UI and functionality should be as consistent as possible between iOS and Android.

## Dependencies
- `react`
- `react-native`
- `typescript`
- `react-navigation`
- `@supabase/supabase-js`
- `zustand`
- Linters/Formatters (`eslint`, `prettier`)
- *(Additional dependencies for state management, API calls, etc., will be added as they are chosen.)*

## Tool Usage Patterns
- **Version Control:** Git is used for version control. All work should be done in feature branches and merged into a main branch via Pull Requests.
- **Package Management:** `npm` or `yarn` will be used for managing project dependencies.
- **Linting/Formatting:** ESLint and Prettier will be run automatically on pre-commit hooks to ensure code consistency and quality.
- **Component Naming:** Components should be named in `PascalCase` and stored in their own directories under `src/components/`. For example, `src/components/common/StyledButton/index.tsx`.
- **Type Definitions:** TypeScript types and interfaces should be defined alongside the components or features they are used in, or in a centralized `src/types` directory for shared types. 