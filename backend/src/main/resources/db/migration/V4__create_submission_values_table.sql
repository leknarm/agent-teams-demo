CREATE TABLE IF NOT EXISTS submission_values (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    field_id UUID REFERENCES form_fields(id),
    field_name VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_values_submission_id ON submission_values(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_values_field_id ON submission_values(field_id);
CREATE INDEX IF NOT EXISTS idx_submission_values_field_name ON submission_values(field_name, field_value);
