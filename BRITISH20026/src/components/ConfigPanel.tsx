import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  HelpCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { QUESTIONS, saveQuestions, resetQuestions, getLevelWeights, saveLevelWeights, getLevelThresholds, saveLevelThresholds, LevelThresholds, DEFAULT_QUESTIONS } from '../data/questions';
import { Question } from '../types';
import { supabase } from '../lib/supabase';

interface ConfigPanelProps {
  onBack: () => void;
}

export default function ConfigPanel({ onBack }: ConfigPanelProps) {
  const [questionsList, setQuestionsList] = useState<Question[]>(() => [...QUESTIONS]);
  
  // Authentication states
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Filtering states
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form fields
  const [formLevel, setFormLevel] = useState<Question['level']>('A1');
  const [formCategory, setFormCategory] = useState<Question['category']>('Grammar');
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');

  // Scoring card states
  const [isScoringCardOpen, setIsScoringCardOpen] = useState(false);

  // Unsaved changes tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSaveChanges = () => {
    saveQuestions(questionsList);
    saveLevelWeights(levelWeights as any);
    saveLevelThresholds(levelThresholds);
    setHasChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Level weights state
  const [levelWeights, setLevelWeights] = useState<Record<string, number>>(() => getLevelWeights());

  const handleWeightChange = (lvl: string, newWeightStr: string) => {
    const weightVal = parseInt(newWeightStr, 10);
    const val = isNaN(weightVal) ? 0 : Math.max(0, weightVal);
    const updatedWeights = {
      ...levelWeights,
      [lvl]: val
    };
    setLevelWeights(updatedWeights);
    setHasChanges(true);
  };

  // Level thresholds state
  const [levelThresholds, setLevelThresholds] = useState<LevelThresholds>(() => getLevelThresholds());
  const [isThresholdsCardOpen, setIsThresholdsCardOpen] = useState(false);

  const handleThresholdChange = (lvl: keyof LevelThresholds, newPctStr: string) => {
    const pctVal = parseInt(newPctStr, 10);
    const val = isNaN(pctVal) ? 0 : Math.max(0, Math.min(100, pctVal));
    const updated = {
      ...levelThresholds,
      [lvl]: val
    };
    setLevelThresholds(updated);
    setHasChanges(true);
  };

  // Leads list state & actions
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [isLeadsCardOpen, setIsLeadsCardOpen] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      console.log('Intentando obtener leads desde Supabase...');
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('submitted_at', { ascending: false });

      console.log('Resultado de Supabase (Select):', { data, error });

      if (error) {
        console.error('Error fetching leads from Supabase:', error);
      } else if (data) {
        const mappedLeads = data.map((lead: any) => ({
          id: lead.id,
          email: lead.email,
          phone: lead.phone,
          district: lead.district,
          preferredContact: lead.preferred_contact,
          estimatedLevel: lead.estimated_level,
          recommendedProgram: lead.recommended_program,
          submittedAt: lead.submitted_at
        }));
        setLeadsList(mappedLeads);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const downloadLeadsCSV = () => {
    if (leadsList.length === 0) {
      alert('No hay leads registrados aún.');
      return;
    }
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Distrito,Correo Electrónico,Celular,Método de Contacto,Nivel Estimado,Programa Recomendado,Fecha de Envío\n';
    leadsList.forEach((lead: any) => {
      const row = [
        `"${(lead.district || lead.fullName || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${lead.preferredContact}"`,
        `"${lead.estimatedLevel}"`,
        `"${(lead.recommendedProgram || '').replace(/"/g, '""')}"`,
        `"${new Date(lead.submittedAt).toLocaleString()}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_test_ingles_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLeads = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar todo el registro de leads de la base de datos? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase
          .from('leads')
          .delete()
          .neq('id', 0);

        if (error) {
          console.error('Error clearing leads from Supabase:', error);
          alert('Hubo un error al eliminar los registros de Supabase. Asegúrese de tener la política de eliminación pública configurada.');
          return;
        }

        localStorage.removeItem('bh_quiz_leads');
        setLeadsList([]);
        alert('Historial eliminado correctamente.');
      } catch (err) {
        console.error('Failed to clear leads:', err);
        alert('Ocurrió un error inesperado al intentar borrar los registros.');
      }
    }
  };

  // Filtered list calculation
  const filteredQuestions = useMemo(() => {
    return questionsList.filter(q => {
      const matchesLevel = levelFilter === 'All' || q.level === levelFilter;
      const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLevel && matchesCategory && matchesSearch;
    });
  }, [questionsList, levelFilter, categoryFilter, searchQuery]);

  // Total statistics per level
  const statsByLevel = useMemo(() => {
    const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    questionsList.forEach(q => {
      if (counts[q.level] !== undefined) counts[q.level]++;
    });
    return counts;
  }, [questionsList]);

  // Dynamic scoring summary
  const scoringSummary = useMemo(() => {
    let totalPoints = 0;
    const summary = Object.entries(statsByLevel).map(([lvl, count]) => {
      const weight = levelWeights[lvl] !== undefined ? levelWeights[lvl] : 1;
      const subtotal = Number(count) * weight;
      totalPoints += subtotal;
      return {
        level: lvl,
        count: Number(count),
        weight,
        subtotal
      };
    });
    return {
      summary,
      totalPoints
    };
  }, [statsByLevel, levelWeights]);

  // Dynamic threshold points ranges summary
  const thresholdSummary = useMemo(() => {
    const T = scoringSummary.totalPoints;
    
    // Lower bounds in points (rounded)
    const ptC1 = Math.round((levelThresholds.C1 / 100) * T);
    const ptB2 = Math.round((levelThresholds.B2 / 100) * T);
    const ptB1 = Math.round((levelThresholds.B1 / 100) * T);
    const ptA2 = Math.round((levelThresholds.A2 / 100) * T);
    
    return [
      { level: 'C1', minPct: levelThresholds.C1, maxPct: 100, minPt: ptC1, maxPt: T },
      { level: 'B2', minPct: levelThresholds.B2, maxPct: levelThresholds.C1 - 1, minPt: ptB2, maxPt: Math.max(0, ptC1 - 1) },
      { level: 'B1', minPct: levelThresholds.B1, maxPct: levelThresholds.B2 - 1, minPt: ptB1, maxPt: Math.max(0, ptB2 - 1) },
      { level: 'A2', minPct: levelThresholds.A2, maxPct: levelThresholds.B1 - 1, minPt: ptA2, maxPt: Math.max(0, ptB1 - 1) },
      { level: 'A1', minPct: 0, maxPct: levelThresholds.A2 - 1, minPt: 0, maxPt: Math.max(0, ptA2 - 1) },
    ];
  }, [levelThresholds, scoringSummary.totalPoints]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'british2026') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gaming-dark text-white flex items-center justify-center py-8 px-4 font-sans bg-union-jack-grid">
        {/* Glow Effects */}
        <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[#1736D1]/20 blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-[#4A2DCC]/15 blur-[120px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#05144b]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6 text-center relative z-10"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1A3B]/10 flex items-center justify-center text-[#FF1A3B] border border-[#FF1A3B]/20">
              <svg className="w-6 h-6 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-glow-blue">Acceso Administrativo</h1>
            <p className="text-xs text-slate-300">Ingresa la contraseña para configurar las preguntas de nivelación.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-white/50 tracking-wider">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00B5F7] tracking-widest"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Contraseña incorrecta. Inténtalo de nuevo.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold uppercase transition-all cursor-pointer text-center"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#FF1A3B] hover:bg-[#E00F2E] text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(255,26,59,0.3)] cursor-pointer text-center"
              >
                Ingresar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Open Form to Add Question
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormLevel('A1');
    setFormCategory('Grammar');
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer(0);
    setFormExplanation('');
    setIsModalOpen(true);
  };

  // Open Form to Edit Question
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormLevel(q.level);
    setFormCategory(q.category);
    setFormText(q.text);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation);
    setIsModalOpen(true);
  };

  // Save changes from Form (Add or Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;
    if (formOptions.some(opt => !opt.trim())) return;

    let updatedList: Question[] = [];

    if (editingQuestion) {
      // Edit existing
      updatedList = questionsList.map(q => 
        q.id === editingQuestion.id 
          ? {
              ...q,
              level: formLevel,
              category: formCategory,
              text: formText,
              options: [...formOptions],
              correctAnswer: formCorrectAnswer,
              explanation: formExplanation
            }
          : q
      );
    } else {
      // Add new (calculate new auto-increment ID)
      const nextId = questionsList.length > 0 
        ? Math.max(...questionsList.map(q => q.id)) + 1 
        : 1;
      
      const newQuestion: Question = {
        id: nextId,
        level: formLevel,
        category: formCategory,
        text: formText,
        options: [...formOptions],
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation
      };
      updatedList = [...questionsList, newQuestion];
    }

    setQuestionsList(updatedList);
    setHasChanges(true);
    setIsModalOpen(false);
  };

  // Delete Question
  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta pregunta?')) {
      const updatedList = questionsList.filter(q => q.id !== id);
      setQuestionsList(updatedList);
      setHasChanges(true);
    }
  };

  // Reset to default list
  const handleReset = () => {
    if (window.confirm('¿Desea restaurar las 27 preguntas originales? Se perderán todos los cambios personalizados.')) {
      setQuestionsList([...DEFAULT_QUESTIONS]);
      setLevelWeights({ A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 });
      setLevelThresholds({ A2: 38, B1: 54, B2: 60, C1: 86 });
      setHasChanges(true);
    }
  };
  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('Tiene cambios sin guardar. ¿Está seguro de que desea salir? Se perderán las modificaciones.')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white py-8 px-4 md:px-8 font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Save Success Alert */}
        {showSaveSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider animate-bounce">
            <Check className="w-4.5 h-4.5" />
            <span>¡Cambios guardados con éxito en la base de datos!</span>
          </div>
        )}
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                Configuración del Test
              </h1>
              <p className="text-xs text-white/70">
                Añade, edita o elimina preguntas de nivelación en tiempo real.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#00B5F7] hover:bg-[#0092c7] text-white px-5 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-[0_4px_15px_rgba(0,181,247,0.4)] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#FF1A3B] hover:bg-[#E00F2E] text-white px-5 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-[0_4px_15px_rgba(255,26,59,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Pregunta</span>
            </button>
            
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 hover:text-[#FFC83D] transition-all text-white cursor-pointer"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(statsByLevel).map(([lvl, count]) => (
            <div key={lvl} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-xs text-white/60 font-black font-mono tracking-widest">{lvl}</span>
              <p className="text-2xl font-black mt-1 text-[#00B5F7]">{count}</p>
              <span className="text-[10px] text-white/40">preguntas</span>
            </div>
          ))}
        </div>

        {/* Collapsible Scoring Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setIsScoringCardOpen(!isScoringCardOpen)}
            className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm tracking-wider uppercase border-b border-white/5 bg-white/[0.02] cursor-pointer"
          >
            <span>Estructura de Puntuación Ponderada</span>
            <span className="text-xs">{isScoringCardOpen ? '▲ Ocultar' : '▼ Mostrar'}</span>
          </button>

          {isScoringCardOpen && (
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-white/70">
                Cada pregunta otorga puntos según su dificultad (nivel del MCER). El nivel estimado final se calcula en base al porcentaje obtenido sobre el puntaje máximo total.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Points Table */}
                <div className="md:col-span-2 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase font-black tracking-wider">
                        <th className="py-2.5">Nivel</th>
                        <th className="py-2.5 text-center">Peso por Pregunta</th>
                        <th className="py-2.5 text-center">Cantidad Actual</th>
                        <th className="py-2.5 text-right">Subtotal Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scoringSummary.summary.map((row) => (
                        <tr key={row.level} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-extrabold text-[#00B5F7] font-mono">{row.level}</td>
                          <td className="py-1.5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={row.weight}
                              onChange={(e) => handleWeightChange(row.level, e.target.value)}
                              className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-[#00B5F7] font-bold text-white cursor-pointer"
                            />
                          </td>
                          <td className="py-3 text-center text-white/80">{row.count} {row.count === 1 ? 'pregunta' : 'preguntas'}</td>
                          <td className="py-3 text-right font-black text-white/90">{row.subtotal} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Score Summary Box */}
                <div className="bg-[#0A2E9E]/20 border border-[#00B5F7]/30 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#00B5F7] tracking-widest font-mono">
                      Puntaje Máximo Total
                    </span>
                    <p className="text-4xl md:text-5xl font-black text-[#00B5F7] my-2">
                      {scoringSummary.totalPoints}
                    </p>
                    <span className="text-xs text-white/70 block">
                      puntos en total
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-4 border-t border-white/10 pt-3 w-full">
                    Ajustado automáticamente al añadir o eliminar preguntas.
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Collapsible Thresholds Scale Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setIsThresholdsCardOpen(!isThresholdsCardOpen)}
            className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm tracking-wider uppercase border-b border-white/5 bg-white/[0.02] cursor-pointer"
          >
            <span>Escala de Niveles y Límites de Puntaje (MCER)</span>
            <span className="text-xs">{isThresholdsCardOpen ? '▲ Ocultar' : '▼ Mostrar'}</span>
          </button>

          {isThresholdsCardOpen && (
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-white/70">
                Define el porcentaje mínimo requerido para obtener cada nivel de inglés. El sistema calculará automáticamente los rangos de puntos en base al puntaje total actual del examen.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase font-black tracking-wider">
                      <th className="py-2.5">Nivel</th>
                      <th className="py-2.5 text-center">Porcentaje Mínimo Requerido</th>
                      <th className="py-2.5 text-center">Rango Porcentual</th>
                      <th className="py-2.5 text-right">Rango de Puntos Equivalente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {thresholdSummary.map((row) => (
                      <tr key={row.level} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-extrabold text-[#00B5F7] font-mono">{row.level}</td>
                        <td className="py-1.5 text-center">
                          {row.level === 'A1' ? (
                            <span className="text-white/40 italic">Nivel base</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={row.minPct}
                                onChange={(e) => handleThresholdChange(row.level as keyof LevelThresholds, e.target.value)}
                                className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-[#00B5F7] font-bold text-white cursor-pointer"
                              />
                              <span className="text-white/60 font-bold">%</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center text-white/80">
                          {row.level === 'C1' ? (
                            <span>&ge; {row.minPct}%</span>
                          ) : row.level === 'A1' ? (
                            <span>&lt; {row.maxPct + 1}%</span>
                          ) : (
                            <span>{row.minPct}% a {row.maxPct}%</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-black text-white/90">
                          {row.level === 'C1' ? (
                            <span>&ge; {row.minPt} pts</span>
                          ) : row.level === 'A1' ? (
                            <span>0 a {row.maxPt} pts</span>
                          ) : (
                            <span>{row.minPt} a {row.maxPt} pts</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Leads Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setIsLeadsCardOpen(!isLeadsCardOpen)}
            className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm tracking-wider uppercase border-b border-white/5 bg-white/[0.02] cursor-pointer"
          >
            <span>Registro de Leads (Contactos)</span>
            <div className="flex items-center gap-3">
              <span className="bg-[#00B5F7]/20 text-[#00B5F7] px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                {leadsList.length}
              </span>
              <span className="text-xs">{isLeadsCardOpen ? '▲ Ocultar' : '▼ Mostrar'}</span>
            </div>
          </button>

          {isLeadsCardOpen && (
            <div className="p-6 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-white/70">
                  Lista de personas que han enviado el formulario de contacto al finalizar el examen. Puedes descargarla en formato CSV compatible con Microsoft Excel.
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={downloadLeadsCSV}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Excel (CSV)</span>
                  </button>
                  <button
                    onClick={handleClearLeads}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Limpiar Historial</span>
                  </button>
                </div>
              </div>

              {isLoadingLeads ? (
                <div className="text-center py-8 text-white/60 text-xs border border-dashed border-white/10 rounded-xl bg-black/10 flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#00B5F7]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Cargando registros desde la base de datos...</span>
                </div>
              ) : leadsList.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs border border-dashed border-white/10 rounded-xl bg-black/10">
                  No hay contactos registrados todavía en la base de datos.
                </div>
              ) : (
                <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/10">
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase font-black tracking-wider bg-white/[0.02]">
                        <th className="py-2.5 px-4">Distrito</th>
                        <th className="py-2.5 px-4">Contacto</th>
                        <th className="py-2.5 px-4 text-center">Nivel</th>
                        <th className="py-2.5 px-4">Programa Recomendado</th>
                        <th className="py-2.5 px-4 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leadsList.map((lead: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{lead.district || lead.fullName || 'No especificado'}</td>
                          <td className="py-3 px-4 text-white/80 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white/40">Cel:</span>
                              <span className="font-mono">{lead.phone}</span>
                              <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded font-sans text-white/60 lowercase">
                                ({lead.preferredContact})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
                              <span>Email:</span>
                              <span>{lead.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-[#00B5F7]/10 text-[#00B5F7] px-2 py-0.5 rounded font-mono font-bold">
                              {lead.estimatedLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white/70 max-w-[200px] truncate" title={lead.recommendedProgram}>
                            {lead.recommendedProgram}
                          </td>
                          <td className="py-3 px-4 text-right text-white/40 font-mono text-[10px]">
                            {new Date(lead.submittedAt).toLocaleDateString()} {new Date(lead.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Filter and Search Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {/* Level Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Nivel</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00B5F7] text-white cursor-pointer"
              >
                <option value="All" className="bg-slate-900">Todos los niveles</option>
                <option value="A1" className="bg-slate-900">A1</option>
                <option value="A2" className="bg-slate-900">A2</option>
                <option value="B1" className="bg-slate-900">B1</option>
                <option value="B2" className="bg-slate-900">B2</option>
                <option value="C1" className="bg-slate-900">C1</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00B5F7] text-white cursor-pointer"
              >
                <option value="All" className="bg-slate-900">Todas las categorías</option>
                <option value="Grammar" className="bg-slate-900">Grammar</option>
                <option value="Vocabulary" className="bg-slate-900">Vocabulary</option>
                <option value="Comprehension" className="bg-slate-900">Comprehension</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex flex-col gap-1 w-full md:max-w-md">
            <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por pregunta o explicación..."
              className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00B5F7] text-white w-full"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl py-12 text-center text-white/60">
              Ninguna pregunta coincide con los filtros aplicados.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between gap-4 items-start"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#004BDC] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider font-mono">
                      {q.level}
                    </span>
                    <span className="bg-white/10 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {q.category}
                    </span>
                    <span className="text-[9px] text-white/50 font-mono">ID: {q.id}</span>
                  </div>
                  
                  <h3 className="font-extrabold text-sm md:text-base leading-snug">
                    {q.text}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 border-l-2 border-white/10 py-1">
                    {q.options.map((opt, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`text-xs flex items-center gap-2 ${optIndex === q.correctAnswer ? 'text-green-400 font-bold' : 'text-white/70'}`}
                      >
                        <span className="font-mono w-4 shrink-0 text-white/40">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span>{opt}</span>
                        {optIndex === q.correctAnswer && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">Correcta</span>}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-white/60 bg-black/20 p-3 rounded-xl flex items-start gap-2 border border-white/5">
                    <HelpCircle className="w-4 h-4 text-[#00B5F7] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white/80 block mb-0.5">Explicación:</span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto border-t border-white/5 pt-3 md:border-t-0 md:pt-0 justify-end">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A2E9E] border border-white/15 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {editingQuestion ? 'Editar Pregunta' : 'Añadir Nueva Pregunta'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm text-left">
              {/* Level and Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-white/80 uppercase">Nivel</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as Question['level'])}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B5F7] cursor-pointer"
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                      <option key={lvl} value={lvl} className="bg-slate-900">{lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-white/80 uppercase">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Question['category'])}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B5F7] cursor-pointer"
                  >
                    {['Grammar', 'Vocabulary', 'Comprehension'].map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-white/80 uppercase">Enunciado de la Pregunta</label>
                <input
                  type="text"
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Ej: She ________ to the gym every Tuesday."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00B5F7]"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80 uppercase">Opciones y Respuesta Correcta</label>
                
                {formOptions.map((opt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formCorrectAnswer === index}
                      onChange={() => setFormCorrectAnswer(index)}
                      className="w-4 h-4 text-[#FF1A3B] focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20 cursor-pointer"
                      title="Marcar como respuesta correcta"
                    />
                    <span className="font-mono text-xs text-white/50 w-4">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formOptions];
                        newOptions[index] = e.target.value;
                        setFormOptions(newOptions);
                      }}
                      placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00B5F7]"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-white/80 uppercase">Explicación de la Respuesta</label>
                <textarea
                  required
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explica detalladamente por qué es la respuesta correcta."
                  className="w-full h-20 bg-black/30 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00B5F7]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#FF1A3B] hover:bg-[#E00F2E] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(255,26,59,0.3)] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Pregunta</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
