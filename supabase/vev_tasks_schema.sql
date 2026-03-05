-- VEV TASK MANAGEMENT SYSTEM
-- Supabase Schema for Saksliste & Kanban Integration

-- ============================================================
-- VEV TASKS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vev_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  column_id text NOT NULL DEFAULT 'backlog', -- 'backlog', 'research', 'write', 'review', 'done'
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  source text DEFAULT 'manual', -- 'morning-routine', 'manual', 'telegram', 'auto'
  agenda_item_id uuid REFERENCES public.agenda_items(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  assigned_to text DEFAULT 'vev',
  position integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vev_tasks_column ON public.vev_tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_vev_tasks_created ON public.vev_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vev_tasks_agenda ON public.vev_tasks(agenda_item_id);
CREATE INDEX IF NOT EXISTS idx_vev_tasks_priority ON public.vev_tasks(priority);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_vev_tasks_updated_at ON public.vev_tasks;
CREATE TRIGGER update_vev_tasks_updated_at
  BEFORE UPDATE ON public.vev_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.vev_tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (will restrict later)
CREATE POLICY "Allow all operations on vev_tasks"
  ON public.vev_tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VIEWS FOR DASHBOARD
-- ============================================================

-- Task counts by column
CREATE OR REPLACE VIEW vev_task_counts AS
SELECT 
  column_id,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_count,
  COUNT(*) FILTER (WHERE priority = 'high') as high_count,
  COUNT(*) FILTER (WHERE source = 'morning-routine') as auto_count
FROM vev_tasks
WHERE completed_at IS NULL
GROUP BY column_id;

-- Tasks ready for next stage (stale tasks)
CREATE OR REPLACE VIEW vev_stale_tasks AS
SELECT *
FROM vev_tasks
WHERE 
  column_id = 'backlog' 
  AND created_at < now() - interval '1 hour'
  AND completed_at IS NULL
ORDER BY created_at ASC;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to auto-create tasks from saksliste
CREATE OR REPLACE FUNCTION create_tasks_from_saksliste(
  p_date date DEFAULT CURRENT_DATE
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer := 0;
  v_item record;
BEGIN
  FOR v_item IN 
    SELECT * FROM agenda_items 
    WHERE date = p_date
    AND id NOT IN (
      SELECT agenda_item_id FROM vev_tasks WHERE agenda_item_id IS NOT NULL
    )
  LOOP
    INSERT INTO vev_tasks (
      title,
      description,
      column_id,
      priority,
      source,
      agenda_item_id,
      metadata
    ) VALUES (
      v_item.title,
      v_item.description,
      'backlog',
      CASE 
        WHEN v_item.category IN ('breaking', 'urgent') THEN 'critical'
        WHEN v_item.category IN ('news', 'trending') THEN 'high'
        ELSE 'medium'
      END,
      'morning-routine',
      v_item.id,
      jsonb_build_object(
        'link_url', v_item.link_url,
        'image_url', v_item.link_metadata->>'image_url',
        'category', v_item.category
      )
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Function to move task to next column
CREATE OR REPLACE FUNCTION move_task_to_next_column(
  p_task_id uuid
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_column text;
  v_next_column text;
  v_columns text[] := ARRAY['backlog', 'research', 'write', 'review', 'done'];
  v_index integer;
BEGIN
  SELECT column_id INTO v_current_column
  FROM vev_tasks
  WHERE id = p_task_id;
  
  IF v_current_column IS NULL THEN
    RETURN 'Task not found';
  END IF;
  
  v_index := array_position(v_columns, v_current_column);
  
  IF v_index IS NULL OR v_index >= array_length(v_columns, 1) THEN
    RETURN 'Already at final column';
  END IF;
  
  v_next_column := v_columns[v_index + 1];
  
  UPDATE vev_tasks
  SET 
    column_id = v_next_column,
    completed_at = CASE WHEN v_next_column = 'done' THEN now() ELSE completed_at END
  WHERE id = p_task_id;
  
  RETURN v_next_column;
END;
$$;

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Insert sample tasks
INSERT INTO vev_tasks (title, description, column_id, priority, source, tags) VALUES
('Zendaya & Tom Holland - Hemmelig Bryllup?', 'Sjekk ut bryllupsryktene fra Actor Awards', 'backlog', 'high', 'morning-routine', ARRAY['kjendis', 'bryllup']),
('Marius Borg Høiby-rettssaken', 'Følg rettssaken og oppdater saksliste', 'research', 'critical', 'morning-routine', ARRAY['nyheter', 'konge']),
('Ski-VM: Klæbo vs Karlsson', 'Analyser dramaet fra ski-VM', 'write', 'medium', 'morning-routine', ARRAY['sport', 'ski']),
('MGP 2026 - Lahlum & Pølsa', 'Skriv om den sjokkerende MGP-opptredenen', 'review', 'high', 'morning-routine', ARRAY['musikk', 'mgp']),
('Jon Almaas blir bestefar', 'Feire nyheten om Jon Almaas', 'done', 'medium', 'morning-routine', ARRAY['kjendis', 'familie'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- REALTIME SUBSCRIPTION SETUP
-- ============================================================

-- Enable realtime for vev_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE vev_tasks;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE vev_tasks IS 'Task management for Vev - connects saksliste to Kanban board';
COMMENT ON COLUMN vev_tasks.column_id IS 'Kanban column: backlog, research, write, review, done';
COMMENT ON COLUMN vev_tasks.source IS 'How task was created: morning-routine, manual, telegram, auto';
