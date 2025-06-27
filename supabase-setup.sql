-- Create the menu_settings table
CREATE TABLE IF NOT EXISTS menu_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  disabled_items INTEGER[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial record if it doesn't exist
INSERT INTO menu_settings (id, disabled_items) 
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE menu_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on menu_settings" ON menu_settings
  FOR ALL USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_menu_settings_updated_at 
  BEFORE UPDATE ON menu_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 