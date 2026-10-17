import {
  User,
  Department,
  Position,
  CompetencyCategory,
  Competency,
  CompetencyLevel,
  PositionCompetencyRequirement,
  ConfigOption,
  Employee,
  Training,
  LearningMaterial,
  TrainingAssignment,
  Question,
  AssessmentAttempt,
  LearningProgress,
  CompetencyAssessment,
  DevelopmentAction,
  AuditLog,
  TrainingSchedule,
  EmailNotification,
} from '../types/lcms';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Akbar Husnul Falah',
    email: 'akbar@lcms.corp',
    password: 'password123',
    role: 'admin',
    status: 'active',
    permissions: {
      can_manage_org: true,
      can_manage_competencies: true,
      can_manage_matrix: true,
      can_edit_training: true,
      can_upload_material: true,
      can_edit_questions: true,
      can_assign_training: true,
      can_assess_team: true,
      can_manage_gap: true,
      can_view_reports: true,
      can_learn: true,
    },
  },
  {
    id: 'u-2',
    name: 'Bambang Prasetyo',
    email: 'trainer@lcms.corp',
    password: 'password123',
    role: 'trainer',
    status: 'active',
    permissions: {
      can_manage_org: false,
      can_manage_competencies: false,
      can_manage_matrix: false,
      can_edit_training: true,
      can_upload_material: true,
      can_edit_questions: true,
      can_assign_training: true,
      can_assess_team: false,
      can_manage_gap: false,
      can_view_reports: true,
      can_learn: true,
    },
  },
  {
    id: 'u-3',
    name: 'Ratna Sari',
    email: 'supervisor@lcms.corp',
    password: 'password123',
    role: 'supervisor',
    status: 'active',
    permissions: {
      can_manage_org: false,
      can_manage_competencies: false,
      can_manage_matrix: false,
      can_edit_training: false,
      can_upload_material: false,
      can_edit_questions: false,
      can_assign_training: false,
      can_assess_team: true,
      can_manage_gap: true,
      can_view_reports: true,
      can_learn: true,
    },
  },
  {
    id: 'u-4',
    name: 'Doni Setiawan',
    email: 'doni@lcms.corp',
    password: 'password123',
    role: 'employee',
    employee_id: 'emp-1',
    status: 'active',
    permissions: {
      can_manage_org: false,
      can_manage_competencies: false,
      can_manage_matrix: false,
      can_edit_training: false,
      can_upload_material: false,
      can_edit_questions: false,
      can_assign_training: false,
      can_assess_team: false,
      can_manage_gap: false,
      can_view_reports: false,
      can_learn: true,
    },
  },
  {
    id: 'u-5',
    name: 'Siti Rahma',
    email: 'siti@lcms.corp',
    password: 'password123',
    role: 'employee',
    employee_id: 'emp-2',
    status: 'active',
    permissions: {
      can_manage_org: false,
      can_manage_competencies: false,
      can_manage_matrix: false,
      can_edit_training: false,
      can_upload_material: false,
      can_edit_questions: false,
      can_assign_training: false,
      can_assess_team: false,
      can_manage_gap: false,
      can_view_reports: false,
      can_learn: true,
    },
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', nama: 'Operasional & Produksi', kode: 'OPS', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'dept-2', nama: 'Kesehatan & Keselamatan Kerja (HSE)', kode: 'HSE', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'dept-3', nama: 'Quality Assurance & Control', kode: 'QA', status: 'active', created_at: '2026-01-10T08:00:00Z' },
  { id: 'dept-4', nama: 'Teknik & Maintenance', kode: 'TECH', status: 'active', created_at: '2026-01-10T08:00:00Z' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'pos-1', nama_jabatan: 'Operator Produksi', kode: 'OP-01', department_id: 'dept-1', deskripsi: 'Menjalankan mesin dan lini produksi harian sesuai SOP', status: 'active', created_at: '2026-01-11T09:00:00Z' },
  { id: 'pos-2', nama_jabatan: 'Supervisor Operasional', kode: 'SV-01', department_id: 'dept-1', deskripsi: 'Mengawasi alur kerja pabrik dan performa operator', status: 'active', created_at: '2026-01-11T09:00:00Z' },
  { id: 'pos-3', nama_jabatan: 'HSE Officer', kode: 'HSE-01', department_id: 'dept-2', deskripsi: 'Memastikan standar kepatuhan K3 dan manajemen risiko kerja', status: 'active', created_at: '2026-01-11T09:00:00Z' },
  { id: 'pos-4', nama_jabatan: 'Maintenance Technician', kode: 'MT-01', department_id: 'dept-4', deskripsi: 'Merawat peralatan industri dan perbaikan berkala', status: 'active', created_at: '2026-01-11T09:00:00Z' },
  { id: 'pos-5', nama_jabatan: 'QA Inspector', kode: 'QA-01', department_id: 'dept-3', deskripsi: 'Pemeriksaan kualitas produk akhir dan kepatuhan spesifikasi', status: 'active', created_at: '2026-01-11T09:00:00Z' },
];

export const INITIAL_CATEGORIES: CompetencyCategory[] = [
  { id: 'cat-1', nama: 'Health, Safety & Environment (HSE)', status: 'active' },
  { id: 'cat-2', nama: 'Technical & Functional', status: 'active' },
  { id: 'cat-3', nama: 'Core / Nilai Perusahaan', status: 'active' },
  { id: 'cat-4', nama: 'Leadership & Supervisory', status: 'active' },
];

export const INITIAL_COMPETENCIES: Competency[] = [
  {
    id: 'comp-1',
    nama: 'Risk Assessment & Hazard Identification',
    kategori_id: 'cat-1',
    deskripsi: 'Kemampuan mengidentifikasi potensi bahaya kerja dan menentukan mitigasi risiko sesuai hierarki kontrol.',
    indikator_perilaku: 'Mampu membuat Job Safety Analysis (JSA), melaporkan unsafe condition, dan memitigasi bahaya mekanis.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-2',
    nama: 'Chemical Safety & Hazmat Handling',
    kategori_id: 'cat-1',
    deskripsi: 'Prosedur penyimpanan, pemindahan, dan penanganan tumpahan bahan kimia berbahaya & beracun (B3).',
    indikator_perilaku: 'Membaca MSDS dengan benar, menggunakan APD kimia khusus, dan menerapkan spill kit response.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-3',
    nama: 'Standard Operating Procedure (SOP) Execution',
    kategori_id: 'cat-2',
    deskripsi: 'Kepatuhan mutlak dalam menjalankan tahapan operasional mesin dan pelaporan deviasi.',
    indikator_perilaku: 'Bekerja 100% sesuai checklist kerja standar tanpa mengambil jalan pintas (shortcut).',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-4',
    nama: 'Preventive Maintenance & Troubleshooting',
    kategori_id: 'cat-2',
    deskripsi: 'Keahlian inspeksi berkala, pelumasan, deteksi anomali getaran/suara mesin, dan diagnosa kerusakan.',
    indikator_perilaku: 'Melakukan autonomous maintenance harian dan mendokumentasikan logbook servis.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-5',
    nama: 'Effective Communication & Incident Reporting',
    kategori_id: 'cat-3',
    deskripsi: 'Komunikasi verbal dan tertulis yang akurat saat serah terima shift atau melaporkan insiden kerja.',
    indikator_perilaku: 'Menyusun berita acara kejadian secara kronologis dan jelas dalam batas waktu 1 jam.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-6',
    nama: 'Emergency Response & Evacuation Command',
    kategori_id: 'cat-1',
    deskripsi: 'Kesiapan menghadapi kebakaran, bencana alam, dan komando evakuasi titik kumpul.',
    indikator_perilaku: 'Mampu mengoperasikan APAR & hydrant, serta mengarahkan evakuasi regu lantai.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'comp-7',
    nama: 'Quality Inspection & Caliper Calibration',
    kategori_id: 'cat-2',
    deskripsi: 'Pengukuran dimensi produk menggunakan alat ukur presisi dan pencatatan toleransi batas uji.',
    indikator_perilaku: 'Zero defect escape ke proses downstream dan kepatuhan kalibrasi alat uji berkala.',
    status: 'active',
    created_at: '2026-01-12T10:00:00Z',
  },
];

export const INITIAL_LEVELS: CompetencyLevel[] = [
  {
    id: 'lvl-1',
    nama_level: 'Level 1 - Basic',
    urutan: 1,
    deskripsi: 'Memahami prinsip dasar, terminologi, dan bekerja dengan supervisi ketat.',
    status: 'active',
  },
  {
    id: 'lvl-2',
    nama_level: 'Level 2 - Intermediate',
    urutan: 2,
    deskripsi: 'Menjalankan prosedur rutin secara mandiri dengan arahan minimal pada kondisi normal.',
    status: 'active',
  },
  {
    id: 'lvl-3',
    nama_level: 'Level 3 - Competent',
    urutan: 3,
    deskripsi: 'Menuntaskan pekerjaan kompleks, memecahkan kendala teknis mandiri, dan membimbing staf junior.',
    status: 'active',
  },
  {
    id: 'lvl-4',
    nama_level: 'Level 4 - Advanced',
    urutan: 4,
    deskripsi: 'Menguasai analisa menyeluruh, optimasi sistem kerja, dan verifikasi kepatuhan tim.',
    status: 'active',
  },
  {
    id: 'lvl-5',
    nama_level: 'Level 5 - Expert',
    urutan: 5,
    deskripsi: 'Rujukan tingkat korporat, merumuskan strategi dan SOP baru, serta memimpin audit sertifikasi eksternal.',
    status: 'active',
  },
];

export const INITIAL_CONFIG_OPTIONS: ConfigOption[] = [
  // Pemenuhan options
  { id: 'opt-p1', category: 'pemenuhan', label: 'Training', status: 'active' },
  { id: 'opt-p2', category: 'pemenuhan', label: 'Post-Test', status: 'active' },
  { id: 'opt-p3', category: 'pemenuhan', label: 'Practical/OJT', status: 'active' },
  { id: 'opt-p4', category: 'pemenuhan', label: 'Sertifikasi', status: 'active' },
  { id: 'opt-p5', category: 'pemenuhan', label: 'Portofolio / Logbook', status: 'active' },

  // Tindakan gap options
  { id: 'opt-g1', category: 'tindakan_gap', label: 'Training Penuh', status: 'active' },
  { id: 'opt-g2', category: 'tindakan_gap', label: 'Remedial Module', status: 'active' },
  { id: 'opt-g3', category: 'tindakan_gap', label: 'Refreshment Training', status: 'active' },
  { id: 'opt-g4', category: 'tindakan_gap', label: 'Practical / OJT', status: 'active' },
  { id: 'opt-g5', category: 'tindakan_gap', label: 'Coaching & Mentoring', status: 'active' },
  { id: 'opt-g6', category: 'tindakan_gap', label: 'Assessment Ulang', status: 'active' },

  // Kategori training
  { id: 'opt-k1', category: 'training_kategori', label: 'Wajib K3 / HSE', status: 'active' },
  { id: 'opt-k2', category: 'training_kategori', label: 'Teknis Pabrik', status: 'active' },
  { id: 'opt-k3', category: 'training_kategori', label: 'Kualitas & ISO', status: 'active' },
  { id: 'opt-k4', category: 'training_kategori', label: 'Leadership', status: 'active' },
];

export const INITIAL_MATRIX: PositionCompetencyRequirement[] = [
  // Operator Produksi (pos-1)
  {
    id: 'req-1',
    position_id: 'pos-1',
    competency_id: 'comp-1',
    required_level_id: 'lvl-2',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Post-Test', 'Practical/OJT'],
    tindakan_gap: ['Remedial Module', 'Practical / OJT'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-2',
    position_id: 'pos-1',
    competency_id: 'comp-2',
    required_level_id: 'lvl-2',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Post-Test'],
    tindakan_gap: ['Remedial Module', 'Refreshment Training'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-3',
    position_id: 'pos-1',
    competency_id: 'comp-3',
    required_level_id: 'lvl-3',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Practical/OJT'],
    tindakan_gap: ['Coaching & Mentoring', 'Practical / OJT'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-4',
    position_id: 'pos-1',
    competency_id: 'comp-5',
    required_level_id: 'lvl-1',
    wajib: true,
    pemenuhan_checklist: ['Training'],
    tindakan_gap: ['Coaching & Mentoring'],
    updated_at: '2026-02-01T10:00:00Z',
  },

  // HSE Officer (pos-3)
  {
    id: 'req-5',
    position_id: 'pos-3',
    competency_id: 'comp-1',
    required_level_id: 'lvl-4',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Post-Test', 'Practical/OJT', 'Sertifikasi'],
    tindakan_gap: ['Coaching & Mentoring', 'Assessment Ulang'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-6',
    position_id: 'pos-3',
    competency_id: 'comp-2',
    required_level_id: 'lvl-4',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Post-Test', 'Sertifikasi'],
    tindakan_gap: ['Refreshment Training', 'Assessment Ulang'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-7',
    position_id: 'pos-3',
    competency_id: 'comp-6',
    required_level_id: 'lvl-4',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Practical/OJT', 'Sertifikasi'],
    tindakan_gap: ['Practical / OJT', 'Assessment Ulang'],
    updated_at: '2026-02-01T10:00:00Z',
  },

  // Supervisor Operasional (pos-2)
  {
    id: 'req-8',
    position_id: 'pos-2',
    competency_id: 'comp-1',
    required_level_id: 'lvl-3',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Post-Test', 'Practical/OJT'],
    tindakan_gap: ['Coaching & Mentoring'],
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'req-9',
    position_id: 'pos-2',
    competency_id: 'comp-3',
    required_level_id: 'lvl-4',
    wajib: true,
    pemenuhan_checklist: ['Training', 'Practical/OJT'],
    tindakan_gap: ['Coaching & Mentoring', 'Assessment Ulang'],
    updated_at: '2026-02-01T10:00:00Z',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employee_code: 'EMP-2024-001',
    nama: 'Doni Setiawan',
    email: 'doni@lcms.corp',
    department_id: 'dept-1',
    position_id: 'pos-1',
    manager_id: 'emp-3',
    hire_date: '2024-03-01',
    status: 'active',
  },
  {
    id: 'emp-2',
    employee_code: 'EMP-2024-002',
    nama: 'Siti Rahma',
    email: 'siti@lcms.corp',
    department_id: 'dept-3',
    position_id: 'pos-5',
    manager_id: 'emp-3',
    hire_date: '2024-05-15',
    status: 'active',
  },
  {
    id: 'emp-3',
    employee_code: 'EMP-2023-010',
    nama: 'Ratna Sari',
    email: 'supervisor@lcms.corp',
    department_id: 'dept-1',
    position_id: 'pos-2',
    hire_date: '2023-01-10',
    status: 'active',
  },
  {
    id: 'emp-4',
    employee_code: 'EMP-2024-045',
    nama: 'Ahmad Fauzi',
    email: 'ahmad.f@lcms.corp',
    department_id: 'dept-2',
    position_id: 'pos-3',
    hire_date: '2024-02-01',
    status: 'active',
  },
  {
    id: 'emp-5',
    employee_code: 'EMP-2024-089',
    nama: 'Rian Pratama',
    email: 'rian@lcms.corp',
    department_id: 'dept-4',
    position_id: 'pos-4',
    hire_date: '2024-08-01',
    status: 'active',
  },
];

export const INITIAL_TRAININGS: Training[] = [
  {
    id: 'trn-1',
    judul: 'Dasar Identifikasi Bahaya & Penilaian Risiko (JSA & HIRADC)',
    deskripsi: 'Program wajib keselamatan kerja untuk memetakan bahaya fisik, kimia, dan mekanis di lingkungan kerja serta menerapkan mitigasi berbasis kontrol hierarki.',
    kategori: 'Wajib K3 / HSE',
    trainer_id: 'u-2',
    durasi_menit: 45,
    target_positions: ['pos-1', 'pos-2', 'pos-3', 'pos-4'],
    target_competencies: ['comp-1'],
    passing_grade: 75,
    max_attempts: 3,
    status: 'active',
    created_at: '2026-02-05T08:00:00Z',
  },
  {
    id: 'trn-2',
    judul: 'Manajemen & Penanganan Aman Bahan Kimia Berbahaya (B3)',
    deskripsi: 'Pelatihan komprehensif cara penanganan zat kimia industri, interpretasi simbol piktogram GHS, dan tindakan darurat tumpahan kimia.',
    kategori: 'Wajib K3 / HSE',
    trainer_id: 'u-2',
    durasi_menit: 60,
    target_positions: ['pos-1', 'pos-3'],
    target_competencies: ['comp-2'],
    passing_grade: 80,
    max_attempts: 2,
    status: 'active',
    created_at: '2026-02-06T09:30:00Z',
  },
  {
    id: 'trn-3',
    judul: 'Eksekusi Presisi SOP Operasi Mesin & Kepatuhan Standar ISO',
    deskripsi: 'Panduan praktis pelaksanaan langkah demi langkah operasional mesin produksi tanpa deviasi dan pencatatan parameter mutu tepat waktu.',
    kategori: 'Teknis Pabrik',
    trainer_id: 'u-2',
    durasi_menit: 50,
    target_positions: ['pos-1'],
    target_competencies: ['comp-3'],
    passing_grade: 70,
    max_attempts: 3,
    status: 'active',
    created_at: '2026-02-08T11:00:00Z',
  },
];

export const INITIAL_MATERIALS: LearningMaterial[] = [
  {
    id: 'mat-1',
    training_id: 'trn-1',
    tipe: 'video',
    judul: 'Video 1: Pengenalan Matriks HIRADC & Bahaya Lapangan',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    urutan: 1,
    durasi_menit: 15,
  },
  {
    id: 'mat-2',
    training_id: 'trn-1',
    tipe: 'document',
    judul: 'Modul Panduan: Pembuatan Job Safety Analysis (JSA) Praktis',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    urutan: 2,
    durasi_menit: 20,
  },
  {
    id: 'mat-3',
    training_id: 'trn-2',
    tipe: 'video',
    judul: 'Video: Demonstrasi Pemakaian Spill Kit & Penanganan B3',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    urutan: 1,
    durasi_menit: 25,
  },
  {
    id: 'mat-4',
    training_id: 'trn-3',
    tipe: 'video',
    judul: 'Video: Tutorial 5S dan Verifikasi Parameter Mesin',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    urutan: 1,
    durasi_menit: 20,
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // trn-1 questions
  {
    id: 'q-1',
    training_id: 'trn-1',
    tipe_test: 'both',
    pertanyaan: 'Manakah urutan hierarki pengendalian risiko (Hierarchy of Controls) yang paling efektif dari paling atas ke paling bawah?',
    opsi: [
      { id: 'A', teks: 'APD -> Rekayasa Teknik -> Substitusi -> Eliminasi' },
      { id: 'B', teks: 'Eliminasi -> Substitusi -> Rekayasa Teknik -> Pengendalian Administratif -> APD' },
      { id: 'C', teks: 'Pengendalian Administratif -> APD -> Eliminasi -> Substitusi' },
      { id: 'D', teks: 'Substitusi -> Eliminasi -> APD -> Rekayasa Teknik' },
    ],
    kunci: 'B',
    bobot: 25,
  },
  {
    id: 'q-2',
    training_id: 'trn-1',
    tipe_test: 'both',
    pertanyaan: 'Apa tujuan utama dari pembuatan Job Safety Analysis (JSA) sebelum memulai pekerjaan berisiko?',
    opsi: [
      { id: 'A', teks: 'Menghitung estimasi biaya kerusakan peralatan' },
      { id: 'B', teks: 'Memecah tahapan kerja, mengidentifikasi bahaya spesifik tiap tahap, dan menentukan langkah pencegahan' },
      { id: 'C', teks: 'Menghukum pekerja yang tidak patuh peraturan kerja' },
      { id: 'D', teks: 'Sebagai formalitas pengisian berkas audit tanpa implementasi lapangan' },
    ],
    kunci: 'B',
    bobot: 25,
  },
  {
    id: 'q-3',
    training_id: 'trn-1',
    tipe_test: 'both',
    pertanyaan: 'Kondisi kabel terkelupas di dekat genangan air di lantai kerja diklasifikasikan sebagai apa?',
    opsi: [
      { id: 'A', teks: 'Unsafe Act (Tindakan Tidak Aman)' },
      { id: 'B', teks: 'Unsafe Condition (Kondisi Tidak Aman)' },
      { id: 'C', teks: 'Near Miss yang tidak perlu dilaporkan' },
      { id: 'D', teks: 'Kerusakan wajar yang diabaikan' },
    ],
    kunci: 'B',
    bobot: 25,
  },
  {
    id: 'q-4',
    training_id: 'trn-1',
    tipe_test: 'both',
    pertanyaan: 'Kapan laporan bahaya atau potensi kecelakaan (hazard report) harus diserahkan kepada pengawas kerja?',
    opsi: [
      { id: 'A', teks: 'Menunggu akhir bulan saat rapat evaluasi' },
      { id: 'B', teks: 'Hanya jika sudah terjadi korban cedera' },
      { id: 'C', teks: 'Seketika / secepatnya begitu bahaya terdeteksi agar segera diisolasi' },
      { id: 'D', teks: 'Terserah kenyamanan pekerja masing-masing' },
    ],
    kunci: 'C',
    bobot: 25,
  },

  // trn-2 questions
  {
    id: 'q-5',
    training_id: 'trn-2',
    tipe_test: 'both',
    pertanyaan: 'Dokumen apa yang wajib disediakan di dekat area penyimpanan bahan kimia untuk memberikan rincian sifat bahaya dan pertolongan pertama?',
    opsi: [
      { id: 'A', teks: 'Material Safety Data Sheet (MSDS / SDS)' },
      { id: 'B', teks: 'Surat Jalan Pengiriman Barang' },
      { id: 'C', teks: 'Faktur Pembelian Akuntansi' },
      { id: 'D', teks: 'Brosur Promosi Produk' },
    ],
    kunci: 'A',
    bobot: 50,
  },
  {
    id: 'q-6',
    training_id: 'trn-2',
    tipe_test: 'both',
    pertanyaan: 'Jika terjadi tumpahan cairan kimia asam di lantai kerja, tindakan awal apa yang harus segera dilakukan?',
    opsi: [
      { id: 'A', teks: 'Menyiram tumpahan dengan air dalam jumlah sedikit dan membiarkannya mengering' },
      { id: 'B', teks: 'Mengamankan perimeter, menggunakan APD tahan asam, dan melokalisir tumpahan dengan spill kit absorbent' },
      { id: 'C', teks: 'Menyapu cairan ke selokan pembuangan umum' },
      { id: 'D', teks: 'Meninggalkan area tanpa memberi peringatan kepada rekan kerja' },
    ],
    kunci: 'B',
    bobot: 50,
  },
];

export const INITIAL_ASSIGNMENTS: TrainingAssignment[] = [
  {
    id: 'asg-1',
    training_id: 'trn-1',
    employee_id: 'emp-1',
    assigned_by: 'u-1',
    assigned_at: '2026-02-10T08:00:00Z',
    due_date: '2026-03-31',
    status: 'in_progress',
    progress_percent: 60,
  },
  {
    id: 'asg-2',
    training_id: 'trn-2',
    employee_id: 'emp-1',
    assigned_by: 'u-1',
    assigned_at: '2026-02-10T08:00:00Z',
    due_date: '2026-04-15',
    status: 'not_started',
    progress_percent: 0,
  },
  {
    id: 'asg-3',
    training_id: 'trn-1',
    employee_id: 'emp-2',
    assigned_by: 'u-1',
    assigned_at: '2026-02-10T08:00:00Z',
    due_date: '2026-03-25',
    status: 'completed',
    progress_percent: 100,
  },
  {
    id: 'asg-4',
    training_id: 'trn-1',
    employee_id: 'emp-4',
    assigned_by: 'u-1',
    assigned_at: '2026-02-12T08:00:00Z',
    due_date: '2026-03-28',
    status: 'completed',
    progress_percent: 100,
  },
];

export const INITIAL_ATTEMPTS: AssessmentAttempt[] = [
  {
    id: 'att-1',
    employee_id: 'emp-1',
    training_id: 'trn-1',
    test_type: 'pre_test',
    attempt_no: 1,
    score: 50,
    pass_status: 'failed',
    answers: { 'q-1': 'B', 'q-2': 'A', 'q-3': 'A', 'q-4': 'C' },
    timestamp: '2026-02-11T09:15:00Z',
  },
  {
    id: 'att-2',
    employee_id: 'emp-2',
    training_id: 'trn-1',
    test_type: 'post_test',
    attempt_no: 1,
    score: 100,
    pass_status: 'passed',
    answers: { 'q-1': 'B', 'q-2': 'B', 'q-3': 'B', 'q-4': 'C' },
    timestamp: '2026-02-12T14:30:00Z',
  },
];

export const INITIAL_ASSESSMENTS: CompetencyAssessment[] = [
  {
    id: 'ca-1',
    employee_id: 'emp-1', // Doni Setiawan (pos-1: Operator Produksi)
    competency_id: 'comp-1', // Risk Assessment (Required: Level 2)
    actual_level_id: 'lvl-1', // Gap detected! (Actual lvl-1 vs Required lvl-2)
    assessor_id: 'u-3',
    evidence: 'Hasil observasi lapangan: memahami bahaya dasar namun masih perlu supervisi dalam menyusun form JSA independen.',
    evidence_method: 'Practical/OJT',
    assessed_at: '2026-02-15T11:00:00Z',
  },
  {
    id: 'ca-2',
    employee_id: 'emp-1',
    competency_id: 'comp-2', // Chemical Safety (Required: Level 2)
    actual_level_id: 'lvl-2', // Met!
    assessor_id: 'u-3',
    evidence: 'Telah mengikuti simulasi spill kit tanggap darurat kimia di workshop B3 dan lulus verifikasi checklist operasional.',
    evidence_method: 'Practical/OJT',
    assessed_at: '2026-02-16T13:45:00Z',
  },
  {
    id: 'ca-3',
    employee_id: 'emp-1',
    competency_id: 'comp-3', // SOP Execution (Required: Level 3)
    actual_level_id: 'lvl-2', // Gap detected! (Actual lvl-2 vs Required lvl-3)
    assessor_id: 'u-3',
    evidence: 'Operator menjalankan mesin mandiri dengan baik, namun belum siap membimbing operator baru saat terjadi anomali alarm.',
    evidence_method: 'Evaluasi Supervisor',
    assessed_at: '2026-02-18T16:00:00Z',
  },
  {
    id: 'ca-4',
    employee_id: 'emp-4', // Ahmad Fauzi (HSE Officer)
    competency_id: 'comp-1', // Risk Assessment (Required: Level 4)
    actual_level_id: 'lvl-4', // Met!
    assessor_id: 'u-3',
    evidence: 'Memegang sertifikasi Ahli K3 Umum Kemnaker RI dan memimpin penyusunan dokumen HIRADC pabrik.',
    evidence_method: 'Sertifikasi',
    assessed_at: '2026-02-10T10:00:00Z',
  },
];

export const INITIAL_DEV_ACTIONS: DevelopmentAction[] = [
  {
    id: 'da-1',
    employee_id: 'emp-1',
    competency_id: 'comp-1',
    gap_level: -1,
    action_type: 'Practical / OJT',
    owner: 'Ratna Sari (Supervisor)',
    due_date: '2026-04-10',
    status: 'in_progress',
    notes: 'Penugasan pendampingan pembuatan 5 dokumen JSA riil di lini assembling bersama supervisor.',
    created_at: '2026-02-16T08:00:00Z',
  },
  {
    id: 'da-2',
    employee_id: 'emp-1',
    competency_id: 'comp-3',
    gap_level: -1,
    action_type: 'Coaching & Mentoring',
    owner: 'Bambang Prasetyo (Trainer)',
    due_date: '2026-04-20',
    status: 'open',
    notes: 'Sesi mentoring 1-on-1 tentang penanganan deviasi alarm mesin dan teknik mentoring rekan kerja.',
    created_at: '2026-02-19T09:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'u-1',
    user_nama: 'Akbar Husnul Falah (Super Admin)',
    action: 'INISIALISASI_SISTEM',
    entity: 'SYSTEM',
    entity_id: 'sys',
    details: 'Database LCMS berhasil diinisialisasi dengan konfigurasi master data awal oleh Super Admin Akbar Husnul Falah.',
    timestamp: '2026-02-01T08:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'u-1',
    user_nama: 'Akbar Husnul Falah (Super Admin)',
    action: 'SIMPAN_MATRIKS_KOMPETENSI',
    entity: 'PositionCompetencyRequirement',
    entity_id: 'pos-1',
    details: 'Matriks kompetensi jabatan Operator Produksi berhasil disimpan dengan 4 kompetensi wajib.',
    timestamp: '2026-02-01T10:05:00Z',
  },
];

export const INITIAL_SCHEDULES: TrainingSchedule[] = [
  {
    id: 'sch-1',
    title: 'Training Sertifikasi K3 & HIRADC Lapangan',
    training_id: 'trn-1',
    custom_training_name: 'Dasar Identifikasi Bahaya & Penilaian Risiko (JSA & HIRADC)',
    category: 'Wajib K3 / HSE',
    department_ids: ['dept-1', 'dept-2'],
    trainer_id: 'u-2',
    trainer_name: 'Bambang Prasetyo',
    trainer_email: 'trainer@lcms.corp',
    start_date: '2026-10-20',
    end_date: '2026-10-20',
    start_time: '08:30',
    end_time: '12:00',
    location_type: 'offline',
    room_location: 'Ruang Pelatihan HSE - Gedung Utama Lt. 2',
    max_participants: 25,
    enrolled_employee_ids: ['emp-1', 'emp-4'],
    status: 'scheduled',
    notes: 'Wajib membawa APD standar (Safety Shoes & Helm) untuk sesi praktek lapangan inspeksi bahaya.',
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'sch-2',
    title: 'Workshop Penanganan & Tanggap Darurat B3 (Bahan Berbahaya)',
    training_id: 'trn-2',
    custom_training_name: 'Manajemen & Penanganan Aman Bahan Kimia Berbahaya (B3)',
    category: 'Wajib K3 / HSE',
    department_ids: ['dept-1', 'dept-3'],
    trainer_id: 'u-2',
    trainer_name: 'Bambang Prasetyo',
    trainer_email: 'trainer@lcms.corp',
    start_date: '2026-10-24',
    end_date: '2026-10-24',
    start_time: '09:00',
    end_time: '15:00',
    location_type: 'hybrid',
    room_location: 'Lab Kimia & Hall Serbaguna',
    meeting_url: 'https://meet.google.com/lcms-b3-emergency',
    max_participants: 30,
    enrolled_employee_ids: ['emp-1', 'emp-2'],
    status: 'scheduled',
    notes: 'Termasuk simulasi pemadaman dan pembersihan tumpahan bahan korosif sesuai SDS.',
    created_at: '2026-10-16T10:00:00Z',
  },
  {
    id: 'sch-3',
    title: 'Pelatihan Lintas Departemen: Standar Mutu ISO 9001:2015 & SOP Mesin',
    training_id: 'trn-3',
    custom_training_name: 'Eksekusi Presisi SOP Operasi Mesin & Kepatuhan Standar ISO',
    category: 'Kualitas & ISO',
    department_ids: ['all'],
    trainer_name: 'Dr. Ir. Hendro Kusumo, ST (Trainer Eksternal)',
    trainer_email: 'hendro.kusumo@training-iso.id',
    start_date: '2026-10-28',
    end_date: '2026-10-29',
    start_time: '08:00',
    end_time: '16:00',
    location_type: 'offline',
    room_location: 'Auditorium Korporat Lt. 3',
    max_participants: 50,
    enrolled_employee_ids: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'],
    status: 'scheduled',
    notes: 'Pelatihan 2 hari dengan ujian sertifikasi kelulusan terverifikasi.',
    created_at: '2026-10-16T14:30:00Z',
  },
  {
    id: 'sch-4',
    title: 'Custom Workshop: Leadership & Supervisory Excellence 2026',
    custom_training_name: 'Supervisory Excellence & Coaching Karyawan Baru',
    category: 'Leadership',
    department_ids: ['dept-1', 'dept-2', 'dept-3', 'dept-4'],
    trainer_id: 'u-1',
    trainer_name: 'Akbar Husnul Falah (Super Admin / L&D Head)',
    trainer_email: 'akbar@lcms.corp',
    start_date: '2026-11-05',
    end_date: '2026-11-05',
    start_time: '13:00',
    end_time: '17:00',
    location_type: 'online',
    meeting_url: 'https://meet.google.com/lcms-leadership-akbar',
    max_participants: 20,
    enrolled_employee_ids: ['emp-3'],
    status: 'scheduled',
    notes: 'Fokus pada teknik delegasi tugas, penyelesaian konflik operasional, dan penilaian level kompetensi riil tim.',
    created_at: '2026-10-17T07:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-1',
    recipient_email: 'akbar@lcms.corp',
    recipient_name: 'Akbar Husnul Falah',
    recipient_role: 'admin',
    subject: 'Selamat Datang di LCMS Enterprise - Super Admin',
    preview: 'Akun Super Admin Anda telah aktif dengan akses penuh ke seluruh modul sistem.',
    body_html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f766e; margin-bottom: 8px;">Selamat Datang di LCMS Enterprise, Akbar Husnul Falah!</h2>
        <p>Akun Anda telah dikonfigurasi sebagai <strong>Super Administrator</strong> dengan wewenang penuh untuk mengelola struktur organisasi, master kompetensi, matriks jabatan, kalender training, dan hak akses pengguna.</p>
        <div style="background-color: #f0fdfa; border-left: 4px solid #0f766e; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #115e59;">Kredensial Akun:</p>
          <p style="margin: 4px 0 0 0;">Email: <strong>akbar@lcms.corp</strong> | Peran: <strong>SUPER ADMIN</strong></p>
        </div>
        <p>Anda dapat menjadwalkan pelatihan baru, mengirimkan email reminder otomatis kepada peserta & trainer, serta mengawasi matriks kompetensi perusahaan.</p>
      </div>
    `,
    type: 'welcome_registration',
    sent_at: '2026-10-17T07:00:00Z',
    is_read: false,
    status: 'delivered',
  },
  {
    id: 'notif-2',
    recipient_email: 'doni@lcms.corp',
    recipient_name: 'Doni Setiawan',
    recipient_role: 'employee',
    subject: '[Undangan Pelatihan] Training Sertifikasi K3 & HIRADC Lapangan - 20 Oktober 2026',
    preview: 'Anda telah dijadwalkan mengikuti sesi pelatihan K3 & HIRADC di Ruang Pelatihan HSE.',
    body_html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f766e; margin-bottom: 8px;">Pemberitahuan Jadwal Pelatihan</h2>
        <p>Halo <strong>Doni Setiawan</strong>,</p>
        <p>Anda telah didaftarkan untuk mengikuti program pelatihan wajib dari Departemen Operasional & Produksi:</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #0f172a;">Training Sertifikasi K3 & HIRADC Lapangan</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Hari & Tanggal:</td><td><strong>Selasa, 20 Oktober 2026</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Waktu Sesi:</td><td><strong>08:30 - 12:00 WIB</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Lokasi:</td><td>Ruang Pelatihan HSE - Gedung Utama Lt. 2</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Instruktur/Trainer:</td><td>Bambang Prasetyo (trainer@lcms.corp)</td></tr>
          </table>
        </div>
        <p>Harap hadir 15 menit sebelum sesi dimulai dengan perlengkapan APD standar. Reminder akan dikirimkan kembali menjelang hari pelatihan.</p>
      </div>
    `,
    type: 'training_schedule_invite',
    related_schedule_id: 'sch-1',
    sent_at: '2026-10-17T07:05:00Z',
    is_read: false,
    status: 'delivered',
  },
  {
    id: 'notif-3',
    recipient_email: 'trainer@lcms.corp',
    recipient_name: 'Bambang Prasetyo',
    recipient_role: 'trainer',
    subject: '[Penugasan Instruktur] Jadwal Sesi Training K3 & HIRADC Lapangan',
    preview: 'Konfirmasi penugasan Anda sebagai trainer pada jadwal 20 Oktober 2026.',
    body_html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #4338ca; margin-bottom: 8px;">Penugasan Instruktur Pelatihan</h2>
        <p>Yth. <strong>Bambang Prasetyo</strong>,</p>
        <p>Anda ditugaskan sebagai Instruktur Utama pada sesi pelatihan terjadwal:</p>
        <p><strong>Topik:</strong> Training Sertifikasi K3 & HIRADC Lapangan<br/><strong>Waktu:</strong> 20 Oktober 2026, 08:30 - 12:00 WIB<br/><strong>Peserta Terdaftar:</strong> 25 Karyawan (Departemen Operasional & HSE)</p>
        <p>Silakan periksa silabus modul dan kuis evaluasi di portal LCMS sebelum sesi berlangsung.</p>
      </div>
    `,
    type: 'training_schedule_invite',
    related_schedule_id: 'sch-1',
    sent_at: '2026-10-17T07:06:00Z',
    is_read: true,
    status: 'delivered',
  },
  {
    id: 'notif-4',
    recipient_email: 'supervisor@lcms.corp',
    recipient_name: 'Ratna Sari',
    recipient_role: 'supervisor',
    subject: '[Pemberitahuan Supervisor] Pelatihan Karyawan Departemen Operasional & Produksi',
    preview: 'Pemberitahuan jadwal pelatihan anggota tim Anda untuk pemenuhan kompetensi.',
    body_html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #047857; margin-bottom: 8px;">Pemberitahuan Pengawas / Supervisor</h2>
        <p>Halo <strong>Ratna Sari</strong>,</p>
        <p>Berikut adalah pemberitahuan bahwa anggota tim dari departemen Anda dijadwalkan mengikuti pelatihan untuk pemenuhan kesenjangan (gap) kompetensi:</p>
        <p><strong>Nama Training:</strong> Training Sertifikasi K3 & HIRADC Lapangan<br/><strong>Jadwal:</strong> 20 Oktober 2026, 08:30 - 12:00 WIB<br/><strong>Peserta:</strong> Doni Setiawan dkk.</p>
        <p>Mohon dapat mengoordinasikan jadwal shift kerja lapangan agar peserta dapat menghadiri sesi dengan lancar.</p>
      </div>
    `,
    type: 'training_schedule_invite',
    related_schedule_id: 'sch-1',
    sent_at: '2026-10-17T07:07:00Z',
    is_read: false,
    status: 'delivered',
  },
];
