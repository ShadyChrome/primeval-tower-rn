# Primeval Tower - React Native Game

A Monster Hunter-inspired mobile game built with React Native, Expo, and Supabase.

## 🚀 Current Status: Production-Ready Architecture ✅

### **Simplified Authentication System**

**Phase 4.5: Auth Simplification** - **COMPLETED** ✅
- 🔐 **Unified auth flow** - All users use anonymous auth + device mapping
- 🧹 **Clean architecture** - No legacy system complexity  
- 🛡️ **Enhanced security** - Single RLS-enabled auth system
- ⚡ **Simplified codebase** - Reduced complexity and maintenance overhead

## 🎮 Authentication Architecture

### **Simplified Guest Flow**
```
User taps "Play as Guest" → 
Anonymous Auth Creation → 
Device Mapping Storage → 
Player Creation (if new) → 
Game Access
```

### **Key Benefits**
- **Single Code Path**: No legacy fallbacks or dual systems
- **Persistent Data**: Device mapping ensures data survives app reinstalls
- **Enhanced Security**: All operations use Supabase RLS policies
- **Better Maintainability**: Simplified architecture without legacy overhead

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Authentication**: Anonymous users + device mapping
- **UI**: React Native Paper + Custom design system
- **State**: React hooks with database synchronization
- **Navigation**: React Navigation 6
- **Storage**: Supabase backend with local caching

## 📊 Database Schema

### **Core Tables**
- `players` - Auth-based player data with device mapping
- `device_user_mapping` - Device persistence across sessions
- `player_primes` - Owned Primes with progression data
- `player_runes` - Rune inventory with equipment state
- `player_inventory` - Item management system
- `player_treasure_box` - Treasure box progression

### **Authentication Tables**
- `auth.users` - Supabase anonymous users
- `device_user_mapping` - Links devices to persistent game data

## 🎯 Current State: Production Ready

### **Core Systems**
- **Authentication**: Simplified anonymous auth with device mapping
- **Player Management**: Secure player creation and data persistence
- **Shop System**: Real purchasing with gem-based transactions
- **Prime Collection**: Comprehensive prime management and display
- **Rune Equipment**: 6-slot equipment system with real-time sync
- **Design System**: Professional UI with consistent theming

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd primeaval-tower-rn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with your Supabase credentials
   EXPO_PUBLIC_SUPABASE_URL=https://lhuvdwgagffosswuqtoa.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Launch the game**
   - Tap "Play as Guest"
   - Create a new player
   - Enjoy the game experience

## 📱 App Structure

```
src/
├── screens/           # Main app screens
│   ├── LoginScreen.tsx       # Simplified guest login
│   ├── PrimesScreen.tsx      # Prime collection
│   └── PrimeDetailsScreen.tsx # Prime details + rune equipment
├── services/          # Database service layer
│   ├── shopService.ts        # Purchase operations
│   ├── primeService.ts       # Prime CRUD operations  
│   └── runeService.ts        # Rune management
├── lib/              # Core system libraries
│   ├── authManager.ts        # Simplified auth system
│   └── playerManager.ts      # Player data management
└── components/        # Reusable UI components
    └── modals/sections/RuneEquipment.tsx # Rune interface
```

## 🏗️ Architecture Highlights

### **Simplified Authentication**
- Anonymous users with device mapping for persistence
- No legacy device-based fallbacks
- Single auth code path for all users
- Enhanced security with RLS policies

### **Service Layer Pattern**
- Clean separation between UI and database operations
- Consistent error handling and data transformation
- Type-safe operations with TypeScript

## 📈 Next Development Phases

- **Phase 5: Prime Acquisition** - Unique prime collection with AXP system
- **Enhanced Shop System** - Improved purchasing and inventory
- **Battle Integration** - Combat system with rune effects
- **Advanced Features** - Events, achievements, social features

## 🔧 Development

### **Authentication Operations**
```typescript
// Initialize auth system
await AuthManager.initialize()

// Create auth-based player
const player = await PlayerManager.createPlayerWithAuth(playerName)

// Load player data
const playerData = await PlayerManager.loadPlayerDataWithAuth()
```

### **Database Operations**
```typescript
// Load player's Primes
const primes = await PrimeService.getPlayerPrimes()

// Purchase items
const result = await ShopService.purchaseEgg(eggType, quantity)

// Equipment operations
await PrimeRuneService.equipRuneToPrime(playerId, primeId, runeId, slot)
```

---

**🎉 Primeval Tower features a clean, production-ready architecture optimized for scalable development!** 