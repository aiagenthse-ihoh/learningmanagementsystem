export type UserRole = 'admin' | 'trainer' | 'supervisor' | 'employee';

export interface UserPermissions {
  can_manage_org: boolean;         // Kelola Departemen & Jabatan
  can_manage_competencies: boolean; // Kelola Master Kompetensi & Skala Level
  can_manage_matrix: boolean;       // Konfigurasi Matriks Kompetensi Jabatan
  can_edit_training: boolean;       // Edit Silabus / Program Training
  can_upload_material: boolean;     // Upload Video & Simpan Link Materi (Google Drive)
  can_edit_questions: boolean;      // Buat & Edit Soal Pre-Test / Post-Test
  can_assign_training: boolean;     // Penugasan Training ke Karyawan
  can_assess_team: boolean;         // Penilaian Aktual Karyawan (Assessor / Supervisor)
  can_manage_gap: boolean;          // Kelola Gap & Development Action Plan
  can_view_reports: boolean;        // Akses & Ekspor Laporan
  can_learn: boolean;               // Akses My Learning (Menonton materi & tes)
  [key: string]: boolean;           // Izin Kustom yang Ditambahkan Super Admin
}

export interface PermissionDefinition {
  id: string;
  key: string;
  title: string;
  desc: string;
  category?: string;
  isCustom?: boolean;
  highlight?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  employee_id?: string;
  permissions?: UserPermissions;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  nama: string;
  kode?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Position {
  id: string;
  nama_jabatan: string;
  kode?: string;
  department_id?: string;
  deskripsi?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CompetencyCategory {
  id: string;
  nama: string;
  status: 'active' | 'inactive';
}

export interface Competency {
  id: string;
  nama: string;
  kategori_id: string;
  deskripsi: string;
  indikator_perilaku?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CompetencyLevel {
  id: string;
  nama_level: string; // e.g. "Level 1 - Basic"
  urutan: number;      // e.g. 1, 2, 3...
  deskripsi: string;   // Definition of what this level entails
  status: 'active' | 'inactive';
}

export interface PositionCompetencyRequirement {
  id: string;
  position_id: string;
  competency_id: string;
  required_level_id: string;
  wajib: boolean;
  pemenuhan_checklist: string[]; // e.g. ["Training", "Post-Test", "Practical/OJT", "Sertifikasi"]
  tindakan_gap: string[];        // e.g. ["Remedial", "Refreshment", "OJT", "Coaching", "Assessment Ulang"]
  updated_at: string;
}

export interface ConfigOption {
  id: string;
  category: 'pemenuhan' | 'tindakan_gap' | 'training_kategori' | string;
  label: string;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  employee_code: string;
  nama: string;
  email: string;
  department_id: string;
  position_id: string;
  manager_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive';
}

export interface Training {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  trainer_id: string;
  durasi_menit: number;
  target_positions: string[];    // position IDs
  target_competencies: string[]; // competency IDs
  passing_grade: number;         // e.g. 70
  max_attempts: number;          // e.g. 3
  status: 'active' | 'inactive';
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  training_id: string;
  tipe: 'video' | 'pdf' | 'document' | 'link';
  judul: string;
  url: string;
  source_type?: 'google_drive' | 'uploaded_file' | 'external_url';
  file_name?: string;
  google_drive_id?: string;
  urutan: number;
  durasi_menit?: number;
}

export interface TrainingAssignment {
  id: string;
  training_id: string;
  employee_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'remedial';
  progress_percent: number;
}

export interface QuestionOption {
  id: string;
  teks: string;
}

export interface Question {
  id: string;
  training_id: string;
  tipe_test: 'pre_test' | 'post_test' | 'both';
  pertanyaan: string;
  opsi: QuestionOption[];
  kunci: string; // option id (e.g. 'A')
  bobot: number;
}

export interface AssessmentAttempt {
  id: string;
  employee_id: string;
  training_id: string;
  test_type: 'pre_test' | 'post_test';
  attempt_no: number;
  score: number;
  pass_status: 'passed' | 'failed';
  answers: Record<string, string>; // questionId -> chosenOptionId
  timestamp: string;
}

export interface LearningProgress {
  id: string;
  employee_id: string;
  material_id: string;
  progress_percent: number;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  updated_at: string;
}

export interface CompetencyAssessment {
  id: string;
  employee_id: string;
  competency_id: string;
  actual_level_id: string;
  assessor_id: string;
  evidence: string;
  evidence_method?: string; // e.g. Practical/OJT, Sertifikasi, Evaluasi Supervisor
  assessed_at: string;
}

export interface DevelopmentAction {
  id: string;
  employee_id: string;
  competency_id: string;
  gap_level: number;
  action_type: string;
  owner: string;
  due_date: string;
  status: 'open' | 'in_progress' | 'completed';
  notes?: string;
  result?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_nama: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: string;
  timestamp: string;
}

export interface TrainingSchedule {
  id: string;
  title: string;
  training_id?: string;
  custom_training_name?: string;
  category?: string;
  department_ids: string[]; // ['dept-1', 'dept-2'] or ['all']
  position_ids?: string[];
  trainer_id?: string;
  trainer_name: string;
  trainer_email?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "08:30"
  end_time: string; // e.g. "16:00"
  location_type: 'offline' | 'online' | 'hybrid';
  room_location?: string;
  meeting_url?: string;
  max_participants: number;
  enrolled_employee_ids: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  reminder_sent_count?: number;
  last_reminder_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface EmailNotification {
  id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_role: UserRole;
  subject: string;
  preview: string;
  body_html: string;
  type:
    | 'welcome_registration'
    | 'training_schedule_invite'
    | 'schedule_reminder'
    | 'schedule_updated'
    | 'training_assigned';
  related_schedule_id?: string;
  related_training_id?: string;
  sent_at: string;
  is_read: boolean;
  status: 'sent' | 'delivered';
}
