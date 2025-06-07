# Active Context: Primeval Tower

## Current Work Focus
The current focus is on establishing the foundational structure of the project. This includes setting up the initial repository, creating the Memory Bank, and defining the core architecture and technology stack.

## Recent Changes
- Initialized the React Native project.
- Created the `docs/Primeval Tower - Game Overview_EN.md` document to outline the game's design.
- Created the entire Memory Bank, including all 7 core files, to establish a baseline for project knowledge and context.
- **Confirmed Technology Stack:** Solidified the use of Supabase for the backend and Zustand for state management.

## Next Steps
1.  **Setup Basic Navigation:** Implement the bottom tab navigator with placeholder screens for `Hatching`, `Primes`, `Home`, `Bag`, and `Shop`.
2.  **Implement Header:** Create the persistent header component to display player information.
3.  **Define Data Models:** Create TypeScript interfaces for all the major data structures described in the game overview (e.g., `Prime`, `Egg`, `Rune`, `Ability`).
4.  **Backend Selection:** Finalize the choice for the backend and database technology (e.g., Supabase).
5.  **Prototype a Core Mechanic:** Begin implementation of a single, simple feature, such as displaying a static list of Primes, to validate the project setup.

## Active Decisions and Considerations
- **UI Component Library:** Deciding whether to build all UI components from scratch or use a library to speed up development. The key is to ensure the chosen approach can deliver the desired "warm, pastel, flat" aesthetic.

## Important Patterns and Preferences
- **Documentation-First:** The creation of the Memory Bank at the project's inception establishes a preference for maintaining thorough documentation throughout the development lifecycle.
- **Clear Separation of Concerns:** The initial architecture proposal separates the client, backend, UI, and game logic, indicating a preference for clean, maintainable code.

## Learnings and Project Insights
- The game design is well-defined but complex, with many interconnected systems (Primes, Elements, Hatching, Combat, Runes). A methodical, feature-by-feature approach will be necessary.
- The project's success heavily relies on getting the "feel" right, both in terms of the relaxing UI and the engaging combat loop. Early prototyping and user feedback will be valuable. 