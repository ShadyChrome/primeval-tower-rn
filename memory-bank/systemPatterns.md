# System Patterns

## Authentication Architecture

### Current: Simplified Anonymous Auth System
- **Single Path Flow**: All users → Anonymous Auth → Device Mapping → Player Creation
- **No Legacy Systems**: Removed device-based fallbacks and dual-path complexity
- **Persistent Data**: Device mapping table ensures cross-session persistence
- **Enhanced Security**: All operations use Supabase RLS policies
- **Clean Testing**: Database reset capabilities for development

### Key Components
1. **AuthManager**: Handles anonymous user creation and device mapping
2. **PlayerManager**: Manages auth-based player operations only
3. **Device Mapping**: Links device IDs to persistent game user IDs
4. **Clean Architecture**: Single code path without legacy complexity

### Authentication Flow
```
App Launch → AuthManager.initialize() → 
Check existing session → Create anonymous user → 
Update device mapping → Check for existing player → 
Show login or game screen
```

## Database Architecture

### Current State: Clean Testing Environment
- **All tables cleared**: 0 records in all player-related tables
- **Reset sequences**: Auto-increment IDs start from 1
- **No legacy data**: Fresh state for development and testing
- **Clean auth state**: No existing anonymous users

### Core Tables
- `players` - Auth-based player data with device mapping
- `device_user_mapping` - Device persistence across sessions  
- `player_inventory` - Item management system
- `player_primes` - Owned primes with progression
- `player_runes` - Rune inventory and equipment
- `player_treasure_box` - Treasure box progression

### Service Layer Pattern
- **Separation of Concerns**: UI components → Services → Database
- **Type Safety**: Full TypeScript coverage across all operations
- **Error Handling**: Consistent error management and user feedback
- **Real-time Sync**: Database as source of truth with local caching

## Component Architecture

### Design System Integration
- **Unified Theme**: Consistent colors, spacing, and typography
- **Reusable Components**: GradientCard, ModernCard, PrimeImage
- **Element-Based Theming**: Color schemes based on prime elements
- **Mobile-First**: Optimized layouts for mobile portrait orientation

### Navigation Patterns
- **Stack Navigation**: Screen-based navigation with proper state management
- **Modal Integration**: Both modal and screen approaches for Prime details
- **Type-Safe Routes**: TypeScript navigation with proper route typing
- **State Preservation**: Proper state management across navigation

## Development Patterns

### Testing Infrastructure
- **Cleanup Utilities**: `clearAllTestData()` for resetting environment
- **Database Scripts**: SQL scripts for comprehensive data cleanup
- **Verification Tools**: Functions to verify clean state
- **Fresh Environment**: Complete reset capabilities for testing cycles

### Code Organization
```
lib/                    # Core system libraries
├── authManager.ts      # Simplified auth system
├── playerManager.ts    # Auth-based player management
└── testPlayerData.ts   # Testing and cleanup utilities

src/services/          # Database service layer
├── shopService.ts     # Purchase operations
├── primeService.ts    # Prime CRUD operations
└── runeService.ts     # Rune management

src/screens/           # Main application screens
├── LoginScreen.tsx    # Simplified guest login
├── PrimesScreen.tsx   # Prime collection display
└── PrimeDetailsScreen.tsx # Prime details and equipment
```

### Data Flow Patterns
1. **Authentication**: Anonymous auth → Device mapping → Player data
2. **Player Operations**: All operations through auth-based methods only
3. **Database Sync**: Real-time synchronization with local caching
4. **State Management**: React hooks with database integration

## Performance Patterns

### Database Optimization
- **Atomic Operations**: Single RPC calls for complex operations
- **Efficient Queries**: Optimized database functions for performance
- **Connection Pooling**: Supabase handles connection management
- **Index Usage**: Proper indexes for frequently queried data

### UI Performance
- **Component Memoization**: Prevent unnecessary re-renders
- **Efficient Updates**: Minimal DOM updates with proper key usage
- **Image Optimization**: WebP images with FastImage for performance
- **Lazy Loading**: Load data on demand for better performance

## Security Patterns

### Row Level Security (RLS)
- **User-Based Access**: All queries filtered by authenticated user
- **Device Validation**: Server-side device ID validation
- **Secure Functions**: SECURITY DEFINER functions for sensitive operations
- **Auth Context**: All operations require proper authentication context

### Data Validation
- **Server-Side Validation**: All business logic validated on server
- **Type Safety**: TypeScript ensures type correctness
- **Input Sanitization**: Proper sanitization of user inputs
- **Error Boundaries**: Graceful error handling and recovery

## Migration Patterns

### Legacy System Removal
- **Clean Removal**: All device-based legacy code removed
- **Simplified Codebase**: Single auth path reduces complexity
- **Documentation Updates**: All docs reflect new simplified architecture
- **Testing Support**: Comprehensive cleanup for fresh testing environments

### Future Extensibility
- **Anonymous to Permanent**: Clear path for user account upgrades
- **Social Features**: Architecture supports multiplayer features
- **Advanced Auth**: Can extend to OAuth providers if needed
- **Scalability**: Designed for production-scale usage 