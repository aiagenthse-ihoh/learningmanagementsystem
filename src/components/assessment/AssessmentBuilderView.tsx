import React, { useState } from 'react';
import { store } from '../../lib/storage';
import { Question, Training } from '../../types/lcms';
import { FileQuestion, Plus, Edit2, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const AssessmentBuilderView: React.FC = () => {
  const toast = useToast();
  const trainings = store.getTrainings();
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>(trainings[0]?.id || '');

  const questions = store.getQuestions(selectedTrainingId);
  const activeTraining = trainings.find((t) => t.id === selectedTrainingId);

  // Question Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [testType, setTestType] = useState<'both' | 'pre_test' | 'post_test'>('both');
  const [questionText, setQuestionText] = useState('');
  const [weight, setWeight] = useState(25);
  const [keyAnswer, setKeyAnswer] = useState('A');
  const [options, setOptions] = useState<Record<string, string>>({
    A: '',
    B: '',
    C: '',
    D: '',
  });

  // Confirm Delete Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setTestType('both');
    setQuestionText('');
    setWeight(25);
    setKeyAnswer('A');
    setOptions({ A: '', B: '', C: '', D: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setTestType(q.tipe_test);
    setQuestionText(q.pertanyaan);
    setWeight(q.bobot);
    setKeyAnswer(q.kunci);
    const optsMap: Record<string, string> = { A: '', B: '', C: '', D: '' };
    q.opsi.forEach((o) => {
      optsMap[o.id] = o.teks;
    });
    setOptions(optsMap);
    setModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainingId) {
      toast.error('Pilih training terlebih dahulu');
      return;
    }
    if (!questionText.trim()) {
      toast.error('Teks pertanyaan wajib diisi');
      return;
    }
    if (!options.A.trim() || !options.B.trim()) {
      toast.error('Pilihan A dan B wajib diisi');
      return;
    }

    const formattedOptions = Object.entries(options)
      .filter(([_, val]) => val.trim().length > 0)
      .map(([id, teks]) => ({ id, teks: teks.trim() }));

    try {
      if (editingQuestion) {
        store.updateQuestion(editingQuestion.id, {
          tipe_test: testType,
          pertanyaan: questionText.trim(),
          bobot: Number(weight),
          kunci: keyAnswer,
          opsi: formattedOptions,
        });
        toast.success('Soal Diperbarui');
      } else {
        store.addQuestion({
          training_id: selectedTrainingId,
          tipe_test: testType,
          pertanyaan: questionText.trim(),
          bobot: Number(weight),
          kunci: keyAnswer,
          opsi: formattedOptions,
        });
        toast.success('Soal Baru Ditambahkan');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Soal', err.message);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Soal Assessment',
      message: 'Apakah Anda yakin ingin menghapus soal ini dari bank soal? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: () => {
        store.deleteQuestion(id);
        toast.info('Soal Berhasil Dihapus');
      },
    });
  };

  const canEditQuestions = store.hasPermission('can_edit_questions');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Bank Soal & Pengaturan Assessment</h1>
            <p className="text-xs text-slate-500">
              PRD 6.5: Pembuatan soal pilihan ganda, kunci jawaban, bobot nilai, dan batas lulus untuk pre-test & post-test.
            </p>
          </div>
        </div>

        {canEditQuestions ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            + Tambah Soal Baru
          </Button>
        ) : (
          <Badge variant="amber" size="sm">
            Mode Baca Saja (Peserta)
          </Badge>
        )}
      </div>

      {/* Training Selector */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Pilih Modul Training:
          </label>
          <select
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
            className="bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {trainings.map((trn) => (
              <option key={trn.id} value={trn.id}>
                {trn.judul}
              </option>
            ))}
          </select>
        </div>

        {activeTraining && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Passing Grade:{' '}
              <strong className="text-emerald-400 font-bold">{activeTraining.passing_grade}%</strong>
            </span>
            <span className="text-slate-400">
              Total Soal:{' '}
              <strong className="text-teal-300 font-bold">{questions.length} Butir</strong>
            </span>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">Belum ada butir soal untuk training ini.</p>
            <p className="text-xs text-slate-400 mt-1">
              Klik "Tambah Soal Baru" untuk mulai menyusun evaluasi pre-test dan post-test.
            </p>
          </div>
        ) : (
          questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                    Q{qIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{q.pertanyaan}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="teal" size="sm">
                        {q.tipe_test === 'both'
                          ? 'Pre-test & Post-test'
                          : q.tipe_test === 'pre_test'
                          ? 'Pre-test Saja'
                          : 'Post-test Saja'}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Bobot: {q.bobot} poin
                      </Badge>
                    </div>
                  </div>
                </div>

                {canEditQuestions && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(q)}
                      title="Edit Soal"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleDelete(q.id)}
                      title="Hapus Soal"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                {q.opsi.map((opt) => {
                  const isKey = opt.id === q.kunci;
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                        isKey
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                          isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1">{opt.teks}</span>
                      {isKey && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD/EDIT QUESTION */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? 'Edit Butir Soal' : 'Tambah Soal Baru'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Penggunaan Soal
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="both">Keduanya (Pre-test & Post-test)</option>
                <option value="pre_test">Pre-test Saja</option>
                <option value="post_test">Post-test Saja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bobot Poin *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value, 10))}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pertanyaan / Kasus Soal *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan pertanyaan evaluasi yang menguji pemahaman konsep..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          {/* Choices A-D */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilihan Jawaban (A-D) & Kunci Jawaban Benar
            </label>
            {(['A', 'B', 'C', 'D'] as const).map((choice) => (
              <div key={choice} className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="keyAnswer"
                    checked={keyAnswer === choice}
                    onChange={() => setKeyAnswer(choice)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                      keyAnswer === choice ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {choice}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={`Teks pilihan ${choice}...`}
                  value={options[choice] || ''}
                  onChange={(e) => setOptions((prev) => ({ ...prev, [choice]: e.target.value }))}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            ))}
            <p className="text-[11px] text-slate-400">
              * Tandai tombol radio pada huruf yang merupakan kunci jawaban yang benar.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Soal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Hapus Soal"
        variant="danger"
      />
    </div>
  );
};
