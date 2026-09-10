"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  UploadCloud,
  X,
  FileDown,
  Calendar,
  Search,
  Printer,
  FileCheck,
  Eye,
  Layers,
  BookOpen,
} from "lucide-react";
import { useDialog } from "@/components/ui/DialogProvider";

export type QuestionSet = {
  _id?: string;
  className: string;
  setName: string;
  pricePerSet: number;
  centerDiscountPercent?: number;
  centerDiscountAmount?: number;
  effectiveCenterPrice?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
  details?: string;
  subjects?: string[];
  instructions?: string;
  isActive: boolean;
  orderCount?: number;
};

export type ExamItem = {
  _id: string;
  name: string;
  code?: string;
  examTerm?: string;
  startDate?: string;
  endDate?: string;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  questionSets: QuestionSet[];
};

export type ExamSessionType = {
  _id: string;
  sessionYear: string;
  title?: string;
  isDefault?: boolean;
  status: "ACTIVE" | "ARCHIVED";
  exams: ExamItem[];
};

type CurriculumClassInfo = {
  id: string;
  name: string;
  order: number;
  books: { id: string; title: string }[];
  examYears?: { id: string; year: string; exams?: { id: string; name: string }[] }[];
};

const DEFAULT_PRESET_CLASSES = [
  "শিশু / নার্সারি",
  "১ম শ্রেণি",
  "২য় শ্রেণি",
  "৩য় শ্রেণি",
  "৪র্থ শ্রেণি",
  "৫ম শ্রেণি",
  "হিফজুল কুরআন",
  "তাজবীদ ও কিরাত",
  "মুয়াল্লিম প্রশিক্ষণ",
];

const DEFAULT_PRESET_SUBJECTS = [
  "কুরআন মাজীদ",
  "তাজবীদ",
  "আকাইদ ও মাসায়েল",
  "হাদিস শরীফ",
  "আরবি সাহিত্য",
  "বাংলা",
  "ইংরেজি",
  "গণিত",
  "সাধারণ জ্ঞান",
  "ইসলামি ইতিহাস",
];

// Helper to calculate auto status and remaining days/hours countdown based on dates
export function getExamStatusByDate(
  startDate?: string,
  endDate?: string,
  fallbackStatus: "ACTIVE" | "UPCOMING" | "COMPLETED" = "ACTIVE"
): { status: "ACTIVE" | "UPCOMING" | "COMPLETED"; label: string; badgeText: string; colorClass: string } {
  if (startDate) {
    const now = new Date();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date(startDate);
    end.setHours(23, 59, 59, 999);

    if (now.getTime() < start.getTime()) {
      const diffMs = start.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      let countdown = "";
      if (diffDays > 0) {
        countdown = `${diffDays} দিন${diffHours > 0 ? ` ${diffHours} ঘণ্টা` : ""} বাকি`;
      } else {
        countdown = `${Math.max(1, diffHours)} ঘণ্টা বাকি`;
      }

      return {
        status: "UPCOMING",
        label: "আসন্ন",
        badgeText: `আসন্ন (${countdown})`,
        colorClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    } else if (now.getTime() > end.getTime()) {
      return {
        status: "COMPLETED",
        label: "সমাপ্ত",
        badgeText: "সমাপ্ত",
        colorClass: "bg-slate-100 text-slate-600 border-slate-200",
      };
    } else {
      const diffMs = end.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      let remaining = "";
      if (diffDays > 0) {
        remaining = `${diffDays} দিন বাকি`;
      } else {
        remaining = `${Math.max(1, diffHours)} ঘণ্টা বাকি`;
      }

      return {
        status: "ACTIVE",
        label: "চলমান",
        badgeText: `চলমান (${remaining})`,
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
  }

  if (fallbackStatus === "UPCOMING") {
    return { status: "UPCOMING", label: "আসন্ন", badgeText: "আসন্ন", colorClass: "bg-blue-50 text-blue-700 border-blue-200" };
  } else if (fallbackStatus === "COMPLETED") {
    return { status: "COMPLETED", label: "সমাপ্ত", badgeText: "সমাপ্ত", colorClass: "bg-slate-100 text-slate-600 border-slate-200" };
  }
  return { status: "ACTIVE", label: "চলমান", badgeText: "চলমান", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

export default function ExamQuestionManagementView() {
  const { alert, confirm } = useDialog();

  const [sessions, setSessions] = useState<ExamSessionType[]>([]);
  const [curriculumClasses, setCurriculumClasses] = useState<CurriculumClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");

  // Modals State
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<ExamSessionType | null>(null);
  const [sessionForm, setSessionForm] = useState({ sessionYear: "", title: "" });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ExamSessionType | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);

  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState<{
    _id?: string;
    name: string;
    code: string;
    examTerm: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  }>({
    name: "",
    code: "",
    examTerm: "১ম সাময়িক",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });
  const [savingExam, setSavingExam] = useState(false);

  // Question Set Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionSet, setEditingQuestionSet] = useState<QuestionSet | null>(null);
  const [questionForm, setQuestionForm] = useState<{
    className: string;
    setName: string;
    pricePerSet: number;
    centerDiscountPercent: number;
    centerDiscountAmount: number;
    attachmentUrl: string;
    attachmentName: string;
    attachmentSize: string;
    details: string;
    subjects: string[];
    instructions: string;
    isActive: boolean;
  }>({
    className: "১ম শ্রেণি",
    setName: "",
    pricePerSet: 15,
    centerDiscountPercent: 15,
    centerDiscountAmount: 0,
    attachmentUrl: "",
    attachmentName: "",
    attachmentSize: "",
    details: "",
    subjects: ["কুরআন মাজীদ", "তাজবীদ", "বাংলা", "ইংরেজি", "গণিত"],
    instructions: "",
    isActive: true,
  });
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Preview Modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState("");

  // Fetch Curriculum Classes & Books
  const fetchCurriculum = async () => {
    try {
      const res = await fetch("/api/curriculum/classes");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCurriculumClasses(data);
        }
      }
    } catch (e) {
      console.error("Failed to load curriculum classes", e);
    }
  };

  // Fetch Sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams");
      if (res.ok) {
        const data = await res.json();
        const loadedSessions: ExamSessionType[] = data.sessions || [];
        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
          if (!activeSessionId || !loadedSessions.find((s) => s._id === activeSessionId)) {
            const firstSession = loadedSessions[0];
            setActiveSessionId(firstSession._id);
            if (firstSession.exams && firstSession.exams.length > 0) {
              setActiveExamId(firstSession.exams[0]._id);
            } else {
              setActiveExamId(null);
            }
          }
        }
      }
    } catch (e: any) {
      console.error("Failed to load exam sessions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchCurriculum();
  }, []);

  // Derived Classes from Curriculum
  const availableClasses = useMemo(() => {
    if (curriculumClasses.length > 0) {
      return curriculumClasses.map((c) => c.name);
    }
    return DEFAULT_PRESET_CLASSES;
  }, [curriculumClasses]);

  // Derived Books for Selected Class from Curriculum
  const availableBooksForSelectedClass = useMemo(() => {
    const curClass = curriculumClasses.find((c) => c.name === questionForm.className);
    if (curClass && curClass.books && curClass.books.length > 0) {
      return curClass.books.map((b) => b.title);
    }
    return DEFAULT_PRESET_SUBJECTS;
  }, [curriculumClasses, questionForm.className]);

  // Derived Exams from Curriculum
  const availableCurriculumExams = useMemo(() => {
    const examSet = new Set<string>();
    curriculumClasses.forEach((c) => {
      c.examYears?.forEach((y) => {
        y.exams?.forEach((e) => {
          if (e.name) examSet.add(e.name);
        });
      });
    });
    const list = Array.from(examSet);
    if (list.length === 0) {
      return ["১ম সাময়িক পরীক্ষা", "২য় সাময়িক পরীক্ষা", "বার্ষিক পরীক্ষা", "কেন্দ্রীয় সমাপনী পরীক্ষা", "বিশেষ পরীক্ষা"];
    }
    return list;
  }, [curriculumClasses]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s._id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const activeExam = useMemo(() => {
    if (!activeSession || !activeSession.exams) return null;
    return activeSession.exams.find((e) => e._id === activeExamId) || activeSession.exams[0] || null;
  }, [activeSession, activeExamId]);

  // Handle Session Change
  const handleSelectSession = (sId: string) => {
    setActiveSessionId(sId);
    const targetSession = sessions.find((s) => s._id === sId);
    if (targetSession && targetSession.exams && targetSession.exams.length > 0) {
      setActiveExamId(targetSession.exams[0]._id);
    } else {
      setActiveExamId(null);
    }
  };

  // Filtered Question Sets
  const filteredQuestionSets = useMemo(() => {
    if (!activeExam || !activeExam.questionSets) return [];
    return activeExam.questionSets.filter((q) => {
      if (selectedClassFilter !== "ALL" && q.className !== selectedClassFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cName = (q.className || "").toLowerCase();
        const sName = (q.setName || "").toLowerCase();
        const det = (q.details || "").toLowerCase();
        const subs = (q.subjects || []).join(" ").toLowerCase();
        if (!cName.includes(query) && !sName.includes(query) && !det.includes(query) && !subs.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeExam, selectedClassFilter, searchQuery]);

  // Session Creation & Edit Handlers
  const handleOpenCreateSession = () => {
    setEditingSession(null);
    setSessionForm({ sessionYear: "", title: "" });
    setShowSessionModal(true);
  };

  const handleOpenEditSession = (s: ExamSessionType) => {
    setEditingSession(s);
    setSessionForm({
      sessionYear: s.sessionYear || "",
      title: s.title || "",
    });
    setShowSessionModal(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const customName = sessionForm.sessionYear.trim();
    if (!customName) {
      alert({ title: "সতর্কতা", message: "সেশনের নাম লিখুন (উদাঃ ২০২৬, ২০২৬-২০২৭, বা বিশেষ সেশন)", type: "warning" });
      return;
    }
    setSavingSession(true);
    try {
      if (editingSession) {
        // Update existing session
        const res = await fetch(`/api/admin/exams/${editingSession._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_session",
            sessionYear: customName,
            title: sessionForm.title.trim() || customName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update session");

        alert({ title: "সফল", message: `"${customName}" সেশন সফলভাবে আপডেট হয়েছে`, type: "success" });
      } else {
        // Create new session
        const res = await fetch("/api/admin/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_session",
            sessionYear: customName,
            title: sessionForm.title.trim() || customName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create session");

        alert({ title: "সফল", message: `"${customName}" সেশন সফলভাবে তৈরি হয়েছে`, type: "success" });
        if (data.session) {
          setActiveSessionId(data.session._id);
        }
      }

      setShowSessionModal(false);
      setEditingSession(null);
      setSessionForm({ sessionYear: "", title: "" });
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    } finally {
      setSavingSession(false);
    }
  };

  // Delete Session with Custom Confirmation
  const handleExecuteDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSession(true);
    try {
      const res = await fetch(`/api/admin/exams/${sessionToDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete session");

      alert({ title: "সফল", message: `"${sessionToDelete.title?.trim() || sessionToDelete.sessionYear}" সেশন সফলভাবে মুছে ফেলা হয়েছে`, type: "success" });
      setSessionToDelete(null);
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    } finally {
      setDeletingSession(false);
    }
  };

  // Exam Creation & Edit
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) {
      alert({ title: "সতর্কতা", message: "প্রথমে একটি শিক্ষাবর্ষ নির্বাচন করুন", type: "warning" });
      return;
    }
    if (!examForm.name.trim()) {
      alert({ title: "সতর্কতা", message: "পরীক্ষার নাম লিখুন", type: "warning" });
      return;
    }

    const calculated = getExamStatusByDate(examForm.startDate, examForm.endDate, examForm.status);

    setSavingExam(true);
    try {
      if (examForm._id) {
        // Edit
        const res = await fetch(`/api/admin/exams/${activeSession._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_exam",
            examId: examForm._id,
            name: examForm.name,
            code: examForm.code,
            examTerm: examForm.examTerm,
            startDate: examForm.startDate,
            endDate: examForm.endDate,
            status: calculated.status,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update exam");
      } else {
        // Create
        const res = await fetch("/api/admin/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_exam",
            sessionId: activeSession._id,
            name: examForm.name,
            code: examForm.code,
            examTerm: examForm.examTerm,
            startDate: examForm.startDate,
            endDate: examForm.endDate,
            status: calculated.status,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create exam");
      }

      alert({ title: "সফল", message: "পরীক্ষা সংরক্ষিত হয়েছে", type: "success" });
      setShowExamModal(false);
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    } finally {
      setSavingExam(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string) => {
    if (!activeSession) return;
    const isConfirmed = await confirm({
      title: "সতর্কতা",
      message: "এই পরীক্ষা ও সকল প্রশ্ন সেট মুছে ফেলতে চান?",
      type: "error",
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল",
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/exams/${activeSession._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_exam", examId }),
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      alert({ title: "সফল", message: "পরীক্ষা মুছে ফেলা হয়েছে", type: "success" });
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    }
  };

  // PDF File Upload Handler
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert({ title: "সতর্কতা", message: "শুধুমাত্র PDF ফাইল আপলোড করুন", type: "warning" });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert({ title: "সতর্কতা", message: "ফাইলের সাইজ সর্বোচ্চ ১৫ মেগাবাইট হতে পারে", type: "warning" });
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "questions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

      setQuestionForm((prev) => ({
        ...prev,
        attachmentUrl: data.url,
        attachmentName: file.name,
        attachmentSize: sizeStr,
      }));

      alert({ title: "সফল", message: "PDF আপলোড সম্পন্ন", type: "success" });
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save / Edit Question Set
  const handleSaveQuestionSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !activeExam) {
      alert({ title: "সতর্কতা", message: "সেশন ও পরীক্ষা নির্বাচন করুন", type: "warning" });
      return;
    }

    if (!questionForm.className.trim() || !questionForm.setName.trim()) {
      alert({ title: "সতর্কতা", message: "শ্রেণি ও সেটের নাম দিন", type: "warning" });
      return;
    }

    setSavingQuestion(true);
    try {
      if (editingQuestionSet && editingQuestionSet._id) {
        // Edit
        const res = await fetch(`/api/admin/exams/${activeSession._id}/questions`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: activeExam._id,
            questionSetId: editingQuestionSet._id,
            className: questionForm.className,
            setName: questionForm.setName,
            pricePerSet: questionForm.pricePerSet,
            centerDiscountPercent: questionForm.centerDiscountPercent,
            centerDiscountAmount: questionForm.centerDiscountAmount,
            attachmentUrl: questionForm.attachmentUrl,
            attachmentName: questionForm.attachmentName,
            attachmentSize: questionForm.attachmentSize,
            details: questionForm.details,
            subjects: questionForm.subjects,
            instructions: questionForm.instructions,
            isActive: questionForm.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update question set");
      } else {
        // Create
        const res = await fetch(`/api/admin/exams/${activeSession._id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: activeExam._id,
            className: questionForm.className,
            setName: questionForm.setName,
            pricePerSet: questionForm.pricePerSet,
            centerDiscountPercent: questionForm.centerDiscountPercent,
            centerDiscountAmount: questionForm.centerDiscountAmount,
            attachmentUrl: questionForm.attachmentUrl,
            attachmentName: questionForm.attachmentName,
            attachmentSize: questionForm.attachmentSize,
            details: questionForm.details,
            subjects: questionForm.subjects,
            instructions: questionForm.instructions,
            isActive: questionForm.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create question set");
      }

      alert({ title: "সফল", message: "প্রশ্ন সেট সংরক্ষিত হয়েছে", type: "success" });
      setShowQuestionModal(false);
      setEditingQuestionSet(null);
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question Set
  const handleDeleteQuestionSet = async (questionSetId: string) => {
    if (!activeSession || !activeExam) return;
    const isConfirmed = await confirm({
      title: "সতর্কতা",
      message: "এই প্রশ্ন সেটটি মুছে ফেলতে চান?",
      type: "error",
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল",
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(
        `/api/admin/exams/${activeSession._id}/questions?examId=${activeExam._id}&questionSetId=${questionSetId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete question set");
      alert({ title: "সফল", message: "প্রশ্ন সেট মুছে ফেলা হয়েছে", type: "success" });
      await fetchSessions();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message, type: "error" });
    }
  };

  // Open Edit Modal
  const handleOpenEditQuestionModal = (q: QuestionSet) => {
    setEditingQuestionSet(q);
    setQuestionForm({
      className: q.className,
      setName: q.setName,
      pricePerSet: q.pricePerSet || 0,
      centerDiscountPercent: q.centerDiscountPercent || 0,
      centerDiscountAmount: q.centerDiscountAmount || 0,
      attachmentUrl: q.attachmentUrl || "",
      attachmentName: q.attachmentName || "",
      attachmentSize: q.attachmentSize || "",
      details: q.details || "",
      subjects: q.subjects || [],
      instructions: q.instructions || "",
      isActive: q.isActive !== undefined ? q.isActive : true,
    });
    setShowQuestionModal(true);
  };

  // Add Subject Tag
  const handleAddSubject = (subjectName?: string) => {
    const sub = (subjectName || customSubjectInput).trim();
    if (!sub) return;
    if (!questionForm.subjects.includes(sub)) {
      setQuestionForm((prev) => ({
        ...prev,
        subjects: [...prev.subjects, sub],
      }));
    }
    if (!subjectName) {
      setCustomSubjectInput("");
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setQuestionForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== sub),
    }));
  };

  // Print Question Catalog
  const handlePrintQuestionCatalog = () => {
    if (!activeExam || filteredQuestionSets.length === 0) {
      alert({ title: "সতর্কতা", message: "প্রিন্ট করার জন্য কোনো প্রশ্ন সেট নেই", type: "warning" });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const rowsHtml = filteredQuestionSets
      .map(
        (q, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold; width: 30px;">${idx + 1}</td>
        <td style="font-weight: bold; color: #0f172a; width: 100px;">${q.className}</td>
        <td style="font-weight: 600;">${q.setName}</td>
        <td style="font-size: 9.5px; color: #475569;">${(q.subjects || []).join(", ") || "-"}</td>
        <td style="text-align: right; font-weight: bold; width: 85px;">${q.pricePerSet.toFixed(2)} ৳</td>
        <td style="text-align: center; font-weight: bold; color: #16a34a; width: 80px;">${q.centerDiscountPercent ? q.centerDiscountPercent + "%" : (q.centerDiscountAmount ? "৳ " + q.centerDiscountAmount : "-")}</td>
        <td style="text-align: right; font-weight: bold; color: #15803d; width: 95px;">${(q.effectiveCenterPrice || q.pricePerSet).toFixed(2)} ৳</td>
        <td style="text-align: center; width: 70px; font-size: 9.5px;">${q.attachmentUrl ? "PDF সংযুক্ত" : "মুদ্রিত কপি"}</td>
      </tr>
    `
      )
      .join("");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>প্রশ্নপত্র তালিকা - ${activeExam.name}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm 7mm 8mm 7mm; }
            * { box-sizing: border-box; }
            body {
              font-family: var(--font-solaiman-lipi, 'SolaimanLipi'), sans-serif, system-ui;
              margin: 0; padding: 0; color: #1e293b; font-size: 10.5px; line-height: 1.3; background: #fff;
            }
            .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-bottom: 8px; }
            .header h1 { font-size: 16px; font-weight: 800; color: #15803d; margin: 0 0 2px 0; }
            .header h2 { font-size: 12px; font-weight: 700; color: #334155; margin: 0 0 2px 0; }
            .header-meta {
              display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; margin-top: 3px;
              border-top: 1px dashed #cbd5e1; padding-top: 3px;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th {
              background-color: #15803d; color: #ffffff; font-size: 10px; font-weight: 700;
              padding: 4px 5px; border: 1px solid #15803d; -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            td { padding: 3px 5px; border: 1px solid #cbd5e1; font-size: 10px; vertical-align: middle; }
            tr:nth-child(even) td { background-color: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; padding-top: 10px; }
            .sign-box { text-align: center; border-top: 1px dotted #94a3b8; width: 140px; padding-top: 3px; }
            .notice-box { margin-top: 12px; padding: 6px 10px; background-color: #f0fdf4; border: 1px dashed #86efac; font-size: 9.5px; border-radius: 4px; color: #166534; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</h1>
            <h2>${activeSession?.title || activeSession?.sessionYear + " শিক্ষাবর্ষ"} — ${activeExam.name}</h2>
            <div class="header-meta">
              <div><strong>টার্ম:</strong> ${activeExam.examTerm || "সকল"} | <strong>কোড:</strong> ${activeExam.code || "-"}</div>
              <div><strong>মোট সেট:</strong> ${filteredQuestionSets.length} টি | <strong>তারিখ:</strong> ${new Date().toLocaleDateString("bn-BD")}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ক্র.</th>
                <th>শ্রেণি</th>
                <th>প্রশ্ন সেট</th>
                <th>বিষয়</th>
                <th style="text-align: right;">সাধারণ মূল্য</th>
                <th style="text-align: center;">কেন্দ্র ছাড়</th>
                <th style="text-align: right;">কেন্দ্রীয় মূল্য</th>
                <th style="text-align: center;">সংযুক্তি</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="notice-box">
            📌 <strong>কেন্দ্র নির্দেশনা:</strong> নিবন্ধিত পরীক্ষা কেন্দ্রগুলো ছাড়কৃত মূল্যে প্রশ্ন সংগ্রহ করতে পারবেন।
          </div>

          <div class="footer">
            <div class="sign-box">অ্যাডমিন</div>
            <div class="sign-box">পরীক্ষা নিয়ন্ত্রক</div>
            <div class="sign-box">মহাসচিব</div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex items-center gap-2 pb-1">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <FileCheck className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">পরীক্ষা ও প্রশ্নপত্র পরিচালনা</h2>
      </div>

      {/* SECTION 1: সেশন ও শিক্ষাবর্ষ */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800">১. শিক্ষাবর্ষ ও সেশন</h3>
          </div>

          <div className="flex items-center gap-2">
            {activeSession && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenEditSession(activeSession)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                  title={`"${activeSession.title?.trim() || activeSession.sessionYear}" সেশন এডিট করুন`}
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>সেশন এডিট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionToDelete(activeSession)}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                  title={`"${activeSession.title?.trim() || activeSession.sessionYear}" সেশন মুছে ফেলুন`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>সেশন ডিলিট</span>
                </button>
              </>
            )}

            <button
              onClick={handleOpenCreateSession}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সেশন যোগ</span>
            </button>
          </div>
        </div>

        {/* Sessions Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full">
          {sessions.length === 0 ? (
            <span className="text-xs text-slate-400">কোনো সেশন তৈরি করা হয়নি। "+ সেশন যোগ" করুন।</span>
          ) : (
            sessions.map((s) => {
              const isSelected = activeSessionId === s._id;
              const displayName = s.title?.trim() || s.sessionYear;
              return (
                <div
                  key={s._id}
                  className={`inline-flex items-center rounded-lg border transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSession(s._id)}
                    className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{displayName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {s.exams?.length || 0} পরীক্ষা
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditSession(s);
                    }}
                    className={`p-1.5 rounded hover:bg-black/10 transition-colors ${
                      isSelected ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-blue-600"
                    }`}
                    title={`"${displayName}" সেশন এডিট করুন`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(s);
                    }}
                    className={`p-1.5 mr-1 rounded hover:bg-black/10 transition-colors ${
                      isSelected ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-red-600"
                    }`}
                    title={`"${displayName}" সেশন ডিলিট করুন`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: সেশনের পরীক্ষাসমূহ */}
      {activeSession && (
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">
                ২. {activeSession.sessionYear} শিক্ষাবর্ষের পরীক্ষাসমূহ ({activeSession.exams?.length || 0})
              </h3>
            </div>

            <button
              onClick={() => {
                setExamForm({
                  name: availableCurriculumExams[0] ? `${availableCurriculumExams[0]} ${activeSession.sessionYear}` : `১ম সাময়িক পরীক্ষা ${activeSession.sessionYear}`,
                  code: `SEM-${Date.now().toString().slice(-4)}`,
                  examTerm: "১ম সাময়িক",
                  startDate: "",
                  endDate: "",
                  status: "ACTIVE",
                });
                setShowExamModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>পরীক্ষা যোগ</span>
            </button>
          </div>

          {/* Exam Cards with Auto Date Status Badge */}
          {activeSession.exams && activeSession.exams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeSession.exams.map((exam) => {
                const isSelected = activeExamId === exam._id;
                const totalSets = exam.questionSets?.length || 0;
                const statusInfo = getExamStatusByDate(exam.startDate, exam.endDate, exam.status);

                return (
                  <div
                    key={exam._id}
                    onClick={() => setActiveExamId(exam._id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800">{exam.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.colorClass}`}>
                        {statusInfo.badgeText}
                      </span>
                    </div>

                    {exam.startDate && (
                      <div className="text-[10px] text-slate-500 font-medium my-0.5">
                        📅 {exam.startDate} {exam.endDate ? `– ${exam.endDate}` : ""}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                      <span className="font-medium text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {totalSets} টি প্রশ্ন সেট
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setExamForm({
                              _id: exam._id,
                              name: exam.name,
                              code: exam.code || "",
                              examTerm: exam.examTerm || "১ম সাময়িক",
                              startDate: exam.startDate || "",
                              endDate: exam.endDate || "",
                              status: exam.status || "ACTIVE",
                            });
                            setShowExamModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-slate-200"
                          title="এডিট"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-100"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-2">এই সেশনের অধীনে কোনো পরীক্ষা নেই।</p>
              <button
                onClick={() => {
                  setExamForm({
                    name: availableCurriculumExams[0] ? `${availableCurriculumExams[0]} ${activeSession.sessionYear}` : `১ম সাময়িক পরীক্ষা ${activeSession.sessionYear}`,
                    code: `SEM-${Date.now().toString().slice(-4)}`,
                    examTerm: "১ম সাময়িক",
                    startDate: "",
                    endDate: "",
                    status: "ACTIVE",
                  });
                  setShowExamModal(true);
                }}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                + প্রথম পরীক্ষা যোগ করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: শ্রেণিভিত্তিক প্রশ্নপত্র সেট ও ক্যাটালগ */}
      {activeExam && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden space-y-0">
          {/* Section 3 Header with its own Actions */}
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800">
                ৩. {activeExam.name} — প্রশ্নপত্র সেট
              </h3>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                {filteredQuestionSets.length} সেট
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Print Catalog Button in its own section */}
              <button
                onClick={handlePrintQuestionCatalog}
                disabled={filteredQuestionSets.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ক্যাটালগ প্রিন্ট</span>
              </button>

              {/* Add Question Set Button */}
              <button
                onClick={() => {
                  const initialClass = availableClasses[0] || "১ম শ্রেণি";
                  const initialBooks = curriculumClasses.find((c) => c.name === initialClass)?.books?.map((b) => b.title) || DEFAULT_PRESET_SUBJECTS.slice(0, 5);
                  setEditingQuestionSet(null);
                  setQuestionForm({
                    className: initialClass,
                    setName: `${initialClass} প্রশ্নপত্র সেট`,
                    pricePerSet: 15,
                    centerDiscountPercent: 15,
                    centerDiscountAmount: 0,
                    attachmentUrl: "",
                    attachmentName: "",
                    attachmentSize: "",
                    details: "",
                    subjects: initialBooks,
                    instructions: "",
                    isActive: true,
                  });
                  setShowQuestionModal(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>প্রশ্ন সেট যোগ</span>
              </button>
            </div>
          </div>

          {/* Section 3 Filter & Search Toolbar */}
          <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            {/* Dynamic Class Filter from Curriculum */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">শ্রেণি ফিল্টার:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">সকল শ্রেণি (কারিকুলাম)</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="প্রশ্ন সেট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table View (lg screens) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200 font-semibold">
                  <th className="px-3.5 py-2.5 w-10 text-center">#</th>
                  <th className="px-3.5 py-2.5 min-w-[180px]">শ্রেণি ও সেট</th>
                  <th className="px-3.5 py-2.5 w-24">সাধারণ মূল্য</th>
                  <th className="px-3.5 py-2.5 w-32">কেন্দ্র মূল্য</th>
                  <th className="px-3.5 py-2.5 min-w-[170px]">PDF প্রশ্নপত্র</th>
                  <th className="px-3.5 py-2.5 min-w-[200px]">বিষয় (বইসমূহ)</th>
                  <th className="px-3.5 py-2.5 w-20 text-center">স্ট্যাটাস</th>
                  <th className="px-3.5 py-2.5 w-20 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQuestionSets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      কোনো প্রশ্ন সেট পাওয়া যায়নি। উপরে "+ প্রশ্ন সেট যোগ" বাটনে ক্লিক করে যুক্ত করুন।
                    </td>
                  </tr>
                ) : (
                  filteredQuestionSets.map((q, idx) => {
                    const price = q.pricePerSet || 0;
                    const discount = q.centerDiscountPercent || 0;
                    const centerPrice = q.effectiveCenterPrice || (discount > 0 ? price - (price * discount) / 100 : price);

                    return (
                      <tr key={q._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {q.className}
                            </span>
                            <span className="font-semibold text-slate-800">{q.setName}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-700">
                          ৳ {price.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-mono font-bold text-emerald-700">
                            ৳ {centerPrice.toFixed(2)}
                          </span>
                          {discount > 0 && (
                            <span className="ml-1 text-[10px] text-emerald-600 font-semibold">
                              ({discount}%)
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {q.attachmentUrl ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewPdfUrl(q.attachmentUrl || null);
                                  setPreviewPdfTitle(`${q.className} — ${q.setName}`);
                                }}
                                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <Eye className="w-3 h-3" />
                                <span>দেখুন</span>
                              </button>
                              <a
                                href={q.attachmentUrl}
                                download={q.attachmentName || "question.pdf"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                              >
                                <FileDown className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {q.subjects?.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${q.isActive ? "bg-emerald-500" : "bg-slate-300"}`} title={q.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"} />
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditQuestionModal(q)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded"
                              title="এডিট"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => q._id && handleDeleteQuestionSet(q._id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards View (screens < lg) */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {filteredQuestionSets.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                কোনো প্রশ্ন সেট পাওয়া যায়নি।
              </div>
            ) : (
              filteredQuestionSets.map((q, idx) => {
                const price = q.pricePerSet || 0;
                const discount = q.centerDiscountPercent || 0;
                const centerPrice = q.effectiveCenterPrice || (discount > 0 ? price - (price * discount) / 100 : price);

                return (
                  <div key={q._id || idx} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">
                            {q.className}
                          </span>
                          <span className="font-bold text-xs text-slate-800">{q.setName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditQuestionModal(q)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => q._id && handleDeleteQuestionSet(q._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-500 text-[11px]">মূল্য: </span>
                        <strong className="font-mono text-slate-800">৳ {price.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">কেন্দ্র: </span>
                        <strong className="font-mono text-emerald-700">৳ {centerPrice.toFixed(2)}</strong>
                        {discount > 0 && <span className="text-[10px] text-emerald-600 ml-1">({discount}%)</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1 max-w-[70%]">
                        {q.subjects?.map((sub, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {sub}
                          </span>
                        ))}
                      </div>

                      {q.attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPdfUrl(q.attachmentUrl || null);
                            setPreviewPdfTitle(`${q.className} — ${q.setName}`);
                          }}
                          className="text-emerald-700 font-semibold text-xs flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ----------------- CLEAN MODALS ----------------- */}

      {/* 1. Session Modal with Custom Name (Create or Edit) */}
      {showSessionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                {editingSession ? "সেশন সম্পাদনা" : "নতুন সেশন তৈরি"}
              </h3>
              <button onClick={() => setShowSessionModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSession} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সেশনের নাম (Custom Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ২০২৬, ২০২৬-২০২৭, বা বিশেষ সেশন"
                  value={sessionForm.sessionYear}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionYear: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                  required
                  autoFocus
                />
                <p className="text-[10.5px] text-slate-400 mt-1">
                  এখানে আপনার পছন্দমতো যে কোনো কাস্টম নাম বা শিক্ষাবর্ষ লিখতে পারেন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  উপ-শিরোনাম / অতিরিক্ত বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১৪৪৭-১৪৪৮ হিজরি"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingSession}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingSession ? "অপেক্ষা করুন..." : editingSession ? "আপডেট করুন" : "সংরক্ষণ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM SESSION DELETE CONFIRMATION MODAL */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-red-50/80 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-900">সেশন মুছে ফেলার নিশ্চিতকরণ</h3>
                <p className="text-[11px] text-red-700">এই পরিবর্তনটি পূর্বাবস্থায় ফেরানো যাবে না</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনি কি নিশ্চিতভাবে{" "}
                <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                  {sessionToDelete.title?.trim() || sessionToDelete.sessionYear}
                </strong>{" "}
                সেশনটি মুছে ফেলতে চান?
              </p>

              {sessionToDelete.exams && sessionToDelete.exams.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>⚠ সতর্কতা:</span>
                  </p>
                  <p className="text-[11.5px] leading-relaxed">
                    এই সেশনের অধীনে <strong className="font-black">{sessionToDelete.exams.length}টি পরীক্ষা</strong> এবং সকল প্রশ্নপত্র সংরক্ষিত আছে। সেশন ডিলিট করলে এগুলো স্থায়ীভাবে মুছে যাবে।
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                disabled={deletingSession}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteSession}
                disabled={deletingSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingSession ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Exam Modal with Date Pickers & Auto Computed Status */}
      {showExamModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                {examForm._id ? "পরীক্ষা এডিট" : "নতুন পরীক্ষা"}
              </h3>
              <button onClick={() => setShowExamModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveExam} className="p-4 space-y-3">
              {/* Exam Name with Curriculum Dropdown Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কারিকুলাম পরীক্ষা নির্বাচন / নাম <span className="text-red-500">*</span>
                </label>
                
                {availableCurriculumExams.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const yearSuffix = activeSession?.sessionYear ? ` ${activeSession.sessionYear}` : "";
                        setExamForm((prev) => ({
                          ...prev,
                          name: `${e.target.value}${yearSuffix}`,
                          examTerm: e.target.value,
                        }));
                      }
                    }}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 mb-1.5 text-slate-700 font-medium"
                  >
                    <option value="">-- কারিকুলাম থেকে নির্বাচন করুন --</option>
                    {availableCurriculumExams.map((exName) => (
                      <option key={exName} value={exName}>{exName}</option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="উদাঃ ১ম সাময়িক পরীক্ষা ২০২৬"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Date Selection: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const computed = getExamStatusByDate(newStart, examForm.endDate, examForm.status);
                      setExamForm((prev) => ({
                        ...prev,
                        startDate: newStart,
                        status: computed.status,
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">শেষ তারিখ</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const computed = getExamStatusByDate(examForm.startDate, newEnd, examForm.status);
                      setExamForm((prev) => ({
                        ...prev,
                        endDate: newEnd,
                        status: computed.status,
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Auto Status Badge calculated from dates */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">স্বয়ংক্রিয় স্ট্যাটাস</label>
                <div className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center font-bold text-xs gap-2 ${
                  getExamStatusByDate(examForm.startDate, examForm.endDate, examForm.status).colorClass
                }`}>
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current" />
                  <span>{getExamStatusByDate(examForm.startDate, examForm.endDate, examForm.status).badgeText}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingExam}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingExam ? "অপেক্ষা করুন..." : "সংরক্ষণ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Question Set Modal with Dynamic Curriculum Classes & Books */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-sm text-slate-800">
                {editingQuestionSet ? "প্রশ্ন সেট এডিট" : "নতুন প্রশ্ন সেট"}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSet} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Dynamic Class Selector from Curriculum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কারিকুলাম শ্রেণি <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={questionForm.className}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      const curClass = curriculumClasses.find((c) => c.name === newClass);
                      const classBooks = curClass?.books?.map((b) => b.title) || [];
                      setQuestionForm((prev) => ({
                        ...prev,
                        className: newClass,
                        setName: `${newClass} প্রশ্নপত্র সেট`,
                        subjects: classBooks.length > 0 ? classBooks : prev.subjects,
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800"
                    required
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    সেটের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ ১ম শ্রেণি পূর্ণাঙ্গ সেট"
                    value={questionForm.setName}
                    onChange={(e) => setQuestionForm({ ...questionForm, setName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Pricing & Center Discount */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-semibold text-slate-800 text-[11px] block">মূল্য ও কেন্দ্র ছাড়</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">সেট মূল্য (৳)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={questionForm.pricePerSet}
                      onChange={(e) => setQuestionForm({ ...questionForm, pricePerSet: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">কেন্দ্র ছাড় (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={questionForm.centerDiscountPercent}
                      onChange={(e) => setQuestionForm({ ...questionForm, centerDiscountPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400">কেন্দ্রীয় মূল্য:</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      ৳ {(questionForm.pricePerSet - (questionForm.pricePerSet * questionForm.centerDiscountPercent) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PDF File Attachment Upload */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  PDF প্রশ্নপত্র ফাইল
                </label>

                {questionForm.attachmentUrl ? (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="font-mono font-semibold truncate max-w-[200px]">{questionForm.attachmentName || "question.pdf"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-emerald-700 font-semibold hover:underline"
                      >
                        পরিবর্তন
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionForm({ ...questionForm, attachmentUrl: "", attachmentName: "", attachmentSize: "" })}
                        className="text-[11px] text-red-500 font-semibold hover:underline"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-emerald-500 p-3 rounded-xl text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="font-semibold text-slate-700">
                      {uploadingPdf ? "আপলোড হচ্ছে..." : "PDF ফাইল আপলোড করুন"}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileUpload}
                  className="hidden"
                />
              </div>

              {/* Dynamic Curriculum Books Dropdown & Tags for Selected Class */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    অন্তর্ভুক্ত বই ও বিষয়সমূহ ({questionForm.subjects.length})
                  </label>
                  {availableBooksForSelectedClass.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionForm((prev) => ({
                          ...prev,
                          subjects: Array.from(new Set([...prev.subjects, ...availableBooksForSelectedClass])),
                        }));
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-semibold"
                    >
                      সব বই যোগ করুন
                    </button>
                  )}
                </div>

                {/* Selected Subjects Tag Pills */}
                <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[34px]">
                  {questionForm.subjects.length === 0 ? (
                    <span className="text-[11px] text-slate-400">কোনো বিষয় যুক্ত করা হয়নি</span>
                  ) : (
                    questionForm.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 bg-white text-slate-700 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add from Curriculum Books */}
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSubject(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-emerald-600 bg-white text-slate-700 text-xs"
                  >
                    <option value="">-- কারিকুলাম বই থেকে যোগ করুন --</option>
                    {availableBooksForSelectedClass.map((b) => (
                      <option key={b} value={b} disabled={questionForm.subjects.includes(b)}>
                        {b} {questionForm.subjects.includes(b) ? "(যুক্ত)" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="অন্য বিষয়..."
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                      className="w-28 sm:w-32 px-2.5 py-1 border rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubject()}
                      className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Available Book Chips */}
                {availableBooksForSelectedClass.filter((b) => !questionForm.subjects.includes(b)).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 self-center">সাজেস্ট:</span>
                    {availableBooksForSelectedClass
                      .filter((b) => !questionForm.subjects.includes(b))
                      .slice(0, 6)
                      .map((bookTitle) => (
                        <button
                          key={bookTitle}
                          type="button"
                          onClick={() => handleAddSubject(bookTitle)}
                          className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                        >
                          + {bookTitle}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={questionForm.isActive}
                  onChange={(e) => setQuestionForm({ ...questionForm, isActive: e.target.checked })}
                  className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="isActiveToggle" className="font-semibold text-slate-700 cursor-pointer">
                  প্রশ্ন সেটটি সক্রিয় রাখুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion || uploadingPdf}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingQuestion ? "অপেক্ষা করুন..." : "সংরক্ষণ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-900 text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-xs sm:text-sm truncate">{previewPdfTitle || "PDF প্রিভিউ"}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  download="question.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-xs font-semibold flex items-center gap-1"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ডাউনলোড</span>
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe src={previewPdfUrl} className="w-full h-full border-none" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
