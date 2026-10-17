import {
  User,
  UserRole,
  UserPermissions,
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
  PermissionDefinition,
  TrainingSchedule,
  EmailNotification,
} from '../types/lcms';

export const DEFAULT_PERMISSION_DEFS: PermissionDefinition[] = [
  {
    id: 'perm-1',
    key: 'can_edit_training',
    title: 'Edit Silabus & Training',
    desc: 'Dapat membuat, mengedit materi silabus dan modul training',
    highlight: true,
  },
  {
    id: 'perm-2',
    key: 'can_edit_questions',
    title: 'Edit Soal Pre/Post-Test',
    desc: 'Dapat membuat, mengedit bank soal dan menentukan kunci jawaban quiz',
    highlight: true,
  },
  {
    id: 'perm-3',
    key: 'can_upload_material',
    title: 'Upload Video & Link GDrive',
    desc: 'Dapat mengunggah video MP4/WebM dan menyematkan tautan Google Drive',
    highlight: true,
  },
  {
    id: 'perm-4',
    key: 'can_assign_training',
    title: 'Tugaskan Training',
    desc: 'Dapat menugaskan modul pembelajaran kepada karyawan',
  },
  {
    id: 'perm-5',
    key: 'can_manage_matrix',
    title: 'Konfigurasi Matriks Jabatan',
    desc: 'Dapat mengatur kompetensi wajib dan level minimal jabatan',
  },
  {
    id: 'perm-6',
    key: 'can_manage_competencies',
    title: 'Kelola Master Kompetensi & Level',
    desc: 'Dapat menambah/mengedit daftar kompetensi dan skala level',
  },
  {
    id: 'perm-7',
    key: 'can_manage_org',
    title: 'Kelola Struktur Organisasi',
    desc: 'Dapat menambah, mengedit, dan menghapus departemen & jabatan',
  },
  {
    id: 'perm-8',
    key: 'can_assess_team',
    title: 'Penilaian Aktual (Supervisor)',
    desc: 'Dapat mencatat penilaian level riil dan checklist bukti lapangan',
  },
  {
    id: 'perm-9',
    key: 'can_manage_gap',
    title: 'Kelola Gap & Action Plan',
    desc: 'Dapat membuat dan memonitor rencana aksi kesenjangan',
  },
  {
    id: 'perm-10',
    key: 'can_view_reports',
    title: 'Lihat & Ekspor Laporan Excel/PDF',
    desc: 'Dapat mengunduh rekap progres training dan nilai ujian',
  },
  {
    id: 'perm-11',
    key: 'can_learn',
    title: 'Akses Portal My Learning',
    desc: 'Dapat menonton video materi dan mengerjakan ujian pre/post test',
  },
];

import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_CATEGORIES,
  INITIAL_COMPETENCIES,
  INITIAL_LEVELS,
  INITIAL_CONFIG_OPTIONS,
  INITIAL_MATRIX,
  INITIAL_EMPLOYEES,
  INITIAL_TRAININGS,
  INITIAL_MATERIALS,
  INITIAL_QUESTIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_ASSESSMENTS,
  INITIAL_DEV_ACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SCHEDULES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const STORAGE_KEY = 'lcms_database_v3';
const CURRENT_USER_KEY = 'lcms_current_user_v3';
const AUTH_STATE_KEY = 'lcms_auth_logged_in_v3';

export function getDefaultPermissionsForRole(role: UserRole): UserPermissions {
  if (role === 'admin') {
    return {
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
    };
  }
  if (role === 'trainer') {
    return {
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
    };
  }
  if (role === 'supervisor') {
    return {
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
    };
  }
  // employee / peserta
  return {
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
  };
}

interface LCMSDatabase {
  users: User[];
  departments: Department[];
  positions: Position[];
  categories: CompetencyCategory[];
  competencies: Competency[];
  levels: CompetencyLevel[];
  matrix: PositionCompetencyRequirement[];
  configOptions: ConfigOption[];
  employees: Employee[];
  trainings: Training[];
  materials: LearningMaterial[];
  questions: Question[];
  assignments: TrainingAssignment[];
  attempts: AssessmentAttempt[];
  learningProgress: LearningProgress[];
  assessments: CompetencyAssessment[];
  devActions: DevelopmentAction[];
  auditLogs: AuditLog[];
  permissionDefs?: PermissionDefinition[];
  schedules: TrainingSchedule[];
  notifications: EmailNotification[];
}

function getInitialDatabase(): LCMSDatabase {
  return {
    users: INITIAL_USERS,
    departments: INITIAL_DEPARTMENTS,
    positions: INITIAL_POSITIONS,
    categories: INITIAL_CATEGORIES,
    competencies: INITIAL_COMPETENCIES,
    levels: INITIAL_LEVELS,
    matrix: INITIAL_MATRIX,
    configOptions: INITIAL_CONFIG_OPTIONS,
    employees: INITIAL_EMPLOYEES,
    trainings: INITIAL_TRAININGS,
    materials: INITIAL_MATERIALS,
    questions: INITIAL_QUESTIONS,
    assignments: INITIAL_ASSIGNMENTS,
    attempts: INITIAL_ATTEMPTS,
    learningProgress: [],
    assessments: INITIAL_ASSESSMENTS,
    devActions: INITIAL_DEV_ACTIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    permissionDefs: [...DEFAULT_PERMISSION_DEFS],
    schedules: [...INITIAL_SCHEDULES],
    notifications: [...INITIAL_NOTIFICATIONS],
  };
}

class LCMSStore {
  private db: LCMSDatabase;
  private listeners: Set<() => void> = new Set();
  private currentUser: User;
  private loggedIn: boolean = true;

  constructor() {
    this.db = this.loadDatabase();
    this.currentUser = this.loadCurrentUser();
    this.loggedIn = localStorage.getItem(AUTH_STATE_KEY) !== 'false';
  }

  private loadDatabase(): LCMSDatabase {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed.positions && parsed.matrix && parsed.levels && parsed.competencies) {
          // Migration: Ensure Akbar Husnul Falah is Super Admin replacing Dimas
          if (Array.isArray(parsed.users)) {
            parsed.users.forEach((u: User) => {
              if (
                u.id === 'u-1' ||
                u.name?.toLowerCase().includes('dimas') ||
                u.email === 'akbar@lcms.corp' ||
                (u.role === 'admin' && !u.name.toLowerCase().includes('akbar'))
              ) {
                u.name = 'Akbar Husnul Falah';
                u.email = 'akbar@lcms.corp';
                u.role = 'admin';
                u.permissions = getDefaultPermissionsForRole('admin');
              }
              if (!u.permissions) {
                u.permissions = getDefaultPermissionsForRole(u.role);
              }
              if (!u.password) {
                u.password = 'password123';
              }
            });
          }
          if (!parsed.permissionDefs || parsed.permissionDefs.length === 0) {
            parsed.permissionDefs = [...DEFAULT_PERMISSION_DEFS];
          }
          if (!parsed.schedules || parsed.schedules.length === 0) {
            parsed.schedules = [...INITIAL_SCHEDULES];
          }
          if (!parsed.notifications || parsed.notifications.length === 0) {
            parsed.notifications = [...INITIAL_NOTIFICATIONS];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse LCMS localStorage, initializing with defaults', e);
    }
    const initial = getInitialDatabase();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dbToSave: LCMSDatabase) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbToSave));
    } catch (e) {
      console.error('Error saving LCMS database to storage', e);
    }
  }

  private persist() {
    this.saveDatabase(this.db);
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener notification error', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- CURRENT USER & AUTH ---
  private loadCurrentUser(): User {
    try {
      const serialized = localStorage.getItem(CURRENT_USER_KEY);
      if (serialized) {
        const user = JSON.parse(serialized);
        if (
          user.id === 'u-1' ||
          user.name?.toLowerCase().includes('dimas') ||
          (user.role === 'admin' && !user.name.toLowerCase().includes('akbar'))
        ) {
          user.name = 'Akbar Husnul Falah';
          user.email = 'akbar@lcms.corp';
          user.role = 'admin';
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
        const match = this.db.users.find((u) => u.id === user.id);
        if (match) return match;
      }
    } catch (e) {
      console.warn('Error loading current user', e);
    }
    return this.db.users[0]; // Akbar Husnul Falah (Admin) by default
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.loggedIn = true;
    localStorage.setItem(AUTH_STATE_KEY, 'true');
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save current user', e);
    }
    this.notify();
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public login(email: string, password?: string): { success: boolean; user?: User; error?: string } {
    const user = this.db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'Email tidak ditemukan dalam sistem.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'Akun ini dinonaktifkan oleh Administrator.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Kata sandi tidak sesuai.' };
    }

    this.setCurrentUser(user);
    this.logAction('LOGIN', 'User', user.id, `Pengguna login: ${user.name} (${user.email})`);
    return { success: true, user };
  }

  public register(data: {
    name: string;
    email: string;
    password?: string;
    department_id?: string;
    position_id?: string;
    role?: UserRole;
  }): { success: boolean; user?: User; error?: string } {
    const existing = this.db.users.find(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      return { success: false, error: 'Email ini sudah terdaftar dalam sistem.' };
    }

    const assignedRole: UserRole = data.role || 'employee';

    // Create Employee record if department or position provided
    let empRecordId: string | undefined = undefined;
    if (data.department_id || data.position_id) {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employee_code: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        nama: data.name.trim(),
        email: data.email.trim(),
        department_id: data.department_id || (this.db.departments[0]?.id ?? ''),
        position_id: data.position_id || (this.db.positions[0]?.id ?? ''),
        hire_date: new Date().toISOString().slice(0, 10),
        status: 'active',
      };
      this.db.employees.push(newEmp);
      empRecordId = newEmp.id;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password || 'password123',
      role: assignedRole,
      employee_id: empRecordId,
      permissions: getDefaultPermissionsForRole(assignedRole),
      status: 'active',
    };

    this.db.users.push(newUser);
    this.logAction(
      'REGISTER_USER',
      'User',
      newUser.id,
      `Pendaftaran akun baru: ${newUser.name} (${newUser.email}) sebagai ${newUser.role}`
    );

    // Send Welcome Email Notification for this role
    this.createRegistrationWelcomeNotification(newUser, data.department_id);

    // Send Schedule Notification / Reminder for relevant training in their department
    this.sendRelevantScheduleNotificationsForUser(newUser, data.department_id);

    this.setCurrentUser(newUser);
    this.persist();

    return { success: true, user: newUser };
  }

  public logout() {
    this.loggedIn = false;
    localStorage.setItem(AUTH_STATE_KEY, 'false');
    this.logAction('LOGOUT', 'User', this.currentUser.id, `Pengguna logout: ${this.currentUser.name}`);
    this.notify();
  }

  // Permission Checker
  public hasPermission(permission: keyof UserPermissions): boolean {
    if (this.currentUser.role === 'admin') return true;
    if (!this.currentUser.permissions) return false;
    return !!this.currentUser.permissions[permission];
  }

  public updateUserPermissions(userId: string, permissions: UserPermissions): User {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan');
    user.permissions = { ...permissions };
    this.logAction('UPDATE_PERMISSIONS', 'User', userId, `Hak akses checklist untuk ${user.name} diperbarui`);
    this.persist();
    return user;
  }

  public resetToDefault() {
    this.db = getInitialDatabase();
    this.persist();
    this.setCurrentUser(this.db.users[0]);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return [...this.db.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public logAction(action: string, entity: string, entityId: string, details?: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: this.currentUser.id,
      user_nama: `${this.currentUser.name} (${this.currentUser.role.toUpperCase()})`,
      action,
      entity,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(newLog);
    if (this.db.auditLogs.length > 200) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 200);
    }
    this.persist();
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.db.users;
  }

  public addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      permissions: user.permissions || getDefaultPermissionsForRole(user.role),
    };
    this.db.users.push(newUser);
    this.logAction('CREATE_USER', 'User', newUser.id, `Pengguna baru ditambahkan: ${newUser.name} (${newUser.role})`);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const index = this.db.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.db.users[index] = { ...this.db.users[index], ...updates };
    this.logAction('UPDATE_USER', 'User', id, `Pengguna diperbarui: ${this.db.users[index].name}`);
    this.persist();
    return this.db.users[index];
  }

  public deleteUser(id: string) {
    if (this.currentUser.id === id) {
      throw new Error('Tidak dapat menghapus akun yang sedang aktif digunakan.');
    }
    const user = this.db.users.find((u) => u.id === id);
    this.db.users = this.db.users.filter((u) => u.id !== id);
    this.logAction('DELETE_USER', 'User', id, `Akun pengguna dihapus: ${user?.name || id}`);
    this.persist();
  }

  // --- DEPARTMENTS ---
  public getDepartments(includeInactive = false): Department[] {
    return includeInactive ? this.db.departments : this.db.departments.filter((d) => d.status === 'active');
  }

  public addDepartment(nama: string, kode?: string): Department {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      nama: nama.trim(),
      kode: (kode || nama.substring(0, 3)).toUpperCase().trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.db.departments.push(newDept);
    this.logAction('CREATE_DEPT', 'Department', newDept.id, `Departemen baru dibuat: ${newDept.nama}`);
    this.persist();
    return newDept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department {
    const idx = this.db.departments.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Departemen tidak ditemukan');
    this.db.departments[idx] = { ...this.db.departments[idx], ...updates };
    this.logAction('UPDATE_DEPT', 'Department', id, `Departemen diperbarui: ${this.db.departments[idx].nama}`);
    this.persist();
    return this.db.departments[idx];
  }

  public deleteDepartment(id: string) {
    const dept = this.db.departments.find((d) => d.id === id);
    this.db.departments = this.db.departments.filter((d) => d.id !== id);
    // Unlink from positions and employees
    this.db.positions.forEach((p) => {
      if (p.department_id === id) p.department_id = undefined;
    });
    this.db.employees.forEach((e) => {
      if (e.department_id === id) e.department_id = '';
    });
    this.logAction('DELETE_DEPT', 'Department', id, `Departemen dihapus: ${dept?.nama || id}`);
    this.persist();
  }

  public toggleDepartmentStatus(id: string): Department {
    const dept = this.db.departments.find((d) => d.id === id);
    if (!dept) throw new Error('Department not found');
    dept.status = dept.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_DEPT', 'Department', id, `Status departemen diubah: ${dept.nama} (${dept.status})`);
    this.persist();
    return dept;
  }

  // --- POSITIONS (JABATAN) ---
  public getPositions(includeInactive = false): Position[] {
    return includeInactive ? this.db.positions : this.db.positions.filter((p) => p.status === 'active');
  }

  public addPosition(nama_jabatan: string, kode?: string, department_id?: string, deskripsi?: string): Position {
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      nama_jabatan: nama_jabatan.trim(),
      kode: (kode || nama_jabatan.substring(0, 3)).toUpperCase().trim(),
      department_id,
      deskripsi: deskripsi?.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.db.positions.push(newPos);
    this.logAction('CREATE_POSITION', 'Position', newPos.id, `Jabatan baru dibuat: ${newPos.nama_jabatan}`);
    this.persist();
    return newPos;
  }

  public updatePosition(id: string, updates: Partial<Position>): Position {
    const idx = this.db.positions.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Jabatan tidak ditemukan');
    this.db.positions[idx] = { ...this.db.positions[idx], ...updates };
    this.logAction('UPDATE_POSITION', 'Position', id, `Jabatan diperbarui: ${this.db.positions[idx].nama_jabatan}`);
    this.persist();
    return this.db.positions[idx];
  }

  public deletePosition(id: string) {
    const pos = this.db.positions.find((p) => p.id === id);
    this.db.positions = this.db.positions.filter((p) => p.id !== id);
    // Remove matrix requirements for this position
    this.db.matrix = this.db.matrix.filter((m) => m.position_id !== id);
    // Unlink position from employees
    this.db.employees.forEach((e) => {
      if (e.position_id === id) e.position_id = '';
    });
    this.logAction('DELETE_POSITION', 'Position', id, `Jabatan dihapus: ${pos?.nama_jabatan || id}`);
    this.persist();
  }

  public togglePositionStatus(id: string): Position {
    const pos = this.db.positions.find((p) => p.id === id);
    if (!pos) throw new Error('Position not found');
    pos.status = pos.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_POSITION', 'Position', id, `Status jabatan diubah: ${pos.nama_jabatan} (${pos.status})`);
    this.persist();
    return pos;
  }

  // --- COMPETENCY CATEGORIES ---
  public getCategories(includeInactive = false): CompetencyCategory[] {
    return includeInactive ? this.db.categories : this.db.categories.filter((c) => c.status === 'active');
  }

  public addCategory(nama: string): CompetencyCategory {
    const newCat: CompetencyCategory = {
      id: `cat-${Date.now()}`,
      nama: nama.trim(),
      status: 'active',
    };
    this.db.categories.push(newCat);
    this.logAction('CREATE_CATEGORY', 'Category', newCat.id, `Kategori kompetensi baru: ${nama}`);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, nama: string): CompetencyCategory {
    const cat = this.db.categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    cat.nama = nama.trim();
    this.logAction('UPDATE_CATEGORY', 'Category', id, `Kategori diubah: ${nama}`);
    this.persist();
    return cat;
  }

  public deleteCategory(id: string) {
    const cat = this.db.categories.find((c) => c.id === id);
    this.db.categories = this.db.categories.filter((c) => c.id !== id);
    this.logAction('DELETE_CATEGORY', 'Category', id, `Kategori kompetensi dihapus: ${cat?.nama || id}`);
    this.persist();
  }

  public toggleCategoryStatus(id: string): CompetencyCategory {
    const cat = this.db.categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    cat.status = cat.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_CATEGORY', 'Category', id, `Status kategori diubah: ${cat.nama} (${cat.status})`);
    this.persist();
    return cat;
  }

  // --- COMPETENCIES ---
  public getCompetencies(includeInactive = false): Competency[] {
    return includeInactive ? this.db.competencies : this.db.competencies.filter((c) => c.status === 'active');
  }

  public addCompetency(nama: string, kategori_id: string, deskripsi: string, indikator_perilaku?: string): Competency {
    const newComp: Competency = {
      id: `comp-${Date.now()}`,
      nama: nama.trim(),
      kategori_id,
      deskripsi: deskripsi.trim(),
      indikator_perilaku: indikator_perilaku?.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.db.competencies.push(newComp);
    this.logAction('CREATE_COMPETENCY', 'Competency', newComp.id, `Kompetensi baru ditambahkan: ${nama}`);
    this.persist();
    return newComp;
  }

  public updateCompetency(id: string, updates: Partial<Competency>): Competency {
    const idx = this.db.competencies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Competency not found');
    this.db.competencies[idx] = { ...this.db.competencies[idx], ...updates };
    this.logAction('UPDATE_COMPETENCY', 'Competency', id, `Kompetensi diperbarui: ${this.db.competencies[idx].nama}`);
    this.persist();
    return this.db.competencies[idx];
  }

  public deleteCompetency(id: string) {
    const comp = this.db.competencies.find((c) => c.id === id);
    this.db.competencies = this.db.competencies.filter((c) => c.id !== id);
    // Remove from matrix
    this.db.matrix = this.db.matrix.filter((m) => m.competency_id !== id);
    // Remove from assessments & dev actions
    this.db.assessments = this.db.assessments.filter((a) => a.competency_id !== id);
    this.db.devActions = this.db.devActions.filter((d) => d.competency_id !== id);
    this.logAction('DELETE_COMPETENCY', 'Competency', id, `Kompetensi dihapus: ${comp?.nama || id}`);
    this.persist();
  }

  public toggleCompetencyStatus(id: string): Competency {
    const comp = this.db.competencies.find((c) => c.id === id);
    if (!comp) throw new Error('Competency not found');
    comp.status = comp.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_COMPETENCY', 'Competency', id, `Status kompetensi diubah: ${comp.nama} (${comp.status})`);
    this.persist();
    return comp;
  }

  // --- COMPETENCY LEVELS (CONFIGURABLE SCALE) ---
  public getLevels(includeInactive = false): CompetencyLevel[] {
    const list = includeInactive ? this.db.levels : this.db.levels.filter((l) => l.status === 'active');
    return [...list].sort((a, b) => a.urutan - b.urutan);
  }

  public addLevel(nama_level: string, deskripsi: string, urutan?: number): CompetencyLevel {
    const nextUrutan = urutan !== undefined ? urutan : this.db.levels.length + 1;
    const newLevel: CompetencyLevel = {
      id: `lvl-${Date.now()}`,
      nama_level: nama_level.trim(),
      urutan: nextUrutan,
      deskripsi: deskripsi.trim(),
      status: 'active',
    };
    this.db.levels.push(newLevel);
    this.logAction('CREATE_LEVEL', 'CompetencyLevel', newLevel.id, `Level baru ditambahkan: ${nama_level} (Urutan ${nextUrutan})`);
    this.persist();
    return newLevel;
  }

  public updateLevel(id: string, updates: Partial<CompetencyLevel>): CompetencyLevel {
    const idx = this.db.levels.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Level not found');
    this.db.levels[idx] = { ...this.db.levels[idx], ...updates };
    this.logAction('UPDATE_LEVEL', 'CompetencyLevel', id, `Level diperbarui: ${this.db.levels[idx].nama_level}`);
    this.persist();
    return this.db.levels[idx];
  }

  public reorderLevels(orderedIds: string[]) {
    orderedIds.forEach((id, index) => {
      const level = this.db.levels.find((l) => l.id === id);
      if (level) {
        level.urutan = index + 1;
      }
    });
    this.logAction('REORDER_LEVELS', 'CompetencyLevel', 'all', 'Urutan skala level kompetensi diperbarui');
    this.persist();
  }

  public toggleLevelStatus(id: string): CompetencyLevel {
    const lvl = this.db.levels.find((l) => l.id === id);
    if (!lvl) throw new Error('Level not found');
    lvl.status = lvl.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_LEVEL', 'CompetencyLevel', id, `Status level diubah: ${lvl.nama_level} (${lvl.status})`);
    this.persist();
    return lvl;
  }

  public deleteLevel(id: string) {
    const inUse = this.db.matrix.some((m) => m.required_level_id === id);
    if (inUse) {
      throw new Error('Level ini sedang digunakan dalam Matriks Kompetensi Jabatan. Nonaktifkan saja agar histori tetap valid.');
    }
    this.db.levels = this.db.levels.filter((l) => l.id !== id);
    this.logAction('DELETE_LEVEL', 'CompetencyLevel', id, 'Level kompetensi dihapus');
    this.persist();
  }

  // --- CONFIG OPTIONS (Checklists for Pemenuhan, Tindakan Gap, Custom) ---
  public getConfigOptions(category?: string, includeInactive = false): ConfigOption[] {
    let list = includeInactive ? this.db.configOptions : this.db.configOptions.filter((o) => o.status === 'active');
    if (category && category !== 'all') {
      list = list.filter((o) => o.category === category);
    }
    return list;
  }

  public getConfigCategories(): string[] {
    const defaultCats = ['pemenuhan', 'tindakan_gap', 'training_kategori'];
    const customCats = (this.db.configOptions || []).map((o) => o.category);
    return Array.from(new Set([...defaultCats, ...customCats]));
  }

  public addConfigOption(category: string, label: string): ConfigOption {
    const newOpt: ConfigOption = {
      id: `opt-${Date.now()}`,
      category,
      label: label.trim(),
      status: 'active',
    };
    this.db.configOptions.push(newOpt);
    this.logAction('CREATE_OPTION', 'ConfigOption', newOpt.id, `Opsi checklist baru (${category}): ${label}`);
    this.persist();
    return newOpt;
  }

  public updateConfigOption(id: string, label: string, status?: 'active' | 'inactive'): ConfigOption {
    const opt = this.db.configOptions.find((o) => o.id === id);
    if (!opt) throw new Error('Option not found');
    opt.label = label.trim();
    if (status) opt.status = status;
    this.logAction('UPDATE_OPTION', 'ConfigOption', id, `Opsi checklist diubah: ${label}`);
    this.persist();
    return opt;
  }

  public deleteConfigOption(id: string) {
    const opt = this.db.configOptions.find((o) => o.id === id);
    this.db.configOptions = this.db.configOptions.filter((o) => o.id !== id);
    this.logAction('DELETE_OPTION', 'ConfigOption', id, `Opsi checklist dihapus: ${opt?.label || id}`);
    this.persist();
  }

  public toggleConfigOptionStatus(id: string): ConfigOption {
    const opt = this.db.configOptions.find((o) => o.id === id);
    if (!opt) throw new Error('Option not found');
    opt.status = opt.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_OPTION', 'ConfigOption', id, `Status opsi checklist diubah: ${opt.label} (${opt.status})`);
    this.persist();
    return opt;
  }

  // --- DYNAMIC PERMISSIONS DEFINITIONS (CUSTOM CHECKLIST FOR ROLES) ---
  public getPermissionDefs(): PermissionDefinition[] {
    if (!this.db.permissionDefs || this.db.permissionDefs.length === 0) {
      this.db.permissionDefs = [...DEFAULT_PERMISSION_DEFS];
    }
    return this.db.permissionDefs;
  }

  public addPermissionDef(title: string, desc: string, key?: string): PermissionDefinition {
    const safeKey = (key || `perm_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`) as string;
    const newDef: PermissionDefinition = {
      id: `perm-${Date.now()}`,
      key: safeKey,
      title: title.trim(),
      desc: desc.trim(),
      isCustom: true,
    };
    if (!this.db.permissionDefs) {
      this.db.permissionDefs = [...DEFAULT_PERMISSION_DEFS];
    }
    this.db.permissionDefs.push(newDef);
    this.logAction('CREATE_PERMISSION_DEF', 'PermissionDefinition', newDef.id, `Izin hak akses kustom dibuat: ${title}`);
    this.persist();
    return newDef;
  }

  public updatePermissionDef(id: string, updates: Partial<PermissionDefinition>): PermissionDefinition {
    if (!this.db.permissionDefs) this.db.permissionDefs = [...DEFAULT_PERMISSION_DEFS];
    const idx = this.db.permissionDefs.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Definisi izin tidak ditemukan');
    this.db.permissionDefs[idx] = { ...this.db.permissionDefs[idx], ...updates };
    this.logAction('UPDATE_PERMISSION_DEF', 'PermissionDefinition', id, `Definisi izin diperbarui: ${this.db.permissionDefs[idx].title}`);
    this.persist();
    return this.db.permissionDefs[idx];
  }

  public deletePermissionDef(idOrKey: string) {
    if (!this.db.permissionDefs) return;
    const target = this.db.permissionDefs.find((p) => p.id === idOrKey || p.key === idOrKey);
    this.db.permissionDefs = this.db.permissionDefs.filter((p) => p.id !== idOrKey && p.key !== idOrKey);
    if (target) {
      this.db.users.forEach((u) => {
        if (u.permissions && u.permissions[target.key] !== undefined) {
          delete u.permissions[target.key];
        }
      });
    }
    this.logAction('DELETE_PERMISSION_DEF', 'PermissionDefinition', idOrKey, `Izin kustom dihapus: ${target?.title || idOrKey}`);
    this.persist();
  }

  // --- POSITION COMPETENCY REQUIREMENTS (MATRIKS) ---
  public getMatrix(positionId?: string): PositionCompetencyRequirement[] {
    if (positionId) {
      return this.db.matrix.filter((m) => m.position_id === positionId);
    }
    return this.db.matrix;
  }

  public savePositionMatrix(
    positionId: string,
    requirements: Array<{
      competency_id: string;
      required_level_id: string;
      wajib: boolean;
      pemenuhan_checklist: string[];
      tindakan_gap: string[];
    }>
  ) {
    const pos = this.db.positions.find((p) => p.id === positionId);
    const positionName = pos ? pos.nama_jabatan : positionId;

    const remaining = this.db.matrix.filter((m) => m.position_id !== positionId);

    const now = new Date().toISOString();
    const newItems: PositionCompetencyRequirement[] = requirements.map((req) => ({
      id: `req-${positionId}-${req.competency_id}`,
      position_id: positionId,
      competency_id: req.competency_id,
      required_level_id: req.required_level_id,
      wajib: req.wajib,
      pemenuhan_checklist: req.pemenuhan_checklist,
      tindakan_gap: req.tindakan_gap,
      updated_at: now,
    }));

    this.db.matrix = [...remaining, ...newItems];
    this.logAction(
      'SAVE_MATRIX',
      'PositionCompetencyRequirement',
      positionId,
      `Matriks kompetensi untuk jabatan "${positionName}" berhasil disimpan (${newItems.length} kompetensi dikonfigurasi).`
    );
    this.persist();
  }

  public deletePositionMatrix(positionId: string) {
    const pos = this.db.positions.find((p) => p.id === positionId);
    const positionName = pos ? pos.nama_jabatan : positionId;
    const count = this.db.matrix.filter((m) => m.position_id === positionId).length;
    this.db.matrix = this.db.matrix.filter((m) => m.position_id !== positionId);
    this.logAction(
      'DELETE_POSITION_MATRIX',
      'PositionCompetencyRequirement',
      positionId,
      `Seluruh matriks kompetensi jabatan "${positionName}" dihapus (${count} kompetensi dibersihkan).`
    );
    this.persist();
  }

  public deleteMatrixRequirement(positionId: string, competencyId: string) {
    const pos = this.db.positions.find((p) => p.id === positionId);
    const comp = this.db.competencies.find((c) => c.id === competencyId);
    this.db.matrix = this.db.matrix.filter(
      (m) => !(m.position_id === positionId && m.competency_id === competencyId)
    );
    this.logAction(
      'DELETE_MATRIX_ITEM',
      'PositionCompetencyRequirement',
      `${positionId}-${competencyId}`,
      `Kompetensi "${comp?.nama || competencyId}" dihapus dari matriks jabatan "${pos?.nama_jabatan || positionId}".`
    );
    this.persist();
  }

  // --- EMPLOYEES ---
  public getEmployees(includeInactive = false): Employee[] {
    return includeInactive ? this.db.employees : this.db.employees.filter((e) => e.status === 'active');
  }

  public addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
    };
    this.db.employees.push(newEmp);
    this.logAction('CREATE_EMPLOYEE', 'Employee', newEmp.id, `Karyawan baru: ${newEmp.nama} (${newEmp.employee_code})`);
    this.persist();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee {
    const idx = this.db.employees.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    this.db.employees[idx] = { ...this.db.employees[idx], ...updates };
    this.logAction('UPDATE_EMPLOYEE', 'Employee', id, `Data karyawan diperbarui: ${this.db.employees[idx].nama}`);
    this.persist();
    return this.db.employees[idx];
  }

  public deleteEmployee(id: string) {
    const emp = this.db.employees.find((e) => e.id === id);
    this.db.employees = this.db.employees.filter((e) => e.id !== id);
    // Remove their assignments, attempts, dev actions, assessments
    this.db.assignments = this.db.assignments.filter((a) => a.employee_id !== id);
    this.db.attempts = this.db.attempts.filter((a) => a.employee_id !== id);
    this.db.devActions = this.db.devActions.filter((d) => d.employee_id !== id);
    this.db.assessments = this.db.assessments.filter((a) => a.employee_id !== id);
    this.logAction('DELETE_EMPLOYEE', 'Employee', id, `Karyawan dihapus: ${emp?.nama || id}`);
    this.persist();
  }

  public toggleEmployeeStatus(id: string): Employee {
    const emp = this.db.employees.find((e) => e.id === id);
    if (!emp) throw new Error('Employee not found');
    emp.status = emp.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_EMPLOYEE', 'Employee', id, `Status karyawan diubah: ${emp.nama} (${emp.status})`);
    this.persist();
    return emp;
  }

  // --- TRAININGS ---
  public getTrainings(includeInactive = false): Training[] {
    return includeInactive ? this.db.trainings : this.db.trainings.filter((t) => t.status === 'active');
  }

  public addTraining(trn: Omit<Training, 'id' | 'created_at'>): Training {
    const newTrn: Training = {
      ...trn,
      id: `trn-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.db.trainings.push(newTrn);
    this.logAction('CREATE_TRAINING', 'Training', newTrn.id, `Program training baru: ${newTrn.judul}`);
    this.persist();
    return newTrn;
  }

  public updateTraining(id: string, updates: Partial<Training>): Training {
    const idx = this.db.trainings.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Training not found');
    this.db.trainings[idx] = { ...this.db.trainings[idx], ...updates };
    this.logAction('UPDATE_TRAINING', 'Training', id, `Program training diperbarui: ${this.db.trainings[idx].judul}`);
    this.persist();
    return this.db.trainings[idx];
  }

  public deleteTraining(id: string) {
    const trn = this.db.trainings.find((t) => t.id === id);
    this.db.trainings = this.db.trainings.filter((t) => t.id !== id);
    this.db.materials = this.db.materials.filter((m) => m.training_id !== id);
    this.db.questions = this.db.questions.filter((q) => q.training_id !== id);
    this.db.assignments = this.db.assignments.filter((a) => a.training_id !== id);
    this.db.attempts = this.db.attempts.filter((a) => a.training_id !== id);
    this.logAction('DELETE_TRAINING', 'Training', id, `Program training dihapus: ${trn?.judul || id}`);
    this.persist();
  }

  public toggleTrainingStatus(id: string): Training {
    const trn = this.db.trainings.find((t) => t.id === id);
    if (!trn) throw new Error('Training not found');
    trn.status = trn.status === 'active' ? 'inactive' : 'active';
    this.logAction('TOGGLE_TRAINING', 'Training', id, `Status training diubah: ${trn.judul} (${trn.status})`);
    this.persist();
    return trn;
  }

  // --- MATERIALS ---
  public getMaterials(trainingId?: string): LearningMaterial[] {
    const list = trainingId ? this.db.materials.filter((m) => m.training_id === trainingId) : this.db.materials;
    return [...list].sort((a, b) => a.urutan - b.urutan);
  }

  public addMaterial(mat: Omit<LearningMaterial, 'id'>): LearningMaterial {
    const newMat: LearningMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
    };
    this.db.materials.push(newMat);
    this.logAction('ADD_MATERIAL', 'LearningMaterial', newMat.id, `Materi ditambahkan: ${newMat.judul}`);
    this.persist();
    return newMat;
  }

  public deleteMaterial(id: string) {
    const mat = this.db.materials.find((m) => m.id === id);
    this.db.materials = this.db.materials.filter((m) => m.id !== id);
    this.logAction('DELETE_MATERIAL', 'LearningMaterial', id, `Materi dihapus: ${mat?.judul || id}`);
    this.persist();
  }

  public updateMaterial(id: string, updates: Partial<LearningMaterial>): LearningMaterial {
    const idx = this.db.materials.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Material not found');
    this.db.materials[idx] = { ...this.db.materials[idx], ...updates };
    this.logAction('UPDATE_MATERIAL', 'LearningMaterial', id, `Materi diperbarui: ${this.db.materials[idx].judul}`);
    this.persist();
    return this.db.materials[idx];
  }

  // --- QUESTIONS ---
  public getQuestions(trainingId?: string): Question[] {
    return trainingId ? this.db.questions.filter((q) => q.training_id === trainingId) : this.db.questions;
  }

  public addQuestion(q: Omit<Question, 'id'>): Question {
    const newQ: Question = {
      ...q,
      id: `q-${Date.now()}`,
    };
    this.db.questions.push(newQ);
    this.logAction('ADD_QUESTION', 'Question', newQ.id, `Soal assessment ditambahkan: ${newQ.pertanyaan.substring(0, 40)}...`);
    this.persist();
    return newQ;
  }

  public updateQuestion(id: string, updates: Partial<Question>): Question {
    const idx = this.db.questions.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Question not found');
    this.db.questions[idx] = { ...this.db.questions[idx], ...updates };
    this.logAction('UPDATE_QUESTION', 'Question', id, 'Soal assessment diperbarui');
    this.persist();
    return this.db.questions[idx];
  }

  public deleteQuestion(id: string) {
    this.db.questions = this.db.questions.filter((q) => q.id !== id);
    this.logAction('DELETE_QUESTION', 'Question', id, 'Soal assessment dihapus');
    this.persist();
  }

  // --- ASSIGNMENTS ---
  public getAssignments(employeeId?: string): TrainingAssignment[] {
    return employeeId ? this.db.assignments.filter((a) => a.employee_id === employeeId) : this.db.assignments;
  }

  public assignTraining(trainingId: string, employeeIds: string[], dueDate: string) {
    let count = 0;
    employeeIds.forEach((empId) => {
      const existing = this.db.assignments.find((a) => a.training_id === trainingId && a.employee_id === empId);
      if (!existing) {
        this.db.assignments.push({
          id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          training_id: trainingId,
          employee_id: empId,
          assigned_by: this.currentUser.id,
          assigned_at: new Date().toISOString(),
          due_date: dueDate,
          status: 'not_started',
          progress_percent: 0,
        });
        count++;
      }
    });
    this.logAction('ASSIGN_TRAINING', 'TrainingAssignment', trainingId, `${count} karyawan ditugaskan ke program training.`);
    this.persist();
  }

  public updateAssignmentProgress(trainingId: string, employeeId: string, progress: number, status?: TrainingAssignment['status']) {
    const asg = this.db.assignments.find((a) => a.training_id === trainingId && a.employee_id === employeeId);
    if (asg) {
      asg.progress_percent = Math.min(100, Math.max(0, progress));
      if (status) {
        asg.status = status;
      } else if (asg.progress_percent >= 100) {
        asg.status = 'completed';
      } else if (asg.progress_percent > 0) {
        asg.status = 'in_progress';
      }
      this.persist();
    }
  }

  // --- ASSESSMENT ATTEMPTS ---
  public getAttempts(trainingId?: string, employeeId?: string): AssessmentAttempt[] {
    let list = this.db.attempts;
    if (trainingId) list = list.filter((a) => a.training_id === trainingId);
    if (employeeId) list = list.filter((a) => a.employee_id === employeeId);
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordAttempt(attempt: Omit<AssessmentAttempt, 'id' | 'timestamp'>): AssessmentAttempt {
    const newAtt: AssessmentAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.db.attempts.push(newAtt);

    if (attempt.test_type === 'post_test') {
      const asg = this.db.assignments.find((a) => a.training_id === attempt.training_id && a.employee_id === attempt.employee_id);
      if (asg) {
        if (attempt.pass_status === 'passed') {
          asg.status = 'completed';
          asg.progress_percent = 100;
        } else {
          asg.status = 'remedial';
        }
      }
    }

    this.logAction(
      'ATTEMPT_TEST',
      'AssessmentAttempt',
      newAtt.id,
      `Tes ${attempt.test_type} diselesaikan dengan skor ${attempt.score}% (${attempt.pass_status})`
    );
    this.persist();
    return newAtt;
  }

  // --- COMPETENCY ASSESSMENTS ---
  public getAssessments(employeeId?: string): CompetencyAssessment[] {
    return employeeId ? this.db.assessments.filter((a) => a.employee_id === employeeId) : this.db.assessments;
  }

  public recordAssessment(
    employeeId: string,
    competencyId: string,
    actualLevelId: string,
    evidence: string,
    evidenceMethod?: string
  ): CompetencyAssessment {
    const existingIdx = this.db.assessments.findIndex(
      (a) => a.employee_id === employeeId && a.competency_id === competencyId
    );

    const now = new Date().toISOString();
    let saved: CompetencyAssessment;

    if (existingIdx !== -1) {
      this.db.assessments[existingIdx] = {
        ...this.db.assessments[existingIdx],
        actual_level_id: actualLevelId,
        assessor_id: this.currentUser.id,
        evidence,
        evidence_method: evidenceMethod || this.db.assessments[existingIdx].evidence_method,
        assessed_at: now,
      };
      saved = this.db.assessments[existingIdx];
    } else {
      saved = {
        id: `ca-${Date.now()}`,
        employee_id: employeeId,
        competency_id: competencyId,
        actual_level_id: actualLevelId,
        assessor_id: this.currentUser.id,
        evidence,
        evidence_method: evidenceMethod,
        assessed_at: now,
      };
      this.db.assessments.push(saved);
    }

    this.logAction(
      'RECORD_ASSESSMENT',
      'CompetencyAssessment',
      saved.id,
      `Penilaian kompetensi aktual dicatat untuk karyawan ${employeeId}`
    );
    this.persist();
    return saved;
  }

  public deleteAssessment(id: string) {
    const item = this.db.assessments.find((a) => a.id === id);
    this.db.assessments = this.db.assessments.filter((a) => a.id !== id);
    this.logAction('DELETE_ASSESSMENT', 'CompetencyAssessment', id, 'Penilaian kompetensi aktual dihapus');
    this.persist();
  }

  // --- DEVELOPMENT ACTIONS ---
  public getDevActions(employeeId?: string): DevelopmentAction[] {
    return employeeId ? this.db.devActions.filter((d) => d.employee_id === employeeId) : this.db.devActions;
  }

  public addDevAction(action: Omit<DevelopmentAction, 'id' | 'created_at'>): DevelopmentAction {
    const newAct: DevelopmentAction = {
      ...action,
      id: `da-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.db.devActions.push(newAct);
    this.logAction('CREATE_DEV_ACTION', 'DevelopmentAction', newAct.id, `Tindakan pengembangan baru: ${newAct.action_type}`);
    this.persist();
    return newAct;
  }

  public updateDevAction(id: string, updates: Partial<DevelopmentAction>): DevelopmentAction {
    const idx = this.db.devActions.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Development action not found');
    this.db.devActions[idx] = { ...this.db.devActions[idx], ...updates };
    this.logAction('UPDATE_DEV_ACTION', 'DevelopmentAction', id, `Tindakan pengembangan diperbarui`);
    this.persist();
    return this.db.devActions[idx];
  }

  public deleteDevAction(id: string) {
    const act = this.db.devActions.find((d) => d.id === id);
    this.db.devActions = this.db.devActions.filter((d) => d.id !== id);
    this.logAction('DELETE_DEV_ACTION', 'DevelopmentAction', id, `Action plan dihapus: ${act?.action_type || id}`);
    this.persist();
  }

  // --- TRAINING SCHEDULES (KALENDER TRAINING) ---
  public getSchedules(): TrainingSchedule[] {
    if (!this.db.schedules) this.db.schedules = [...INITIAL_SCHEDULES];
    return [...this.db.schedules].sort((a, b) => {
      const dateA = new Date(`${a.start_date}T${a.start_time || '00:00'}`).getTime();
      const dateB = new Date(`${b.start_date}T${b.start_time || '00:00'}`).getTime();
      return dateA - dateB;
    });
  }

  public getScheduleById(id: string): TrainingSchedule | undefined {
    return this.getSchedules().find((s) => s.id === id);
  }

  public saveSchedule(
    scheduleData: Partial<TrainingSchedule> & { id?: string },
    options: { notifyEmail?: boolean; isAdjustment?: boolean } = { notifyEmail: true }
  ): TrainingSchedule {
    if (!this.db.schedules) this.db.schedules = [...INITIAL_SCHEDULES];
    const now = new Date().toISOString();
    let savedSchedule: TrainingSchedule;
    let isEdit = false;
    let previousSchedule: TrainingSchedule | undefined;

    if (scheduleData.id) {
      const idx = this.db.schedules.findIndex((s) => s.id === scheduleData.id);
      if (idx !== -1) {
        isEdit = true;
        previousSchedule = { ...this.db.schedules[idx] };
        this.db.schedules[idx] = {
          ...this.db.schedules[idx],
          ...scheduleData,
          updated_at: now,
        };
        savedSchedule = this.db.schedules[idx];
      } else {
        savedSchedule = {
          id: scheduleData.id,
          title: scheduleData.title || 'Jadwal Training Baru',
          department_ids: scheduleData.department_ids || ['all'],
          trainer_name: scheduleData.trainer_name || 'Instruktur Internal',
          start_date: scheduleData.start_date || new Date().toISOString().slice(0, 10),
          end_date: scheduleData.end_date || scheduleData.start_date || new Date().toISOString().slice(0, 10),
          start_time: scheduleData.start_time || '08:30',
          end_time: scheduleData.end_time || '16:00',
          location_type: scheduleData.location_type || 'offline',
          max_participants: scheduleData.max_participants || 30,
          enrolled_employee_ids: scheduleData.enrolled_employee_ids || [],
          status: scheduleData.status || 'scheduled',
          created_at: now,
          ...scheduleData,
        };
        this.db.schedules.push(savedSchedule);
      }
    } else {
      savedSchedule = {
        id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: scheduleData.title || 'Jadwal Training Baru',
        department_ids: scheduleData.department_ids || ['all'],
        trainer_name: scheduleData.trainer_name || 'Instruktur Internal',
        start_date: scheduleData.start_date || new Date().toISOString().slice(0, 10),
        end_date: scheduleData.end_date || scheduleData.start_date || new Date().toISOString().slice(0, 10),
        start_time: scheduleData.start_time || '08:30',
        end_time: scheduleData.end_time || '16:00',
        location_type: scheduleData.location_type || 'offline',
        max_participants: scheduleData.max_participants || 30,
        enrolled_employee_ids: scheduleData.enrolled_employee_ids || [],
        status: scheduleData.status || 'scheduled',
        created_at: now,
        ...scheduleData,
      };
      this.db.schedules.push(savedSchedule);
    }

    // Determine if schedule was adjusted (rescheduled)
    const isScheduleAdjusted =
      isEdit &&
      previousSchedule &&
      (previousSchedule.start_date !== savedSchedule.start_date ||
        previousSchedule.end_date !== savedSchedule.end_date ||
        previousSchedule.start_time !== savedSchedule.start_time ||
        previousSchedule.end_time !== savedSchedule.end_time ||
        previousSchedule.room_location !== savedSchedule.room_location ||
        previousSchedule.meeting_url !== savedSchedule.meeting_url ||
        previousSchedule.trainer_name !== savedSchedule.trainer_name ||
        options.isAdjustment);

    this.logAction(
      isScheduleAdjusted ? 'ADJUST_TRAINING_SCHEDULE' : isEdit ? 'UPDATE_TRAINING_SCHEDULE' : 'CREATE_TRAINING_SCHEDULE',
      'TrainingSchedule',
      savedSchedule.id,
      `Jadwal training "${savedSchedule.title}" ${isScheduleAdjusted ? 'disesuaikan/di-reschedule' : isEdit ? 'diperbarui' : 'dibuat'} untuk tanggal ${savedSchedule.start_date}`
    );

    // Send notifications if requested
    if (options.notifyEmail !== false) {
      if (isScheduleAdjusted) {
        this.dispatchScheduleAdjustmentNotifications(savedSchedule, previousSchedule);
      } else if (!isEdit) {
        this.dispatchScheduleInviteNotifications(savedSchedule);
      }
    }

    this.persist();
    return savedSchedule;
  }

  public deleteSchedule(id: string) {
    if (!this.db.schedules) return;
    const schedule = this.db.schedules.find((s) => s.id === id);
    this.db.schedules = this.db.schedules.filter((s) => s.id !== id);
    this.logAction(
      'DELETE_TRAINING_SCHEDULE',
      'TrainingSchedule',
      id,
      `Jadwal training "${schedule?.title || id}" dihapus dari kalender.`
    );
    this.persist();
  }

  // Dispatch invitation for newly created training schedule
  private dispatchScheduleInviteNotifications(schedule: TrainingSchedule) {
    const deptNames = this.getDepartmentNamesList(schedule.department_ids);
    const dateFormatted = this.formatDateIndo(schedule.start_date);
    const timeFormatted = `${schedule.start_time} - ${schedule.end_time} WIB`;
    const venue =
      schedule.location_type === 'online'
        ? `Online via Google Meet / Zoom (${schedule.meeting_url || 'Link akan dibagikan'})`
        : schedule.location_type === 'hybrid'
        ? `Hybrid: ${schedule.room_location || 'Ruang Serbaguna'} & ${schedule.meeting_url || 'Online Link'}`
        : `Tatap Muka di ${schedule.room_location || 'Ruang Training Utama'}`;

    // 1. Notify enrolled participants or all employees in targeted departments
    const participantEmails = this.getTargetParticipantEmails(schedule);
    participantEmails.forEach((target) => {
      this.sendEmailNotification({
        recipient_email: target.email,
        recipient_name: target.name,
        recipient_role: 'employee',
        type: 'training_schedule_invite',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Undangan Pelatihan] ${schedule.title} - ${dateFormatted}`,
        preview: `Anda telah dijadwalkan untuk mengikuti pelatihan ${schedule.title} pada ${dateFormatted} pukul ${timeFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase; letter-spacing: 1px;">LCMS Enterprise • Undangan Pelatihan Resmi</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Jadwal Pelatihan Baru Terdaftar</h2>
            </div>
            <p>Halo <strong>${target.name}</strong>,</p>
            <p>Anda telah didaftarkan sebagai <strong>Peserta Pelatihan</strong> pada program pembelajaran korporat:</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0d9488; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #0f172a;">${schedule.title}</p>
              ${schedule.custom_training_name ? `<p style="margin: 0 0 10px 0; font-size: 13px; color: #475569;"><em>Topik Kustom: ${schedule.custom_training_name}</em></p>` : ''}
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Hari & Tanggal:</td><td><strong>${dateFormatted}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Waktu:</td><td><strong>${timeFormatted}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Departemen:</td><td>${deptNames}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Lokasi / Sesi:</td><td>${venue}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Instruktur:</td><td>${schedule.trainer_name}</td></tr>
              </table>
            </div>
            ${schedule.notes ? `<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #854d0e;"><strong>Catatan / Prasyarat:</strong> ${schedule.notes}</div>` : ''}
            <p style="font-size: 13px; color: #475569;">Harap hadir tepat waktu. Pengingat (reminder) berkala akan dikirimkan kembali menjelang sesi dimulai.</p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
              Dikirim secara otomatis oleh Sistem LCMS Enterprise • Divisi Human Resources & L&D
            </div>
          </div>
        `,
      });
    });

    // 2. Notify assigned trainer
    const trainerEmail = schedule.trainer_email || this.db.users.find((u) => u.id === schedule.trainer_id)?.email;
    if (trainerEmail) {
      this.sendEmailNotification({
        recipient_email: trainerEmail,
        recipient_name: schedule.trainer_name,
        recipient_role: 'trainer',
        type: 'training_schedule_invite',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Penugasan Instruktur] Sesi Pelatihan: ${schedule.title} - ${dateFormatted}`,
        preview: `Konfirmasi penugasan Anda sebagai Trainer pada pelatihan ${schedule.title} (${dateFormatted}).`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px;">LCMS Enterprise • Penugasan Trainer</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Penugasan Sesi Training Baru</h2>
            </div>
            <p>Yth. <strong>${schedule.trainer_name}</strong>,</p>
            <p>Anda telah dijadwalkan sebagai <strong>Instruktur / Trainer Utama</strong> pada program:</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #0f172a;">${schedule.title}</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Hari & Tanggal:</td><td><strong>${dateFormatted}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Waktu Sesi:</td><td><strong>${timeFormatted}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Departemen:</td><td>${deptNames}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Lokasi:</td><td>${venue}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Kapasitas / Peserta:</td><td>${participantEmails.length} karyawan terdaftar</td></tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #475569;">Silakan cek ketersediaan modul silabus, materi presentasi, dan bank soal di portal LCMS sebelum pelaksanaan.</p>
          </div>
        `,
      });
    }

    // 3. Notify supervisors of the target departments
    const supervisors = this.getTargetSupervisors(schedule.department_ids);
    supervisors.forEach((sup) => {
      this.sendEmailNotification({
        recipient_email: sup.email,
        recipient_name: sup.name,
        recipient_role: 'supervisor',
        type: 'training_schedule_invite',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Pemberitahuan Supervisor] Pelatihan Anggota Tim: ${schedule.title}`,
        preview: `Pemberitahuan bahwa anggota tim departemen Anda dijadwalkan mengikuti pelatihan ${schedule.title} (${dateFormatted}).`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: 1px;">LCMS Enterprise • Pengawas & Assessor</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Pemberitahuan Jadwal Pelatihan Tim</h2>
            </div>
            <p>Halo <strong>${sup.name}</strong>,</p>
            <p>Berikut pemberitahuan bahwa anggota tim di bawah supervisi Anda dijadwalkan mengikuti sesi pelatihan:</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #059669; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #0f172a;">${schedule.title}</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Tanggal & Waktu:</td><td><strong>${dateFormatted}, ${timeFormatted}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Lokasi / Sesi:</td><td>${venue}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Instruktur:</td><td>${schedule.trainer_name}</td></tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #475569;">Mohon dapat menyesuaikan alokasi jam kerja / rotasi shift agar anggota tim dapat hadir penuh.</p>
          </div>
        `,
      });
    });
  }

  // Dispatch notifications when schedule is adjusted / rescheduled
  private dispatchScheduleAdjustmentNotifications(
    schedule: TrainingSchedule,
    previousSchedule?: TrainingSchedule
  ) {
    const deptNames = this.getDepartmentNamesList(schedule.department_ids);
    const dateFormatted = this.formatDateIndo(schedule.start_date);
    const timeFormatted = `${schedule.start_time} - ${schedule.end_time} WIB`;
    const venue =
      schedule.location_type === 'online'
        ? `Online via Google Meet / Zoom (${schedule.meeting_url || 'Link disediakan'})`
        : schedule.location_type === 'hybrid'
        ? `Hybrid: ${schedule.room_location || 'Ruang Serbaguna'} & ${schedule.meeting_url || 'Online Link'}`
        : `Tatap Muka di ${schedule.room_location || 'Ruang Training Utama'}`;

    const prevDateFormatted = previousSchedule ? this.formatDateIndo(previousSchedule.start_date) : '';
    const prevTime = previousSchedule ? `${previousSchedule.start_time} - ${previousSchedule.end_time} WIB` : '';

    const participantEmails = this.getTargetParticipantEmails(schedule);

    // 1. Notify Participants of Adjustment
    participantEmails.forEach((target) => {
      this.sendEmailNotification({
        recipient_email: target.email,
        recipient_name: target.name,
        recipient_role: 'employee',
        type: 'schedule_updated',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Penyesuaian Jadwal] Pelatihan: ${schedule.title} - Disesuaikan ke ${dateFormatted}`,
        preview: `PENTING: Jadwal pelatihan ${schedule.title} telah disesuaikan menjadi ${dateFormatted} pukul ${timeFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #e11d48; text-transform: uppercase; letter-spacing: 1px;">LCMS Enterprise • Pemberitahuan Penyesuaian Jadwal</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Perubahan Jadwal Pelatihan</h2>
            </div>
            <p>Halo <strong>${target.name}</strong>,</p>
            <p>Terdapat <strong>penyesuaian jadwal pelatihan (reschedule)</strong> untuk sesi yang Anda ikuti:</p>
            <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #881337;">${schedule.title}</p>
              ${previousSchedule ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #9f1239; text-decoration: line-through;">Jadwal Semula: ${prevDateFormatted}, ${prevTime}</p>` : ''}
              <div style="background-color: #ffffff; border: 1px solid #fda4af; border-radius: 6px; padding: 12px; margin-top: 8px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 13px; color: #0f172a;">Jadwal Baru yang Telah Disesuaikan:</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr><td style="padding: 3px 0; color: #64748b; width: 140px;">Hari & Tanggal:</td><td><strong style="color: #0f766e;">${dateFormatted}</strong></td></tr>
                  <tr><td style="padding: 3px 0; color: #64748b;">Waktu Sesi:</td><td><strong style="color: #0f766e;">${timeFormatted}</strong></td></tr>
                  <tr><td style="padding: 3px 0; color: #64748b;">Departemen:</td><td>${deptNames}</td></tr>
                  <tr><td style="padding: 3px 0; color: #64748b;">Lokasi / Tautan:</td><td><strong>${venue}</strong></td></tr>
                  <tr><td style="padding: 3px 0; color: #64748b;">Instruktur:</td><td>${schedule.trainer_name}</td></tr>
                </table>
              </div>
            </div>
            ${schedule.notes ? `<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 12px; color: #475569;"><strong>Catatan Tambahan:</strong> ${schedule.notes}</div>` : ''}
            <p style="font-size: 13px; color: #475569; margin-top: 14px;">Mohon perbarui kalender agenda kerja Anda sesuai dengan waktu yang telah disesuaikan.</p>
          </div>
        `,
      });
    });

    // 2. Notify Trainer of Adjustment
    const trainerEmail = schedule.trainer_email || this.db.users.find((u) => u.id === schedule.trainer_id)?.email;
    if (trainerEmail) {
      this.sendEmailNotification({
        recipient_email: trainerEmail,
        recipient_name: schedule.trainer_name,
        recipient_role: 'trainer',
        type: 'schedule_updated',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Penyesuaian Jadwal Instruktur] Pelatihan: ${schedule.title} - ${dateFormatted}`,
        preview: `Pemberitahuan perubahan waktu sesi pelatihan Anda sebagai instruktur pada ${dateFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #e11d48; text-transform: uppercase;">LCMS Enterprise • Penyesuaian Jadwal Instruktur</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Jadwal Pelatihan Anda Telah Disesuaikan</h2>
            </div>
            <p>Yth. <strong>${schedule.trainer_name}</strong>,</p>
            <p>Sesi pelatihan yang Anda ampu telah mengalami penyesuaian waktu pelaksanaan:</p>
            <p><strong>Topik:</strong> ${schedule.title}<br/>
            <strong>Waktu Baru:</strong> ${dateFormatted}, ${timeFormatted}<br/>
            <strong>Lokasi:</strong> ${venue}</p>
            <p>Notifikasi perubahan jadwal ini juga telah diteruskan secara otomatis ke seluruh peserta terdaftar dan supervisor terkait.</p>
          </div>
        `,
      });
    }

    // 3. Notify Supervisors
    const supervisors = this.getTargetSupervisors(schedule.department_ids);
    supervisors.forEach((sup) => {
      this.sendEmailNotification({
        recipient_email: sup.email,
        recipient_name: sup.name,
        recipient_role: 'supervisor',
        type: 'schedule_updated',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Pemberitahuan Supervisor] Penyesuaian Jadwal Pelatihan Tim: ${schedule.title}`,
        preview: `Jadwal pelatihan anggota tim departemen Anda telah disesuaikan menjadi ${dateFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #e11d48; text-transform: uppercase;">LCMS Enterprise • Notifikasi Supervisor</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Penyesuaian Jadwal Pelatihan Anggota Tim</h2>
            </div>
            <p>Halo <strong>${sup.name}</strong>,</p>
            <p>Mohon dicatat bahwa sesi pelatihan untuk anggota tim departemen Anda telah disesuaikan waktunya:</p>
            <p><strong>Pelatihan:</strong> ${schedule.title}<br/>
            <strong>Jadwal Baru:</strong> ${dateFormatted}, ${timeFormatted}<br/>
            <strong>Lokasi:</strong> ${venue}</p>
            <p>Harap menyesuaikan kembali jadwal dinas/shift operasional anggota tim.</p>
          </div>
        `,
      });
    });
  }

  // Send explicit reminder for a training schedule
  public sendScheduleReminder(scheduleId: string, customNote?: string): { sentCount: number } {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) throw new Error('Jadwal training tidak ditemukan.');

    const dateFormatted = this.formatDateIndo(schedule.start_date);
    const timeFormatted = `${schedule.start_time} - ${schedule.end_time} WIB`;
    const venue =
      schedule.location_type === 'online'
        ? `Online (${schedule.meeting_url || 'Link Meeting'})`
        : schedule.location_type === 'hybrid'
        ? `Hybrid (${schedule.room_location} / Online)`
        : `Tatap Muka di ${schedule.room_location || 'Ruang Training'}`;

    let sentCount = 0;
    const participantEmails = this.getTargetParticipantEmails(schedule);

    // 1. Send Reminder to Participants
    participantEmails.forEach((target) => {
      this.sendEmailNotification({
        recipient_email: target.email,
        recipient_name: target.name,
        recipient_role: 'employee',
        type: 'schedule_reminder',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Reminder Jadwal Pelatihan] Pengingat Sesi: ${schedule.title} - ${dateFormatted}`,
        preview: `PENGINGAT: Sesi pelatihan Anda "${schedule.title}" akan berlangsung pada ${dateFormatted} pukul ${timeFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase;">LCMS Enterprise • Pengingat Jadwal (Reminder)</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Pengingat Pelatihan Mendatang</h2>
            </div>
            <p>Halo <strong>${target.name}</strong>,</p>
            <p>Ini adalah pengingat ramah bahwa Anda dijadwalkan menghadiri sesi pelatihan:</p>
            <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-left: 4px solid #0d9488; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #115e59;">${schedule.title}</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 3px 0; color: #64748b; width: 140px;">Hari & Tanggal:</td><td><strong>${dateFormatted}</strong></td></tr>
                <tr><td style="padding: 3px 0; color: #64748b;">Waktu:</td><td><strong>${timeFormatted}</strong></td></tr>
                <tr><td style="padding: 3px 0; color: #64748b;">Lokasi / Sesi:</td><td>${venue}</td></tr>
                <tr><td style="padding: 3px 0; color: #64748b;">Instruktur:</td><td>${schedule.trainer_name}</td></tr>
              </table>
            </div>
            ${customNote ? `<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #854d0e;"><strong>Pesan Khusus Administrator / Trainer:</strong><br/>${customNote}</div>` : ''}
            <p style="font-size: 13px; color: #475569;">Mohon hadir 10-15 menit sebelum acara dimulai dan siapkan materi pendukung yang diperlukan.</p>
          </div>
        `,
      });
      sentCount++;
    });

    // 2. Send Reminder to Trainer
    const trainerEmail = schedule.trainer_email || this.db.users.find((u) => u.id === schedule.trainer_id)?.email;
    if (trainerEmail) {
      this.sendEmailNotification({
        recipient_email: trainerEmail,
        recipient_name: schedule.trainer_name,
        recipient_role: 'trainer',
        type: 'schedule_reminder',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Reminder Instruktur] Sesi Pelatihan Terjadwal: ${schedule.title} - ${dateFormatted}`,
        preview: `Pengingat sesi mengajar Anda pada ${dateFormatted} pukul ${timeFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 8px;">Pengingat Instruktur Pelatihan</h2>
            <p>Yth. <strong>${schedule.trainer_name}</strong>,</p>
            <p>Mengingatkan jadwal sesi mengajar pelatihan Anda:</p>
            <p><strong>Topik:</strong> ${schedule.title}<br/><strong>Waktu:</strong> ${dateFormatted}, ${timeFormatted}<br/><strong>Lokasi:</strong> ${venue}</p>
            ${customNote ? `<p style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 13px;"><strong>Catatan:</strong> ${customNote}</p>` : ''}
          </div>
        `,
      });
      sentCount++;
    }

    // 3. Send Reminder to Supervisors
    const supervisors = this.getTargetSupervisors(schedule.department_ids);
    supervisors.forEach((sup) => {
      this.sendEmailNotification({
        recipient_email: sup.email,
        recipient_name: sup.name,
        recipient_role: 'supervisor',
        type: 'schedule_reminder',
        related_schedule_id: schedule.id,
        related_training_id: schedule.training_id,
        subject: `[Reminder Supervisor] Pelatihan Anggota Tim: ${schedule.title}`,
        preview: `Pengingat bahwa anggota tim Anda memiliki sesi pelatihan pada ${dateFormatted}.`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #059669; margin-bottom: 8px;">Pengingat Supervisor Pelatihan</h2>
            <p>Halo <strong>${sup.name}</strong>,</p>
            <p>Mengingatkan bahwa anggota tim dari departemen Anda akan menghadiri sesi pelatihan <strong>${schedule.title}</strong> pada <strong>${dateFormatted}, ${timeFormatted}</strong>.</p>
          </div>
        `,
      });
      sentCount++;
    });

    // Update reminder metadata on schedule
    schedule.reminder_sent_count = (schedule.reminder_sent_count || 0) + 1;
    schedule.last_reminder_at = new Date().toISOString();

    this.logAction(
      'SEND_SCHEDULE_REMINDER',
      'TrainingSchedule',
      schedule.id,
      `Reminder jadwal training "${schedule.title}" berhasil dikirimkan ke ${sentCount} penerima email.`
    );
    this.persist();

    return { sentCount };
  }

  // --- WELCOME & NEW REGISTRATION EMAIL GENERATION ---
  private createRegistrationWelcomeNotification(newUser: User, departmentId?: string) {
    const roleLabels = {
      employee: 'Peserta Pelatihan / Karyawan',
      trainer: 'Instruktur / Trainer',
      supervisor: 'Supervisor / Assessor Tim',
      admin: 'Super Administrator',
    };

    const dept = departmentId
      ? this.db.departments.find((d) => d.id === departmentId)?.nama
      : 'Lintas Departemen Korporat';

    let subject = '';
    let preview = '';
    let roleDescription = '';

    if (newUser.role === 'employee') {
      subject = `[Selamat Datang] Pendaftaran Akun Peserta Pelatihan - ${newUser.name}`;
      preview = `Akun peserta Anda telah aktif di portal LCMS Enterprise. Kredensial dan petunjuk pembelajaran terlampir.`;
      roleDescription = `
        <p>Sebagai <strong>Peserta Pelatihan</strong>, Anda mendapatkan akses penuh ke:</p>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155;">
          <li>Modul pembelajaran digital & video silabus di menu <strong>My Learning</strong>.</li>
          <li>Ujian evaluasi kompetensi (Pre-Test & Post-Test).</li>
          <li>Kalender jadwal pelatihan dan penugasan langsung dari L&D / Supervisor.</li>
        </ul>
        <p style="font-size: 13px; color: #0d9488; font-weight: bold;">
          Setiap pendaftaran sesi baru atau penyesuaian jadwal pelatihan akan dikirimkan otomatis ke email Anda ini.
        </p>
      `;
    } else if (newUser.role === 'trainer') {
      subject = `[Selamat Datang] Aktivasi Akun Instruktur Pelatihan - ${newUser.name}`;
      preview = `Akun Trainer Anda telah aktif. Anda dapat mengelola materi silabus, bank soal, dan jadwal pelatihan.`;
      roleDescription = `
        <p>Sebagai <strong>Instruktur / Trainer</strong>, Anda memiliki wewenang untuk:</p>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155;">
          <li>Membuat dan mengedit kurikulum, materi silabus, dan video Google Drive.</li>
          <li>Menyusun bank soal pre-test & post-test serta menentukan batas kelulusan.</li>
          <li>Menjadwalkan sesi training baru di <strong>Kalender Training</strong> untuk departemen mana pun.</li>
          <li>Mengirimkan pengingat (reminder) jadwal kepada seluruh peserta dan supervisor terkait.</li>
        </ul>
      `;
    } else if (newUser.role === 'supervisor') {
      subject = `[Selamat Datang] Aktivasi Akun Supervisor & Assessor - ${newUser.name}`;
      preview = `Akun Supervisor Anda telah aktif. Anda dapat menilai kompetensi tim dan memonitor jadwal pelatihan.`;
      roleDescription = `
        <p>Sebagai <strong>Supervisor / Assessor Tim</strong>, Anda memiliki wewenang untuk:</p>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155;">
          <li>Melakukan penilaian kompetensi aktual (Actual Assessment) anggota tim di lapangan.</li>
          <li>Meninjau analisis gap keahlian dan merancang rencana aksi pengembangan (Action Plan).</li>
          <li>Menerima notifikasi otomatis setiap ada anggota tim Anda yang dijadwalkan mengikuti training.</li>
        </ul>
      `;
    } else {
      subject = `[Selamat Datang] Akses Super Administrator Diaktifkan - ${newUser.name}`;
      preview = `Akun Super Administrator Anda telah aktif dengan kendali penuh sistem LCMS.`;
      roleDescription = `
        <p>Sebagai <strong>Super Administrator</strong>, Anda memiliki kendali penuh atas struktur organisasi, master kompetensi, konfigurasi matriks jabatan, kalender training, dan pengawasan peserta.</p>
      `;
    }

    this.sendEmailNotification({
      recipient_email: newUser.email,
      recipient_name: newUser.name,
      recipient_role: newUser.role,
      type: 'welcome_registration',
      subject,
      preview,
      body_html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase; letter-spacing: 1px;">LCMS Enterprise • Registrasi Akun Baru</span>
            <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">Selamat Datang di LCMS Enterprise!</h2>
          </div>
          <p>Halo <strong>${newUser.name}</strong>,</p>
          <p>Akun Anda telah berhasil didaftarkan ke dalam platform <strong>Learning & Competency Management System (LCMS)</strong> perusahaan.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #0f172a;">Kredensial Akun Anda:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 4px 0; color: #64748b; width: 130px;">Nama Lengkap:</td><td><strong>${newUser.name}</strong></td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Alamat Email:</td><td><strong>${newUser.email}</strong></td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Peran Sistem:</td><td><strong style="color: #0d9488;">${roleLabels[newUser.role]}</strong></td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Departemen:</td><td>${dept}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Kata Sandi:</td><td><code>${newUser.password || 'password123'}</code></td></tr>
            </table>
          </div>

          ${roleDescription}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
            LCMS Enterprise Platform • PT Korporat Industri Indonesia • Dikirim otomatis oleh sistem
          </div>
        </div>
      `,
    });
  }

  // When a new user registers, also check if there are scheduled trainings for their department
  private sendRelevantScheduleNotificationsForUser(newUser: User, departmentId?: string) {
    if (!this.db.schedules || this.db.schedules.length === 0) return;

    const relevantSchedules = this.db.schedules.filter((sch) => {
      if (sch.status === 'completed' || sch.status === 'cancelled') return false;
      if (newUser.role === 'employee') {
        const matchesDept = sch.department_ids.includes('all') || (departmentId && sch.department_ids.includes(departmentId));
        return matchesDept || (newUser.employee_id && sch.enrolled_employee_ids.includes(newUser.employee_id));
      }
      if (newUser.role === 'trainer') {
        return sch.trainer_id === newUser.id || sch.trainer_email === newUser.email;
      }
      if (newUser.role === 'supervisor') {
        return sch.department_ids.includes('all') || (departmentId && sch.department_ids.includes(departmentId));
      }
      return false;
    });

    relevantSchedules.forEach((sch) => {
      const dateFormatted = this.formatDateIndo(sch.start_date);
      const timeFormatted = `${sch.start_time} - ${sch.end_time} WIB`;
      this.sendEmailNotification({
        recipient_email: newUser.email,
        recipient_name: newUser.name,
        recipient_role: newUser.role,
        type: 'schedule_reminder',
        related_schedule_id: sch.id,
        related_training_id: sch.training_id,
        subject: `[Jadwal Pelatihan Aktif] ${sch.title} - ${dateFormatted}`,
        preview: `Pemberitahuan sesi pelatihan terjadwal di departemen Anda: ${sch.title} (${dateFormatted}).`,
        body_html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase;">LCMS Enterprise • Jadwal Terkait</span>
              <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 18px;">Pemberitahuan Pelatihan Departemen Anda</h2>
            </div>
            <p>Halo <strong>${newUser.name}</strong>,</p>
            <p>Berikut adalah jadwal pelatihan yang telah dialokasikan untuk Anda / departemen Anda:</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 14px 0;">
              <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 15px; color: #0f172a;">${sch.title}</p>
              <p style="margin: 0; font-size: 13px; color: #475569;">
                <strong>Jadwal:</strong> ${dateFormatted}, ${timeFormatted}<br/>
                <strong>Instruktur:</strong> ${sch.trainer_name}<br/>
                <strong>Lokasi:</strong> ${sch.location_type === 'online' ? sch.meeting_url || 'Online Link' : sch.room_location || 'Ruang Training'}
              </p>
            </div>
          </div>
        `,
      });
    });
  }

  // Helper: Get list of participant emails for a schedule
  private getTargetParticipantEmails(schedule: TrainingSchedule): { name: string; email: string }[] {
    const targets: { name: string; email: string }[] = [];
    const seenEmails = new Set<string>();

    // 1. Explicitly enrolled employees
    if (schedule.enrolled_employee_ids && schedule.enrolled_employee_ids.length > 0) {
      schedule.enrolled_employee_ids.forEach((empId) => {
        const emp = this.db.employees.find((e) => e.id === empId);
        if (emp && emp.email && !seenEmails.has(emp.email.toLowerCase())) {
          seenEmails.add(emp.email.toLowerCase());
          targets.push({ name: emp.nama, email: emp.email });
        }
      });
    }

    // 2. If target department is specified, include all employees in that department
    if (targets.length === 0) {
      const isAllDepts = schedule.department_ids.includes('all');
      this.db.employees.forEach((emp) => {
        if (isAllDepts || schedule.department_ids.includes(emp.department_id)) {
          if (emp.email && !seenEmails.has(emp.email.toLowerCase())) {
            seenEmails.add(emp.email.toLowerCase());
            targets.push({ name: emp.nama, email: emp.email });
          }
        }
      });
    }

    // Default fallback so notifications can always be seen
    if (targets.length === 0) {
      this.db.users
        .filter((u) => u.role === 'employee')
        .forEach((u) => {
          if (!seenEmails.has(u.email.toLowerCase())) {
            seenEmails.add(u.email.toLowerCase());
            targets.push({ name: u.name, email: u.email });
          }
        });
    }

    return targets;
  }

  // Helper: Get list of supervisors for given department IDs
  private getTargetSupervisors(departmentIds: string[]): { name: string; email: string }[] {
    const isAll = departmentIds.includes('all');
    return this.db.users
      .filter((u) => u.role === 'supervisor')
      .map((u) => ({ name: u.name, email: u.email }));
  }

  // Helper: Department names as string
  private getDepartmentNamesList(deptIds: string[]): string {
    if (!deptIds || deptIds.length === 0 || deptIds.includes('all')) {
      return 'Semua Departemen Korporat';
    }
    return deptIds
      .map((id) => this.db.departments.find((d) => d.id === id)?.nama || id)
      .join(', ');
  }

  // Helper: Indonesian date format
  private formatDateIndo(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  // --- EMAIL NOTIFICATIONS SYSTEM ---
  public getNotifications(filterEmail?: string): EmailNotification[] {
    if (!this.db.notifications) this.db.notifications = [...INITIAL_NOTIFICATIONS];
    let list = this.db.notifications;
    if (filterEmail) {
      const emailLower = filterEmail.toLowerCase().trim();
      list = list.filter((n) => n.recipient_email.toLowerCase() === emailLower);
    }
    return [...list].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  public getUnreadNotificationCount(filterEmail?: string): number {
    return this.getNotifications(filterEmail).filter((n) => !n.is_read).length;
  }

  public markNotificationRead(id: string) {
    if (!this.db.notifications) return;
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(filterEmail?: string) {
    if (!this.db.notifications) return;
    this.db.notifications.forEach((n) => {
      if (!filterEmail || n.recipient_email.toLowerCase() === filterEmail.toLowerCase()) {
        n.is_read = true;
      }
    });
    this.persist();
  }

  public deleteNotification(id: string) {
    if (!this.db.notifications) return;
    this.db.notifications = this.db.notifications.filter((n) => n.id !== id);
    this.persist();
  }

  public clearNotifications() {
    this.db.notifications = [];
    this.persist();
  }

  public sendEmailNotification(
    params: Omit<EmailNotification, 'id' | 'sent_at' | 'is_read' | 'status'>
  ): EmailNotification {
    if (!this.db.notifications) this.db.notifications = [];
    const newNotif: EmailNotification = {
      ...params,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sent_at: new Date().toISOString(),
      is_read: false,
      status: 'delivered',
    };
    this.db.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }
}

export const store = new LCMSStore();

