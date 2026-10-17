-- ========================================================================
-- Learning & Competency Management System (LCMS) Database Schema & Migration
-- Supabase PostgreSQL with Row Level Security (RLS) & Role-Based Access Control
-- ========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'supervisor', 'employee');
CREATE TYPE data_status AS ENUM ('active', 'inactive');
CREATE TYPE test_type AS ENUM ('pre_test', 'post_test', 'both');
CREATE TYPE pass_status AS ENUM ('passed', 'failed');
CREATE TYPE action_status AS ENUM ('open', 'in_progress', 'completed');
CREATE TYPE assignment_status AS ENUM ('not_started', 'in_progress', 'completed', 'remedial');

-- 3. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    kode TEXT,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. POSITIONS (JABATAN)
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_jabatan TEXT NOT NULL,
    kode TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    deskripsi TEXT,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    position_id UUID REFERENCES positions(id) ON DELETE RESTRICT,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    hire_date DATE,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. COMPETENCY CATEGORIES
CREATE TABLE IF NOT EXISTS competency_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMPETENCIES
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    kategori_id UUID REFERENCES competency_categories(id) ON DELETE RESTRICT,
    deskripsi TEXT NOT NULL,
    indikator_perilaku TEXT,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. COMPETENCY LEVELS (Scale configuration)
CREATE TABLE IF NOT EXISTS competency_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_level TEXT NOT NULL,
    urutan INT NOT NULL,
    deskripsi TEXT NOT NULL,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. POSITION COMPETENCY REQUIREMENTS (MATRIKS)
CREATE TABLE IF NOT EXISTS position_competency_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    required_level_id UUID REFERENCES competency_levels(id) ON DELETE RESTRICT,
    wajib BOOLEAN NOT NULL DEFAULT true,
    pemenuhan_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    tindakan_gap JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_position_competency UNIQUE (position_id, competency_id)
);

-- 11. CONFIG OPTIONS (Checklist items, Gap action options)
CREATE TABLE IF NOT EXISTS config_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- 'pemenuhan', 'tindakan_gap', 'training_kategori'
    label TEXT NOT NULL,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TRAININGS
CREATE TABLE IF NOT EXISTS trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    kategori TEXT NOT NULL,
    trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    durasi_menit INT NOT NULL DEFAULT 60,
    target_positions JSONB DEFAULT '[]'::jsonb,
    target_competencies JSONB DEFAULT '[]'::jsonb,
    passing_grade INT NOT NULL DEFAULT 70,
    max_attempts INT NOT NULL DEFAULT 3,
    status data_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. LEARNING MATERIALS
CREATE TABLE IF NOT EXISTS learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    tipe TEXT NOT NULL, -- video, pdf, document, link
    judul TEXT NOT NULL,
    url TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 1,
    durasi_menit INT DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TRAINING ASSIGNMENTS
CREATE TABLE IF NOT EXISTS training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date DATE NOT NULL,
    status assignment_status NOT NULL DEFAULT 'not_started',
    progress_percent INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_training_employee UNIQUE (training_id, employee_id)
);

-- 15. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    tipe_test test_type NOT NULL DEFAULT 'both',
    pertanyaan TEXT NOT NULL,
    opsi JSONB NOT NULL,
    kunci TEXT NOT NULL,
    bobot INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL, -- 'pre_test' or 'post_test'
    attempt_no INT NOT NULL DEFAULT 1,
    score NUMERIC(5,2) NOT NULL,
    pass_status pass_status NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    material_id UUID REFERENCES learning_materials(id) ON DELETE CASCADE,
    progress_percent INT NOT NULL DEFAULT 0,
    completion_status TEXT NOT NULL DEFAULT 'not_started',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_material UNIQUE (employee_id, material_id)
);

-- 18. COMPETENCY ASSESSMENTS (ACTUAL LEVEL)
CREATE TABLE IF NOT EXISTS competency_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    actual_level_id UUID REFERENCES competency_levels(id) ON DELETE RESTRICT,
    assessor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    evidence TEXT NOT NULL,
    evidence_method TEXT,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. DEVELOPMENT ACTIONS (GAP RESOLUTION)
CREATE TABLE IF NOT EXISTS development_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    gap_level INT NOT NULL,
    action_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    due_date DATE NOT NULL,
    status action_status NOT NULL DEFAULT 'open',
    notes TEXT,
    result TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_nama TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_competency_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_actions ENABLE ROW LEVEL SECURITY;

-- Helper to get user role from auth.jwt()
CREATE OR REPLACE FUNCTION current_user_role() RETURNS user_role AS $$
  SELECT COALESCE((auth.jwt() ->> 'role')::user_role, 'employee'::user_role);
$$ LANGUAGE sql STABLE;

-- Admins have full access to everything
CREATE POLICY admin_all_positions ON positions FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY public_read_positions ON positions FOR SELECT USING (status = 'active');

CREATE POLICY admin_all_matrix ON position_competency_requirements FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY read_matrix ON position_competency_requirements FOR SELECT USING (true);

-- Supervisor can read and update assessments
CREATE POLICY assessor_assessments ON competency_assessments FOR ALL
USING (current_user_role() IN ('admin', 'supervisor'));

-- Employee can only view their own records
CREATE POLICY employee_view_self ON employees FOR SELECT
USING (current_user_role() = 'admin' OR email = auth.jwt() ->> 'email');
