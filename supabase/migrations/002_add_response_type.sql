-- Add response_type column to prompts table
-- This determines what type of response members should provide (TEXT or IMAGE)

ALTER TABLE prompts 
ADD COLUMN response_type TEXT NOT NULL DEFAULT 'TEXT' 
CHECK (response_type IN ('TEXT', 'IMAGE'));

-- Add index for filtering by response type
CREATE INDEX idx_prompts_response_type ON prompts(response_type);

-- Add comment
COMMENT ON COLUMN prompts.response_type IS 'Type of response expected: TEXT (written response) or IMAGE (image with caption)';
