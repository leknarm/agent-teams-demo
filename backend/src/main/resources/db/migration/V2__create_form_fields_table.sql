CREATE TABLE IF NOT EXISTS form_fields (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(500) NOT NULL,
    placeholder VARCHAR(500),
    help_text VARCHAR(1000),
    field_order INTEGER NOT NULL,
    page INTEGER NOT NULL DEFAULT 0,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    validation_rules TEXT DEFAULT '[]',
    options TEXT,
    config TEXT DEFAULT '{}',
    visibility_rules TEXT,
    CONSTRAINT uq_form_fields_form_name UNIQUE (form_id, name)
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_order ON form_fields(form_id, field_order);
