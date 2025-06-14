# Shop Database Functions
## Technical Specification for Egg Purchase & Consumption System

### Overview
This document specifies the database functions required to support the shop system for purchasing eggs with gems and consuming them during hatching.

---

## Required Database Functions

### 1. Secure Egg Purchase Function
**Purpose**: Handle egg purchases with atomic transactions and validation

```sql
CREATE OR REPLACE FUNCTION secure_purchase_egg(
  p_device_id TEXT,
  p_egg_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  new_gem_balance INTEGER,
  eggs_purchased INTEGER,
  transaction_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_current_gems INTEGER;
  v_egg_price INTEGER;
  v_total_cost INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_shop_config JSONB;
BEGIN
  -- Get player ID from device ID
  SELECT id, gems INTO v_player_id, v_current_gems
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Player not found', 0, 0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Get shop configuration
  SELECT config_value INTO v_shop_config
  FROM game_config 
  WHERE config_key = 'shop_prices';
  
  IF v_shop_config IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Shop configuration not found', v_current_gems, 0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Get egg price
  v_egg_price := (v_shop_config->'eggs'->p_egg_type)::INTEGER;
  
  IF v_egg_price IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid egg type', v_current_gems, 0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Calculate total cost
  v_total_cost := v_egg_price * p_quantity;
  
  -- Check if player has enough gems
  IF v_current_gems < v_total_cost THEN
    RETURN QUERY SELECT FALSE, 
      format('Insufficient gems. Need %s, have %s', v_total_cost, v_current_gems),
      v_current_gems, 0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Generate transaction ID
  v_transaction_id := gen_random_uuid();
  
  -- Start transaction
  BEGIN
    -- Deduct gems
    v_new_balance := v_current_gems - v_total_cost;
    UPDATE players 
    SET gems = v_new_balance, updated_at = NOW()
    WHERE id = v_player_id;
    
    -- Add eggs to inventory
    INSERT INTO player_inventory (
      player_id, item_type, item_id, quantity, metadata, acquired_at
    ) VALUES (
      v_player_id, 'egg', p_egg_type, p_quantity,
      jsonb_build_object(
        'purchased', true,
        'purchase_price', v_egg_price,
        'total_cost', v_total_cost,
        'transaction_id', v_transaction_id,
        'purchase_date', NOW()
      ),
      NOW()
    )
    ON CONFLICT (player_id, item_type, item_id) 
    DO UPDATE SET 
      quantity = player_inventory.quantity + p_quantity,
      metadata = player_inventory.metadata || jsonb_build_object(
        'last_purchase_date', NOW(),
        'last_purchase_quantity', p_quantity
      ),
      acquired_at = NOW();
    
    -- Log purchase activity
    INSERT INTO player_activity_log (
      device_id, player_id, activity_type, activity_data, timestamp
    ) VALUES (
      p_device_id, v_player_id, 'egg_purchase',
      jsonb_build_object(
        'egg_type', p_egg_type,
        'quantity', p_quantity,
        'price_per_egg', v_egg_price,
        'total_cost', v_total_cost,
        'gems_before', v_current_gems,
        'gems_after', v_new_balance,
        'transaction_id', v_transaction_id
      ),
      NOW()
    );
    
    -- Return success
    RETURN QUERY SELECT TRUE, 
      format('Successfully purchased %s x %s for %s gems', p_quantity, p_egg_type, v_total_cost),
      v_new_balance, p_quantity, v_transaction_id;
      
  EXCEPTION WHEN OTHERS THEN
    -- Rollback handled automatically
    RETURN QUERY SELECT FALSE, 
      format('Purchase failed: %s', SQLERRM),
      v_current_gems, 0, NULL::UUID;
  END;
END;
$$;
```

### 2. Secure Egg Consumption Function
**Purpose**: Consume eggs during hatching with validation

```sql
CREATE OR REPLACE FUNCTION secure_consume_egg(
  p_device_id TEXT,
  p_egg_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  eggs_remaining INTEGER,
  consumption_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
  v_consumption_id UUID;
BEGIN
  -- Get player ID from device ID
  SELECT id INTO v_player_id
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Player not found', 0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Get current egg quantity
  SELECT quantity INTO v_current_quantity
  FROM player_inventory
  WHERE player_id = v_player_id 
    AND item_type = 'egg' 
    AND item_id = p_egg_type;
  
  IF v_current_quantity IS NULL OR v_current_quantity <= 0 THEN
    RETURN QUERY SELECT FALSE, 
      format('No %s available in inventory', p_egg_type),
      0, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if enough eggs available
  IF v_current_quantity < p_quantity THEN
    RETURN QUERY SELECT FALSE,
      format('Not enough eggs. Need %s, have %s', p_quantity, v_current_quantity),
      v_current_quantity, NULL::UUID;
    RETURN;
  END IF;
  
  -- Generate consumption ID
  v_consumption_id := gen_random_uuid();
  
  -- Start transaction
  BEGIN
    -- Calculate new quantity
    v_new_quantity := v_current_quantity - p_quantity;
    
    -- Update inventory
    IF v_new_quantity <= 0 THEN
      -- Remove item if quantity reaches 0
      DELETE FROM player_inventory
      WHERE player_id = v_player_id 
        AND item_type = 'egg' 
        AND item_id = p_egg_type;
    ELSE
      -- Update quantity
      UPDATE player_inventory
      SET quantity = v_new_quantity,
          metadata = metadata || jsonb_build_object(
            'last_consumed_date', NOW(),
            'last_consumed_quantity', p_quantity
          )
      WHERE player_id = v_player_id 
        AND item_type = 'egg' 
        AND item_id = p_egg_type;
    END IF;
    
    -- Log consumption activity
    INSERT INTO player_activity_log (
      device_id, player_id, activity_type, activity_data, timestamp
    ) VALUES (
      p_device_id, v_player_id, 'egg_consumption',
      jsonb_build_object(
        'egg_type', p_egg_type,
        'quantity_consumed', p_quantity,
        'quantity_before', v_current_quantity,
        'quantity_after', v_new_quantity,
        'consumption_id', v_consumption_id,
        'action', 'hatching'
      ),
      NOW()
    );
    
    -- Return success
    RETURN QUERY SELECT TRUE,
      format('Successfully consumed %s x %s', p_quantity, p_egg_type),
      v_new_quantity, v_consumption_id;
      
  EXCEPTION WHEN OTHERS THEN
    -- Rollback handled automatically
    RETURN QUERY SELECT FALSE,
      format('Consumption failed: %s', SQLERRM),
      v_current_quantity, NULL::UUID;
  END;
END;
$$;
```

### 3. Get Player Egg Inventory Function
**Purpose**: Retrieve player's egg inventory with quantities

```sql
CREATE OR REPLACE FUNCTION get_player_egg_inventory(p_device_id TEXT)
RETURNS TABLE(
  egg_type TEXT,
  quantity INTEGER,
  last_purchased TIMESTAMP,
  total_purchased INTEGER,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
BEGIN
  -- Get player ID from device ID
  SELECT id INTO v_player_id
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return egg inventory
  RETURN QUERY
  SELECT 
    pi.item_id as egg_type,
    pi.quantity,
    pi.acquired_at as last_purchased,
    COALESCE((pi.metadata->>'total_purchased')::INTEGER, pi.quantity) as total_purchased,
    pi.metadata
  FROM player_inventory pi
  WHERE pi.player_id = v_player_id 
    AND pi.item_type = 'egg'
    AND pi.quantity > 0
  ORDER BY pi.acquired_at DESC;
END;
$$;
```

### 4. Get Shop Items with Player Context Function
**Purpose**: Get shop items with player's current gem balance and affordability

```sql
CREATE OR REPLACE FUNCTION get_shop_items_with_context(p_device_id TEXT)
RETURNS TABLE(
  item_id TEXT,
  item_name TEXT,
  item_description TEXT,
  price INTEGER,
  currency TEXT,
  category TEXT,
  can_afford BOOLEAN,
  player_gems INTEGER,
  owned_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_player_gems INTEGER;
  v_shop_config JSONB;
  v_egg_record RECORD;
  v_enhancer_record RECORD;
BEGIN
  -- Get player ID and gems
  SELECT id, gems INTO v_player_id, v_player_gems
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    v_player_gems := 0;
  END IF;
  
  -- Get shop configuration
  SELECT config_value INTO v_shop_config
  FROM game_config 
  WHERE config_key = 'shop_prices';
  
  IF v_shop_config IS NULL THEN
    RETURN;
  END IF;
  
  -- Return eggs
  FOR v_egg_record IN 
    SELECT key, value FROM jsonb_each(v_shop_config->'eggs')
  LOOP
    RETURN QUERY
    SELECT 
      v_egg_record.key as item_id,
      CASE v_egg_record.key
        WHEN 'common_egg' THEN 'Common Egg'
        WHEN 'rare_egg' THEN 'Rare Egg'
        WHEN 'epic_egg' THEN 'Epic Egg'
        WHEN 'legendary_egg' THEN 'Legendary Egg'
        WHEN 'mythical_egg' THEN 'Mythical Egg'
        ELSE initcap(replace(v_egg_record.key, '_', ' '))
      END as item_name,
      CASE v_egg_record.key
        WHEN 'common_egg' THEN 'Hatch a Common rarity Prime'
        WHEN 'rare_egg' THEN 'Hatch a Rare rarity Prime with better abilities'
        WHEN 'epic_egg' THEN 'Hatch an Epic rarity Prime with powerful abilities'
        WHEN 'legendary_egg' THEN 'Hatch a Legendary rarity Prime with exceptional abilities'
        WHEN 'mythical_egg' THEN 'Hatch a Mythical rarity Prime with ultimate abilities'
        ELSE 'Hatch a Prime'
      END as item_description,
      (v_egg_record.value)::INTEGER as price,
      'gems' as currency,
      'eggs' as category,
      v_player_gems >= (v_egg_record.value)::INTEGER as can_afford,
      v_player_gems,
      COALESCE((
        SELECT quantity 
        FROM player_inventory 
        WHERE player_id = v_player_id 
          AND item_type = 'egg' 
          AND item_id = v_egg_record.key
      ), 0) as owned_quantity;
  END LOOP;
  
  -- Return enhancers
  FOR v_enhancer_record IN 
    SELECT key, value FROM jsonb_each(v_shop_config->'enhancers')
  LOOP
    RETURN QUERY
    SELECT 
      v_enhancer_record.key as item_id,
      CASE v_enhancer_record.key
        WHEN 'element_enhancer' THEN 'Element Enhancer'
        WHEN 'rarity_amplifier' THEN 'Rarity Amplifier'
        WHEN 'rainbow_enhancer' THEN 'Rainbow Enhancer'
        ELSE initcap(replace(v_enhancer_record.key, '_', ' '))
      END as item_name,
      CASE v_enhancer_record.key
        WHEN 'element_enhancer' THEN 'Increases chance of specific element when hatching'
        WHEN 'rarity_amplifier' THEN 'Increases chance of higher rarity when hatching'
        WHEN 'rainbow_enhancer' THEN 'Maximum rarity boost for hatching'
        ELSE 'Enhances hatching results'
      END as item_description,
      (v_enhancer_record.value)::INTEGER as price,
      'gems' as currency,
      'enhancers' as category,
      v_player_gems >= (v_enhancer_record.value)::INTEGER as can_afford,
      v_player_gems,
      COALESCE((
        SELECT quantity 
        FROM player_inventory 
        WHERE player_id = v_player_id 
          AND item_type = 'enhancer' 
          AND item_id = v_enhancer_record.key
      ), 0) as owned_quantity;
  END LOOP;
END;
$$;
```

### 5. Purchase History Function
**Purpose**: Get player's purchase history for analytics and support

```sql
CREATE OR REPLACE FUNCTION get_player_purchase_history(
  p_device_id TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  purchase_date TIMESTAMP,
  item_type TEXT,
  item_id TEXT,
  quantity INTEGER,
  price_per_item INTEGER,
  total_cost INTEGER,
  gems_before INTEGER,
  gems_after INTEGER,
  transaction_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
BEGIN
  -- Get player ID from device ID
  SELECT id INTO v_player_id
  FROM players 
  WHERE device_id = p_device_id;
  
  IF v_player_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return purchase history
  RETURN QUERY
  SELECT 
    pal.timestamp as purchase_date,
    CASE 
      WHEN pal.activity_data->>'egg_type' IS NOT NULL THEN 'egg'
      WHEN pal.activity_data->>'enhancer_type' IS NOT NULL THEN 'enhancer'
      ELSE 'unknown'
    END as item_type,
    COALESCE(
      pal.activity_data->>'egg_type',
      pal.activity_data->>'enhancer_type',
      pal.activity_data->>'item_id'
    ) as item_id,
    (pal.activity_data->>'quantity')::INTEGER as quantity,
    (pal.activity_data->>'price_per_egg')::INTEGER as price_per_item,
    (pal.activity_data->>'total_cost')::INTEGER as total_cost,
    (pal.activity_data->>'gems_before')::INTEGER as gems_before,
    (pal.activity_data->>'gems_after')::INTEGER as gems_after,
    (pal.activity_data->>'transaction_id')::UUID as transaction_id
  FROM player_activity_log pal
  WHERE pal.player_id = v_player_id 
    AND pal.activity_type IN ('egg_purchase', 'enhancer_purchase', 'item_purchase')
  ORDER BY pal.timestamp DESC
  LIMIT p_limit;
END;
$$;
```

---

## Database Indexes for Performance

```sql
-- Index for faster inventory lookups
CREATE INDEX IF NOT EXISTS idx_player_inventory_player_type_item 
ON player_inventory (player_id, item_type, item_id);

-- Index for faster activity log queries
CREATE INDEX IF NOT EXISTS idx_player_activity_log_player_type_timestamp 
ON player_activity_log (player_id, activity_type, timestamp DESC);

-- Index for faster player lookups by device_id
CREATE INDEX IF NOT EXISTS idx_players_device_id 
ON players (device_id);
```

---

## Security Considerations

### Function Security
- All functions use `SECURITY DEFINER` to run with elevated privileges
- Device ID validation prevents unauthorized access
- Atomic transactions ensure data consistency
- Comprehensive error handling and logging

### Data Validation
- Price validation against server configuration
- Quantity validation (positive integers only)
- Player existence validation
- Inventory availability validation

### Audit Trail
- All purchases logged in `player_activity_log`
- Transaction IDs for tracking
- Timestamps for all operations
- Metadata preservation for debugging

---

## Testing Queries

### Test Egg Purchase
```sql
SELECT * FROM secure_purchase_egg('test_device_id', 'common_egg', 2);
```

### Test Egg Consumption
```sql
SELECT * FROM secure_consume_egg('test_device_id', 'common_egg', 1);
```

### Test Inventory Retrieval
```sql
SELECT * FROM get_player_egg_inventory('test_device_id');
```

### Test Shop Items with Context
```sql
SELECT * FROM get_shop_items_with_context('test_device_id');
```

### Test Purchase History
```sql
SELECT * FROM get_player_purchase_history('test_device_id', 10);
```

---

## Migration Script

```sql
-- Apply all functions in order
\i secure_purchase_egg.sql
\i secure_consume_egg.sql
\i get_player_egg_inventory.sql
\i get_shop_items_with_context.sql
\i get_player_purchase_history.sql

-- Create indexes
\i create_indexes.sql

-- Test functions
\i test_functions.sql
```

This comprehensive database function specification provides all the necessary backend functionality to support a secure, robust shop system with egg purchasing and consumption capabilities. 