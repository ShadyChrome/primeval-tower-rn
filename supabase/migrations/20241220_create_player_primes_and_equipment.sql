-- Create player_primes table for storing owned Primes with individual progression
CREATE TABLE player_primes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  prime_name TEXT NOT NULL,
  element TEXT NOT NULL,
  rarity TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  power INTEGER DEFAULT 0,
  abilities JSONB DEFAULT '[]',
  acquired_at TIMESTAMP DEFAULT NOW(),
  total_battles INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_player_primes_player_id ON player_primes(player_id);
CREATE INDEX idx_player_primes_element ON player_primes(element);
CREATE INDEX idx_player_primes_rarity ON player_primes(rarity);

-- Add prime_id column to player_runes table to associate runes with specific Primes
ALTER TABLE player_runes 
ADD COLUMN prime_id TEXT REFERENCES player_primes(id) ON DELETE SET NULL;

-- Create index for prime_id in player_runes
CREATE INDEX idx_player_runes_prime_id ON player_runes(prime_id);

-- Create function to equip rune to a specific Prime
CREATE OR REPLACE FUNCTION equip_rune_to_prime(
  p_player_id TEXT,
  p_prime_id TEXT,
  p_rune_id TEXT,
  p_slot_index INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  rune_record RECORD;
  prime_record RECORD;
BEGIN
  -- Validate inputs
  IF p_slot_index < 0 OR p_slot_index > 5 THEN
    RAISE EXCEPTION 'Invalid slot index. Must be between 0 and 5.';
  END IF;

  -- Check if prime belongs to player
  SELECT * INTO prime_record
  FROM player_primes 
  WHERE id = p_prime_id AND player_id = p_player_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prime not found or does not belong to player.';
  END IF;

  -- Check if rune belongs to player and is not already equipped
  SELECT * INTO rune_record
  FROM player_runes 
  WHERE id = p_rune_id AND player_id = p_player_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rune not found or does not belong to player.';
  END IF;

  IF rune_record.is_equipped = TRUE THEN
    RAISE EXCEPTION 'Rune is already equipped.';
  END IF;

  -- Unequip any rune currently in this slot for this prime
  UPDATE player_runes 
  SET is_equipped = FALSE, 
      equipped_slot = NULL, 
      prime_id = NULL,
      updated_at = NOW()
  WHERE prime_id = p_prime_id AND equipped_slot = p_slot_index;

  -- Equip the new rune
  UPDATE player_runes 
  SET is_equipped = TRUE, 
      equipped_slot = p_slot_index, 
      prime_id = p_prime_id,
      updated_at = NOW()
  WHERE id = p_rune_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to unequip rune from Prime
CREATE OR REPLACE FUNCTION unequip_rune_from_prime(
  p_player_id TEXT,
  p_prime_id TEXT,
  p_slot_index INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  prime_record RECORD;
BEGIN
  -- Validate inputs
  IF p_slot_index < 0 OR p_slot_index > 5 THEN
    RAISE EXCEPTION 'Invalid slot index. Must be between 0 and 5.';
  END IF;

  -- Check if prime belongs to player
  SELECT * INTO prime_record
  FROM player_primes 
  WHERE id = p_prime_id AND player_id = p_player_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prime not found or does not belong to player.';
  END IF;

  -- Unequip rune from this slot
  UPDATE player_runes 
  SET is_equipped = FALSE, 
      equipped_slot = NULL, 
      prime_id = NULL,
      updated_at = NOW()
  WHERE prime_id = p_prime_id AND equipped_slot = p_slot_index AND player_id = p_player_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get equipped runes for a Prime
CREATE OR REPLACE FUNCTION get_prime_equipped_runes(
  p_player_id TEXT,
  p_prime_id TEXT
) RETURNS TABLE(
  slot_index INTEGER,
  rune_id TEXT,
  rune_type TEXT,
  rune_tier TEXT,
  rune_level INTEGER,
  stat_bonuses JSONB,
  acquired_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.equipped_slot,
    pr.id,
    pr.rune_type,
    pr.rune_tier,
    pr.rune_level,
    pr.stat_bonuses,
    pr.acquired_at
  FROM player_runes pr
  WHERE pr.player_id = p_player_id 
    AND pr.prime_id = p_prime_id 
    AND pr.is_equipped = TRUE
  ORDER BY pr.equipped_slot;
END;
$$ LANGUAGE plpgsql;

-- Create function to add starter Primes for new players
CREATE OR REPLACE FUNCTION add_starter_primes(p_player_id TEXT) 
RETURNS TABLE(prime_id TEXT, prime_name TEXT) AS $$
DECLARE
  starter_primes TEXT[] := ARRAY['Great Izuchi', 'Kulu-Ya-Ku', 'Basarios'];
  starter_elements TEXT[] := ARRAY['Vitae', 'Tempest', 'Geo'];
  starter_rarities TEXT[] := ARRAY['Common', 'Common', 'Common'];
  starter_powers INTEGER[] := ARRAY[234, 189, 445];
  i INTEGER;
  new_prime_id TEXT;
BEGIN
  FOR i IN 1..array_length(starter_primes, 1) LOOP
    INSERT INTO player_primes (
      player_id, 
      prime_name, 
      element, 
      rarity, 
      level, 
      power, 
      abilities,
      acquired_at
    ) VALUES (
      p_player_id,
      starter_primes[i],
      starter_elements[i],
      starter_rarities[i],
      1,
      starter_powers[i],
      CASE starter_primes[i]
        WHEN 'Great Izuchi' THEN '["Pack Leader", "Tail Blade", "Swift Strike"]'::jsonb
        WHEN 'Kulu-Ya-Ku' THEN '["Rock Throw", "Peck", "Boulder Slam"]'::jsonb
        WHEN 'Basarios' THEN '["Rock Shield", "Sleep Gas", "Body Slam"]'::jsonb
      END,
      NOW()
    )
    RETURNING id INTO new_prime_id;
    
    RETURN QUERY SELECT new_prime_id, starter_primes[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for player_primes
ALTER TABLE player_primes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own primes" ON player_primes
  FOR SELECT USING (auth.uid()::text = player_id);

CREATE POLICY "Players can insert their own primes" ON player_primes
  FOR INSERT WITH CHECK (auth.uid()::text = player_id);

CREATE POLICY "Players can update their own primes" ON player_primes
  FOR UPDATE USING (auth.uid()::text = player_id);

CREATE POLICY "Players can delete their own primes" ON player_primes
  FOR DELETE USING (auth.uid()::text = player_id);

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_primes_updated_at 
  BEFORE UPDATE ON player_primes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 