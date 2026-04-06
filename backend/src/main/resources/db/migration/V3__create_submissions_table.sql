CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES forms(id),
    form_version INTEGER NOT NULL,
    data TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(form_id, submitted_at DESC);
