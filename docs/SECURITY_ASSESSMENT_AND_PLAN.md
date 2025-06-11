# Primeval Tower - Security Assessment & Improvement Plan

## 🔍 **Current Architecture Analysis**

### **Existing Authentication System**
- **Device-based Guest Accounts**: Players identified by `device_id` stored in AsyncStorage
- **Supabase Integration**: Direct database access using anon key with player identification via `device_id`
- **RLS Status**: Currently disabled due to implementation challenges with device ID authentication
- **Player Management**: `PlayerManager` class handles device ID generation and player lookup

### **Security Philosophy**
The current system prioritizes:
- **Ease of Use**: No registration required, instant play
- **Simplicity**: Device-based identity without complex auth flows
- **Development Speed**: Direct database access for rapid prototyping

---

## 🚨 **Identified Security Vulnerabilities**

### **Critical Issues (Must Address)**

#### 1. **Economic System Exploitation**
- **Location**: `components/TreasureBox.tsx` - Lines 94-131
- **Issue**: Gem accumulation calculated client-side
- **Risk**: Players can manipulate time calculations to generate unlimited gems
- **Impact**: Complete economic system compromise

```typescript
// VULNERABLE: Client calculates gems
const minutesElapsed = Math.min(diffInSeconds / 60, 30 * 60)
const calculatedGems = Math.floor(minutesElapsed) // 1 gem per minute
```

#### 2. **Item Duplication Vulnerability**
- **Location**: `src/services/inventoryService.ts` - Lines 183-220
- **Issue**: No atomic transaction validation for item consumption
- **Risk**: Race conditions allowing item duplication
- **Impact**: Unlimited resources, game economy broken

#### 3. **Upgrade Cost Manipulation**
- **Location**: `src/hooks/usePrimeUpgrade.tsx` - Lines 264-289
- **Issue**: Upgrade costs calculated client-side
- **Risk**: Players can modify cost calculations
- **Impact**: Free upgrades, progression system bypassed

```typescript
// VULNERABLE: Client determines costs
const baseCost = Math.floor((50 + abilityLevel * 25) * rarityMultiplier)
```

#### 4. **Game Constants Exposure**
- **Location**: Multiple files (inventoryService.ts, etc.)
- **Issue**: XP values, costs, and game balance stored in client code
- **Risk**: Easy modification of game balance parameters
- **Impact**: Completely unbalanced gameplay

### **Medium Priority Issues**

#### 5. **Device ID Spoofing**
- **Location**: `lib/playerManager.ts` - Lines 26-44
- **Issue**: Device ID can be reset to create new accounts
- **Risk**: Players can reset progress for better RNG or avoid penalties
- **Impact**: Achievement/leaderboard integrity compromised

#### 6. **Direct Database Access**
- **Location**: All service files
- **Issue**: Client has direct access to database operations
- **Risk**: Potential for sophisticated database manipulation
- **Impact**: Complete data integrity compromise

---

## 📋 **Revised Security Plan (RLS-Free Approach)**

### **Phase 1: Server-Side Validation Functions (Week 1-2)**

Instead of RLS, implement server-side validation using PostgreSQL functions that the client cannot bypass.

#### 1.1 **Secure Treasure Box Implementation**

Create a server function that validates device ownership and calculates gems server-side:

```sql
-- Create secure treasure box function that validates device ownership
CREATE OR REPLACE FUNCTION secure_treasure_box_claim(p_device_id TEXT)
RETURNS TABLE(
  gems_claimed INTEGER,
  new_gem_total INTEGER,
  success BOOLEAN,
  message TEXT
)
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_last_claim TIMESTAMP;
  v_current_gems INTEGER;
  v_minutes_elapsed INTEGER;
  v_gems_to_award INTEGER;
  v_max_storage INTEGER := 300;
  v_gems_per_minute INTEGER := 1;
BEGIN
  -- Find player by device ID (server validation)
  SELECT id INTO v_player_id 
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN QUERY SELECT 0, 0, FALSE, 'Player not found'::TEXT;
    RETURN;
  END IF;
  
  -- Get treasure box data
  SELECT last_claim_time INTO v_last_claim
  FROM player_treasure_box 
  WHERE player_id = v_player_id;
  
  -- Server-side time calculation (cannot be manipulated)
  v_minutes_elapsed := GREATEST(0, 
    EXTRACT(EPOCH FROM (NOW() - v_last_claim)) / 60
  );
  
  -- Cap at maximum storage time (30 hours = 1800 minutes)
  v_minutes_elapsed := LEAST(v_minutes_elapsed, 1800);
  v_gems_to_award := v_minutes_elapsed * v_gems_per_minute;
  
  IF v_gems_to_award <= 0 THEN
    SELECT gems INTO v_current_gems FROM players WHERE id = v_player_id;
    RETURN QUERY SELECT 0, v_current_gems, FALSE, 'No gems to claim'::TEXT;
    RETURN;
  END IF;
  
  -- Atomic update of gems and claim time
  UPDATE players 
  SET gems = gems + v_gems_to_award,
      updated_at = NOW()
  WHERE id = v_player_id
  RETURNING gems INTO v_current_gems;
  
  UPDATE player_treasure_box 
  SET last_claim_time = NOW(),
      total_gems_generated = total_gems_generated + v_gems_to_award
  WHERE player_id = v_player_id;
  
  RETURN QUERY SELECT v_gems_to_award, v_current_gems, TRUE, 'Success'::TEXT;
END;
$$ LANGUAGE plpgsql;
```

#### 1.2 **Secure Item Consumption**

```sql
-- Server-side item consumption with device validation
CREATE OR REPLACE FUNCTION secure_consume_items(
  p_device_id TEXT,
  p_item_type TEXT,
  p_item_id TEXT,
  p_quantity INTEGER
)
RETURNS TABLE(success BOOLEAN, remaining_quantity INTEGER, message TEXT)
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Validate device ownership
  SELECT id INTO v_player_id FROM players WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Unauthorized'::TEXT;
    RETURN;
  END IF;
  
  -- Check current quantity
  SELECT quantity INTO v_current_quantity
  FROM player_inventory
  WHERE player_id = v_player_id 
    AND item_type = p_item_type 
    AND item_id = p_item_id;
    
  IF v_current_quantity IS NULL OR v_current_quantity < p_quantity THEN
    RETURN QUERY SELECT FALSE, COALESCE(v_current_quantity, 0), 'Insufficient items'::TEXT;
    RETURN;
  END IF;
  
  -- Atomic consumption
  UPDATE player_inventory
  SET quantity = quantity - p_quantity,
      updated_at = NOW()
  WHERE player_id = v_player_id 
    AND item_type = p_item_type 
    AND item_id = p_item_id
  RETURNING quantity INTO v_new_quantity;
  
  RETURN QUERY SELECT TRUE, v_new_quantity, 'Success'::TEXT;
END;
$$ LANGUAGE plpgsql;
```

#### 1.3 **Game Configuration Table**

Move all game constants to the database where they cannot be modified:

```sql
-- Create immutable game configuration
CREATE TABLE IF NOT EXISTS game_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert game constants (these replace client-side hardcoded values)
INSERT INTO game_config (config_key, config_value) VALUES
  ('xp_potion_values', '{
    "small_xp_potion": 50,
    "medium_xp_potion": 150,
    "large_xp_potion": 400,
    "huge_xp_potion": 1000
  }'),
  ('treasure_box_config', '{
    "gems_per_minute": 1,
    "max_storage": 300,
    "max_hours": 30
  }'),
  ('upgrade_costs', '{
    "base_cost": 50,
    "level_multiplier": 25,
    "rarity_multipliers": {
      "Common": 1,
      "Rare": 1.5,
      "Epic": 2,
      "Legendary": 3,
      "Mythical": 4
    }
  }'),
  ('shop_prices', '{
    "eggs": {
      "common_egg": 100,
      "rare_egg": 250,
      "epic_egg": 500,
      "legendary_egg": 1000,
      "mythical_egg": 2500
    },
    "enhancers": {
      "element_enhancer": 50,
      "rarity_amplifier": 100,
      "rainbow_enhancer": 200
    }
  }')
ON CONFLICT (config_key) DO NOTHING;
```

### **Phase 2: Client-Side Security Updates (Week 3-4)**

Update client code to use secure server functions instead of local calculations.

#### 2.1 **Secure TreasureBoxManager**

```typescript
// Updated TreasureBoxManager to use server validation
export class SecureTreasureBoxManager {
  /**
   * Claim gems using server-side validation
   */
  static async claimTreasureBoxGems(deviceId: string): Promise<TreasureBoxClaim | null> {
    try {
      console.log('💎 Claiming treasure box gems (server-validated)...')
      
      const { data, error } = await supabase
        .rpc('secure_treasure_box_claim', { p_device_id: deviceId })
      
      if (error) {
        console.error('❌ Server validation failed:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        const result = data[0]
        console.log('✅ Server-validated claim:', result)
        return {
          gems_claimed: result.gems_claimed,
          new_gem_total: result.new_gem_total,
          success: result.success,
          message: result.message
        }
      }
      
      return null
    } catch (error) {
      console.error('Error claiming gems:', error)
      return null
    }
  }

  /**
   * Get treasure box status (server calculates accumulated gems)
   */
  static async getTreasureBoxStatus(deviceId: string): Promise<TreasureBoxStatus | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_treasure_box_status', { p_device_id: deviceId })
      
      if (error) throw error
      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error('Error getting treasure box status:', error)
      return null
    }
  }
}
```

#### 2.2 **Secure Inventory Operations**

```typescript
// Updated InventoryService with server validation
export class SecureInventoryService {
  /**
   * Consume items with server-side validation
   */
  static async consumeItem(
    deviceId: string,
    itemType: string,
    itemId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('secure_consume_items', {
          p_device_id: deviceId,
          p_item_type: itemType,
          p_item_id: itemId,
          p_quantity: quantity
        })
      
      if (error) throw error
      
      const result = data && data.length > 0 ? data[0] : null
      if (!result || !result.success) {
        console.warn('Item consumption failed:', result?.message)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error consuming item:', error)
      return false
    }
  }

  /**
   * Get game configuration from server
   */
  static async getGameConfig(configKey: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('game_config')
        .select('config_value')
        .eq('config_key', configKey)
        .single()
      
      if (error) throw error
      return data?.config_value
    } catch (error) {
      console.error('Error fetching game config:', error)
      return null
    }
  }
}
```

### **Phase 3: Enhanced Device Authentication (Week 5-6)**

Strengthen device authentication while maintaining the guest account system.

#### 3.1 **Enhanced Device Fingerprinting**

```typescript
// Enhanced PlayerManager with better device security
export class SecurePlayerManager extends PlayerManager {
  /**
   * Generate a more secure device ID
   */
  static async getSecureDeviceID(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('secure_device_id')
      
      if (!deviceId) {
        // Create more robust device fingerprint
        const deviceType = await Device.getDeviceTypeAsync()
        const brand = Device.brand || 'unknown'
        const modelName = Device.modelName || 'unknown'
        const osVersion = Device.osVersion || 'unknown'
        
        // Add entropy to prevent collisions
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        
        // Create composite fingerprint
        deviceId = `${deviceType}_${brand}_${modelName}_${osVersion}_${timestamp}_${randomId}`
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
        
        await AsyncStorage.setItem('secure_device_id', deviceId)
        console.log('🔐 Created secure device ID:', deviceId.substring(0, 20) + '...')
      }
      
      return deviceId
    } catch (error) {
      console.error('Error creating secure device ID:', error)
      // Fallback to original method
      return await super.getDeviceID()
    }
  }

  /**
   * Validate device integrity
   */
  static async validateDeviceIntegrity(): Promise<boolean> {
    try {
      const storedDeviceId = await AsyncStorage.getItem('secure_device_id')
      if (!storedDeviceId) return false
      
      // Check if device characteristics still match
      const currentFingerprint = await this.getCurrentDeviceFingerprint()
      const storedFingerprint = storedDeviceId.split('_').slice(0, 4).join('_')
      
      return currentFingerprint === storedFingerprint
    } catch (error) {
      console.error('Device integrity check failed:', error)
      return false
    }
  }

  private static async getCurrentDeviceFingerprint(): Promise<string> {
    const deviceType = await Device.getDeviceTypeAsync()
    const brand = Device.brand || 'unknown'
    const modelName = Device.modelName || 'unknown'
    const osVersion = Device.osVersion || 'unknown'
    
    return `${deviceType}_${brand}_${modelName}_${osVersion}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
  }
}
```

#### 3.2 **Device Session Management**

```sql
-- Add device session tracking
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  player_id UUID REFERENCES players(id),
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  device_fingerprint JSONB
);

-- Function to create device session
CREATE OR REPLACE FUNCTION create_device_session(
  p_device_id TEXT,
  p_device_fingerprint JSONB DEFAULT NULL
)
RETURNS TABLE(session_token TEXT, player_id UUID)
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_session_token TEXT;
BEGIN
  -- Find or create player
  SELECT id INTO v_player_id FROM players WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Generate secure session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Deactivate old sessions for this device
  UPDATE device_sessions 
  SET is_active = FALSE 
  WHERE device_id = p_device_id AND is_active = TRUE;
  
  -- Create new session
  INSERT INTO device_sessions (device_id, player_id, session_token, device_fingerprint)
  VALUES (p_device_id, v_player_id, v_session_token, p_device_fingerprint);
  
  RETURN QUERY SELECT v_session_token, v_player_id;
END;
$$ LANGUAGE plpgsql;
```

### **Phase 4: Monitoring & Detection (Week 7-8)**

Implement monitoring without breaking the existing flow.

#### 4.1 **Anomaly Detection**

```sql
-- Create activity monitoring table
CREATE TABLE IF NOT EXISTS player_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  player_id UUID REFERENCES players(id),
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  is_suspicious BOOLEAN DEFAULT FALSE
);

-- Function to log and check for suspicious activity
CREATE OR REPLACE FUNCTION log_player_activity(
  p_device_id TEXT,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN -- Returns TRUE if activity seems suspicious
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_recent_count INTEGER;
  v_is_suspicious BOOLEAN := FALSE;
BEGIN
  -- Get player ID
  SELECT id INTO v_player_id FROM players WHERE device_id = p_device_id;
  
  -- Check for rate limit violations
  IF p_activity_type IN ('gem_claim', 'item_purchase', 'prime_upgrade') THEN
    SELECT COUNT(*) INTO v_recent_count
    FROM player_activity_log
    WHERE device_id = p_device_id
      AND activity_type = p_activity_type
      AND timestamp > NOW() - INTERVAL '1 minute';
    
    -- Flag if more than 10 operations per minute
    IF v_recent_count > 10 THEN
      v_is_suspicious := TRUE;
    END IF;
  END IF;
  
  -- Log the activity
  INSERT INTO player_activity_log (
    device_id, player_id, activity_type, activity_data, is_suspicious
  ) VALUES (
    p_device_id, v_player_id, p_activity_type, p_activity_data, v_is_suspicious
  );
  
  RETURN v_is_suspicious;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 **Implementation Strategy**

### **Immediate Actions (This Week)**
1. ✅ Create secure database functions for treasure box and item operations
2. ✅ Move game constants to `game_config` table
3. ✅ Update client code to use server functions
4. ✅ Test that device ID authentication still works with new functions

### **Next Steps (Following Weeks)**
1. ✅ Enhanced device fingerprinting
2. ✅ Activity monitoring implementation
3. ✅ Anomaly detection system
4. ✅ Performance optimization of secure functions

### **Benefits of This Approach**
- ✅ **Maintains guest account system** - No breaking changes to UX
- ✅ **Works without RLS** - Uses SECURITY DEFINER functions instead
- ✅ **Preserves device ID auth** - Enhances rather than replaces current system
- ✅ **Gradual implementation** - Can be deployed incrementally
- ✅ **Minimal client changes** - Most security happens server-side

### **Testing Strategy**
1. ✅ Test device ID authentication still works
2. ✅ Verify treasure box claims are server-validated
3. ✅ Confirm item operations are secure
4. ✅ Check that legitimate gameplay is unaffected
5. ✅ Validate that common exploits are prevented

---

## 📊 **Security Metrics to Monitor**

1. **Economic Anomalies**: Unusual gem accumulation patterns
2. **Device Switching**: Frequent device ID changes from same source
3. **Rate Violations**: Rapid successive operations
4. **Data Inconsistencies**: Client-server state mismatches
5. **Progress Anomalies**: Unrealistic advancement rates

This plan maintains your current architecture while significantly improving security. The key is moving validation to the database level where it cannot be tampered with, while keeping the simple device-based authentication that players love. 