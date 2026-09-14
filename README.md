# TradeMatch

AI-assisted job copilot for skilled trades workers

## Project Structure

This project follows the structure defined in `rules.md` and `architecture.md`:

```
/app                    # Expo Router screens (file-based routing)
  /(auth)               # Auth flow screens (login, OTP)
  /(tabs)               # Main app tabs (home, profile, jobs, prep)
/components             # Reusable UI components
/hooks                  # Custom React hooks
/services               # Firebase access layer (no direct Firestore calls in components)
/constants              # Static config, theme values, trade/country data
/utils                  # Pure helper functions (matching score, formatting, etc.)
/types                  # TypeScript types/interfaces
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values in `.env`
3. Update `app.json` extra fields with the same values

**Important:** Never commit `.env` to version control. It is already in `.gitignore`.

### 3. Run the App

```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
```

### 4. Linting & Formatting

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
```

## Tech Stack

- **Frontend:** React Native + Expo Router (SDK 57)
- **Backend:** Firebase (Authentication, Firestore)
- **Language:** TypeScript (strict mode enabled)
- **PDF Export:** expo-print
- **Linting:** ESLint + Prettier

## Documentation

See the following files for detailed project information:

- `prd.md` - Product requirements and scope
- `architecture.md` - Technical architecture and data model
- `rules.md` - Coding standards and conventions
- `phases.md` - Development roadmap
- `design.md` - UX/UI design specifications
- `memory.md` - Project context and decisions
- `ai-architecture.md` - AI/LLM integration plan (post-MVP)

## Development Rules

Key conventions from `rules.md`:

1. **TypeScript required** - No `.js`/`.jsx` files
2. **No `any` types** - Explicit typing required
3. **Components never call Firestore directly** - Use `/services` layer
4. **One component per file** - File name matches component name
5. **All writes include timestamps** - `createdAt` and `updatedAt`

## Current Status

- ✅ Project scaffolding complete
- ⏳ Firebase configuration pending
- ⏳ Phase 0 (Validation) - per `phases.md`
- ⏳ No screens implemented yet

## Next Steps

1. Add Firebase configuration to `.env`
2. Begin Phase 1 implementation per `phases.md`
3. Start with authentication flow in `/app/(auth)`
