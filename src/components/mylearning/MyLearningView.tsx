import React, { useState } from 'react';
import { store } from '../../lib/storage';
import {
  Training,
  LearningMaterial,
  Question,
  AssessmentAttempt,
  TrainingAssignment,
} from '../../types/lcms';
import {
  GraduationCap,
  Play,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const MyLearningView: React.FC = () => {
  const toast = useToast();
  const currentUser = store.getCurrentUser();
  const employees = store.getEmployees();

  // If currentUser is an employee, find their employee record; otherwise default to first employee
  const currentEmployee =
    employees.find((e) => e.email === currentUser.email || e.id === currentUser.employee_id) ||
    employees[0];

  const assignments = store.getAssignments(currentEmployee?.id);
  const allTrainings = store.getTrainings();

  // Active training selected for learning
  const [activeAssignment, setActiveAssignment] = useState<TrainingAssignment | null>(
    assignments[0] || null
  );

  // Active material inside selected training
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);

  // Video progress simulator
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizType, setQuizType] = useState<'pre_test' | 'post_test'>('pre_test');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passStatus: 'passed' | 'failed';
    passingGrade: number;
  } | null>(null);

  // Current active training object
  const activeTraining = activeAssignment
    ? allTrainings.find((t) => t.id === activeAssignment.training_id)
    : null;

  const materials = activeTraining ? store.getMaterials(activeTraining.id) : [];
  const attempts = activeTraining && currentEmployee
    ? store.getAttempts(activeTraining.id, currentEmployee.id)
    : [];

  const preTestAttempts = attempts.filter((a) => a.test_type === 'pre_test');
  const postTestAttempts = attempts.filter((a) => a.test_type === 'post_test');
  const hasPassedPostTest = postTestAttempts.some((a) => a.pass_status === 'passed');

  // Launch Video Material
  const handleLaunchMaterial = (mat: LearningMaterial) => {
    setActiveMaterial(mat);
    setSimulatedProgress(activeAssignment?.progress_percent || 20);
  };

  // Simulate video watching progress increment
  const handleSimulateWatch = (amount: number) => {
    if (!activeAssignment || !activeTraining || !currentEmployee) return;
    const newProgress = Math.min(100, Math.max(0, simulatedProgress + amount));
    setSimulatedProgress(newProgress);
    store.updateAssignmentProgress(activeTraining.id, currentEmployee.id, newProgress);
    if (newProgress >= 100) {
      toast.success('Materi Selesai!', 'Anda telah menyelesaikan materi ini. Silakan lanjut ke Post-Test.');
    }
  };

  // Launch Quiz (Pre-Test or Post-Test)
  const handleStartQuiz = (type: 'pre_test' | 'post_test') => {
    if (!activeTraining) return;

    const allQs = store.getQuestions(activeTraining.id);
    const filtered = allQs.filter((q) => q.tipe_test === 'both' || q.tipe_test === type);

    if (filtered.length === 0) {
      toast.error('Belum ada soal ujian', 'Trainer belum memasukkan soal ke dalam modul ini.');
      return;
    }

    setQuizType(type);
    setCurrentQuestions(filtered);
    setAnswers({});
    setQuizResult(null);
    setQuizModalOpen(true);
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!activeTraining || !currentEmployee) return;

    // Calculate score based on weights
    let totalScore = 0;
    let maxPossible = 0;

    currentQuestions.forEach((q) => {
      maxPossible += q.bobot;
      if (answers[q.id] === q.kunci) {
        totalScore += q.bobot;
      }
    });

    const normalizedScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const passed = normalizedScore >= activeTraining.passing_grade;

    // Record attempt permanently
    const currentAttemptNo = attempts.filter((a) => a.test_type === quizType).length + 1;
    store.recordAttempt({
      employee_id: currentEmployee.id,
      training_id: activeTraining.id,
      test_type: quizType,
      attempt_no: currentAttemptNo,
      score: normalizedScore,
      pass_status: passed ? 'passed' : 'failed',
      answers,
    });

    setQuizResult({
      score: normalizedScore,
      passStatus: passed ? 'passed' : 'failed',
      passingGrade: activeTraining.passing_grade,
    });

    if (passed) {
      toast.success(
        'Selamat, Anda LULUS!',
        `Skor Post-Test: ${normalizedScore}% (Ambang batas: ${activeTraining.passing_grade}%)`
      );
    } else {
      toast.error(
        'Belum Memenuhi Batas Kelulusan',
        `Skor: ${normalizedScore}%. Status: Perlu Remedial sesuai aturan modul.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Learning Portal</h1>
            <p className="text-xs text-slate-500">
              PRD 6.4 & 6.5: Pelatihan yang ditugaskan, tonton video materi, kerjakan pre-test/post-test, dan pantau kelulusan.
            </p>
          </div>
        </div>

        {/* Current Employee Badge */}
        {currentEmployee && (
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{currentEmployee.nama}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentEmployee.employee_code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout: Left = Enrolled Courses, Right = Interactive Learning Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Assigned Trainings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Training Ditugaskan ({assignments.length})
            </h2>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Belum ada training yang ditugaskan saat ini.</p>
            </div>
          ) : (
            assignments.map((asg) => {
              const trn = allTrainings.find((t) => t.id === asg.training_id);
              if (!trn) return null;
              const isSelected = activeAssignment?.id === asg.id;

              return (
                <div
                  key={asg.id}
                  onClick={() => {
                    setActiveAssignment(asg);
                    setActiveMaterial(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="teal" size="sm">
                      {trn.kategori}
                    </Badge>
                    <Badge
                      variant={
                        asg.status === 'completed'
                          ? 'emerald'
                          : asg.status === 'remedial'
                          ? 'rose'
                          : asg.status === 'in_progress'
                          ? 'blue'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {asg.status === 'completed'
                        ? 'Selesai'
                        : asg.status === 'remedial'
                        ? 'Remedial'
                        : asg.status === 'in_progress'
                        ? 'Berjalan'
                        : 'Belum Mulai'}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{trn.judul}</h3>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                      <span>Progress Belajar</span>
                      <span className="font-bold text-teal-800">{asg.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${asg.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Tenggat: {asg.due_date}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Course Viewer & Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {activeTraining ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Course Title and Status */}
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="teal">{activeTraining.kategori}</Badge>
                  <span className="text-xs text-slate-400">
                    Passing Grade: <strong>{activeTraining.passing_grade}%</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{activeTraining.judul}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeTraining.deskripsi}</p>
              </div>

              {/* Assessment Step Buttons: Pre-Test -> Learning -> Post-Test */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Tahapan Evaluasi Modul
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kerjakan Pre-Test sebelum materi dan Post-Test setelah selesai menonton.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Pre-Test Button */}
                  <Button
                    variant={preTestAttempts.length > 0 ? 'outline' : 'secondary'}
                    size="sm"
                    icon={<FileCheck2 className="w-3.5 h-3.5 text-teal-500" />}
                    onClick={() => handleStartQuiz('pre_test')}
                  >
                    {preTestAttempts.length > 0
                      ? `Pre-Test (${preTestAttempts[0].score}%)`
                      : 'Mulai Pre-Test'}
                  </Button>

                  {/* Post-Test Button */}
                  <Button
                    variant={hasPassedPostTest ? 'emerald' : 'primary'}
                    size="sm"
                    icon={<Award className="w-3.5 h-3.5" />}
                    onClick={() => handleStartQuiz('post_test')}
                  >
                    {hasPassedPostTest
                      ? `Lulus Post-Test (${postTestAttempts[0]?.score}%)`
                      : postTestAttempts.length > 0
                      ? `Ulangi Post-Test (${postTestAttempts[0]?.score}%)`
                      : 'Kerjakan Post-Test'}
                  </Button>
                </div>
              </div>

              {/* Learning Materials List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Materi & Video Pembelajaran ({materials.length})
                </h3>

                <div className="space-y-2">
                  {materials.map((mat, idx) => {
                    const isPlaying = activeMaterial?.id === mat.id;
                    return (
                      <div
                        key={mat.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isPlaying
                            ? 'bg-teal-50/50 border-teal-300 ring-1 ring-teal-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLaunchMaterial(mat)}
                            className="w-10 h-10 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                          >
                            <Play className="w-4 h-4 ml-0.5" />
                          </button>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{mat.judul}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="slate" size="sm">
                                {mat.tipe.toUpperCase()}
                              </Badge>
                              <span className="text-[11px] text-slate-400">
                                Estimasi: {mat.durasi_menit || 15} Menit
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={isPlaying ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleLaunchMaterial(mat)}
                        >
                          {isPlaying ? 'Sedang Diputar' : 'Buka Materi'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Video Player Simulation Area */}
              {activeMaterial && (
                <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Memutar Video Materi
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{activeMaterial.judul}</span>
                  </div>

                  {/* Video Screen / Simulation Canvas */}
                  <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                    {activeMaterial.url.includes('drive.google.com') ? (
                      <iframe
                        src={activeMaterial.url}
                        className="w-full h-full rounded-xl border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={activeMaterial.judul}
                      />
                    ) : activeMaterial.url.startsWith('data:video') || activeMaterial.url.endsWith('.mp4') || activeMaterial.url.endsWith('.webm') ? (
                      <video
                        src={activeMaterial.url}
                        controls
                        className="w-full h-full rounded-xl object-contain bg-black"
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <Play className="w-16 h-16 text-teal-500/80 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-bold text-white max-w-md">{activeMaterial.judul}</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Media Pembelajaran: <a href={activeMaterial.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">{activeMaterial.url}</a>
                        </p>
                      </div>
                    )}

                    {/* Progress Bar in Player */}
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 p-2 flex items-center gap-3 border-t border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400">{simulatedProgress}%</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${simulatedProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">100%</span>
                    </div>
                  </div>

                  {/* Simulated Progress Controls (PRD 6.4: Progress dihitung wajar) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <span className="text-slate-400">
                      Progress Tontonan Saat Ini:{' '}
                      <strong className="text-emerald-400 font-bold">{simulatedProgress}%</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
                        onClick={() => handleSimulateWatch(25)}
                      >
                        + Lanjut Tonton (+25%)
                      </Button>
                      <Button
                        variant="emerald"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSimulateWatch(100)}
                      >
                        Tonton Hingga Selesai (100%)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Attempt History */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Riwayat Ujian & Hasil Skor ({attempts.length})
                </h3>

                {attempts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada tes yang diselesaikan.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {attempts.map((att) => (
                      <div key={att.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={att.test_type === 'post_test' ? 'teal' : 'blue'}
                            size="sm"
                          >
                            {att.test_type === 'post_test' ? 'Post-Test' : 'Pre-Test'} #
                            {att.attempt_no}
                          </Badge>
                          <span className="text-slate-500">
                            {new Date(att.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">Skor: {att.score}%</span>
                          <Badge
                            variant={att.pass_status === 'passed' ? 'emerald' : 'rose'}
                            size="sm"
                          >
                            {att.pass_status === 'passed' ? 'LULUS' : 'GAGAL / REMEDIAL'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-700">Pilih program training di sebelah kiri</p>
              <p className="text-xs text-slate-400 mt-1">
                Akses video pembelajaran, evaluasi pre-test, dan sertifikasi kelulusan Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QUIZ MODAL (INTERACTIVE QUESTION RUNNER) */}
      <Modal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        title={`${quizType === 'post_test' ? 'Post-Test' : 'Pre-Test'}: ${activeTraining?.judul || ''}`}
        subtitle={`Ambang batas kelulusan: ${activeTraining?.passing_grade || 70}%`}
        maxWidth="2xl"
      >
        {!quizResult ? (
          <div className="space-y-6">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Pilihlah salah satu jawaban yang paling tepat. Kunci jawaban tidak ditampilkan selama pengerjaan tes.
              </span>
            </div>

            <div className="space-y-5">
              {currentQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{q.pertanyaan}</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.opsi.map((opt) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 font-semibold text-teal-900'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${q.id}`}
                            checked={isSelected}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-bold text-slate-900">{opt.id}.</span>
                          <span className="flex-1">{opt.teks}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Terjawab: {Object.keys(answers).length} / {currentQuestions.length} Soal
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setQuizModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length === 0}
                >
                  Kirim Jawaban & Selesaikan Tes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Result Presentation */
          <div className="text-center py-6 space-y-4">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg ${
                quizResult.passStatus === 'passed'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {quizResult.passStatus === 'passed' ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <RotateCcw className="w-10 h-10" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Skor Anda: {quizResult.score}%
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ambang Batas Kelulusan: {quizResult.passingGrade}%
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl border text-xs leading-relaxed">
              {quizResult.passStatus === 'passed' ? (
                <div className="bg-emerald-50 text-emerald-900 border-emerald-200 p-3 rounded-lg">
                  <p className="font-bold">STATUS: LULUS (COMPLETED)</p>
                  <p className="mt-1">
                    Kompetensi kognitif untuk modul ini telah tercapai dan tercatat dalam sistem.
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-900 border-rose-200 p-3 rounded-lg">
                  <p className="font-bold">STATUS: BELUM LULUS (PERLU REMEDIAL)</p>
                  <p className="mt-1">
                    Skor berada di bawah batas minimum. Anda direkomendasikan mengulang materi dan mengambil tes remedial.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setQuizModalOpen(false);
                }}
              >
                Tutup & Kembali ke Pembelajaran
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
