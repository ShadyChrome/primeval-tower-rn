# Primeval Tower - React Native Game

A Monster Hunter-inspired mobile game built with React Native, Expo, and Supabase.

## 🚀 Current Status: Phase 3 Complete ✅

### **Fully Integrated Supabase Backend System**

**Phase 3: Rune System** - **COMPLETED** ✅
- 🔮 **Complete rune equipment system** with 6-slot flower layout
- 🎯 **Prime-specific rune management** with cross-Prime awareness  
- 📊 **Real-time stat calculations** from equipped runes
- 🗄️ **Full Supabase backend integration** (zero mock data!)
- 🔐 **Device-based authentication** with PlayerManager
- ⚡ **Real-time synchronization** with in-memory caching

## 🎮 Key Features

### **Rune System (Production Ready)**
- **Equipment Interface**: 6-slot hexagonal flower layout with center stats display
- **Prime-Specific Storage**: Each Prime maintains their own rune equipment
- **Cross-Prime Management**: Equipped runes unavailable to other Primes
- **Database Integration**: All data persisted to Supabase with real-time sync
- **Stat Filtering**: Filter runes by Attack, Defense, Speed, and more
- **Visual Feedback**: Immediate UI updates with database persistence

### **Backend Architecture**
- **Authentication**: Device-based auth with automatic player creation
- **Database**: PostgreSQL via Supabase with proper relationships
- **Services**: Clean separation with PrimeService, RuneService, PrimeRuneService
- **Security**: Row Level Security policies for data protection
- **Performance**: In-memory caching with database as source of truth

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **UI**: React Native Paper + Custom components
- **State**: React hooks with database synchronization
- **Navigation**: React Navigation 6
- **Storage**: Supabase backend with caching layer

## 📊 Database Schema

### **Core Tables**
- `players` - Device-based player authentication
- `player_primes` - Owned Primes with progression data
- `player_runes` - Rune inventory with equipment state

### **Key Relationships**
- Primes belong to players (player_id foreign key)
- Runes belong to players and optionally equipped to Primes
- Equipment tracking via prime_id and equipped_slot columns

## 🎯 Current Data

### **Player: "Shady"**
- **11 Primes**: Including Rathalos, Mizutsune, Zinogre, Nargacuga, Teostra
- **17 Runes**: Diverse collection across all types and tiers
- **Real Equipment**: Runes can be equipped/unequipped with full persistence

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

## 📱 App Structure

```
src/
├── screens/           # Main app screens
│   ├── PrimesScreen.tsx      # Prime collection (database-driven)
│   └── PrimeDetailsScreen.tsx # Prime details + rune equipment
├── services/          # Database service layer
│   ├── primeService.ts       # Prime CRUD operations
│   ├── runeService.ts        # Rune management
│   └── primeRuneService.ts   # Equipment operations
├── components/        # Reusable UI components
│   └── modals/sections/RuneEquipment.tsx # Main rune interface
└── utils/            # Utility functions
    └── primeRuneStorage.ts   # Persistence layer
```

## 🏗️ Architecture Highlights

### **Service Layer Pattern**
- Clean separation between UI and database operations
- Consistent error handling and data transformation
- Type-safe operations with TypeScript

### **Real-time Synchronization**
- Database as single source of truth
- In-memory caching for UI responsiveness
- Automatic cache invalidation on updates

### **Device-Based Authentication**
- No user registration required
- Automatic player creation on first launch
- Secure device identification with PlayerManager

## 📈 Next Steps

- **Phase 4: Battle System** - Integrate rune effects in combat
- **Prime Evolution** - Level up and evolve Primes
- **Enhanced Runes** - Upgrade system for rune improvement
- **Multiplayer** - Compare collections with other players

---

## 🔧 Development

### **Database Operations**
All database operations go through the service layer:
```typescript
// Load player's Primes
const primes = await PrimeService.getPlayerPrimes()

// Equip a rune
await PrimeRuneService.equipRuneToPrime(playerId, primeId, runeId, slot)

// Get available runes
const runes = await RuneService.getAvailableRunes()
```

### **State Management**
Components use React hooks with database synchronization:
```typescript
const [primes, setPrimes] = useState<UIPrime[]>([])
const [equippedRunes, setEquippedRunes] = useState<PlayerRune[]>([])

// Load data from database
useEffect(() => {
  loadPrimesFromDatabase()
}, [])
```

**🎉 Primeval Tower is now production-ready with complete Supabase backend integration!** 