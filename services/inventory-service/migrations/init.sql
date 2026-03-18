CREATE TABLE IF NOT EXISTS inventories (
  id UUID PRIMARY KEY,
  product_id VARCHAR(100) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventories_product_id ON inventories (product_id);
CREATE INDEX IF NOT EXISTS idx_inventories_sku ON inventories (sku);

CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_inventory_updated_at ON inventories;

CREATE TRIGGER trg_update_inventory_updated_at
BEFORE UPDATE ON inventories
FOR EACH ROW
EXECUTE FUNCTION update_inventory_updated_at();
