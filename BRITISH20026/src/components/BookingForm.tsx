/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { ConsultationForm } from '../types';
import { supabase } from '../lib/supabase';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'info' | 'consultation';
  estimatedLevel?: string;
  recommendedProgram?: string;
  isPreQuiz?: boolean;
  onSubmitSuccess?: (data: { email: string; phone: string; district: string }) => void;
}

export default function BookingForm({
  isOpen,
  onClose,
  initialType = 'info',
  estimatedLevel = 'B1',
  recommendedProgram = 'Regular English Program',
  isPreQuiz = false,
  onSubmitSuccess,
}: BookingFormProps) {
  const [formData, setFormData] = useState<ConsultationForm>({
    email: '',
    phone: '',
    district: '',
    preferredContact: 'whatsapp',
    termsAccepted: true,
  });
  const [errors, setErrors] = useState<Partial<ConsultationForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Partial<ConsultationForm> = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, ingresa tu correo electrónico.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Por favor, ingresa tu celular.';
    } else if (phoneDigits.length < 9) {
      newErrors.phone = 'El celular debe tener al menos 9 dígitos.';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Por favor, ingresa tu distrito.';
    } else if (formData.district.trim().length < 3) {
      newErrors.district = 'El distrito debe tener al menos 3 caracteres.';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = true as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const submittedAt = new Date().toISOString();
    const leadData = {
      email: formData.email,
      phone: formData.phone,
      district: formData.district,
      preferred_contact: 'whatsapp',
      estimated_level: isPreQuiz ? 'PRE-QUIZ' : estimatedLevel,
      recommended_program: isPreQuiz ? 'PRE-QUIZ' : recommendedProgram,
      submitted_at: submittedAt
    };

    // 1. Guardar en Supabase
    try {
      console.log('Intentando guardar lead en Supabase...', leadData);
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      console.log('Resultado de Supabase (Insert):', { data, error });

      if (error) {
        console.error('Error saving lead to Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to save lead to Supabase:', err);
    }

    // 2. Guardar en localStorage como respaldo local
    try {
      const stored = localStorage.getItem('bh_quiz_leads');
      const leads = stored ? JSON.parse(stored) : [];
      const localLead = {
        email: formData.email,
        phone: formData.phone,
        district: formData.district,
        preferredContact: 'whatsapp',
        estimatedLevel: isPreQuiz ? 'PRE-QUIZ' : estimatedLevel,
        recommendedProgram: isPreQuiz ? 'PRE-QUIZ' : recommendedProgram,
        submittedAt: submittedAt
      };
      leads.push(localLead);
      localStorage.setItem('bh_quiz_leads', JSON.stringify(leads));

      // Push data to Google Tag Manager dataLayer
      const dl = (window as any).dataLayer || [];
      dl.push({
        event: 'lead_form_submitted',
        estimatedLevel: isPreQuiz ? 'PRE-QUIZ' : estimatedLevel,
        recommendedProgram: isPreQuiz ? 'PRE-QUIZ' : recommendedProgram,
        preferredContact: 'whatsapp'
      });
      (window as any).dataLayer = dl;
    } catch (err) {
      console.error('Failed to save lead info locally', err);
    }

    setIsSubmitting(false);
    if (isPreQuiz) {
      if (onSubmitSuccess) {
        onSubmitSuccess({
          email: formData.email,
          phone: formData.phone,
          district: formData.district
        });
      }
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020925]/60 backdrop-blur-sm z-30"
          />

          {/* Modal Card container (White & Minimalist) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-40 text-slate-800"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 pt-7 pb-4 text-slate-800 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex gap-2 mb-2">
                {!isPreQuiz ? (
                  <>
                    <span className="text-[9px] bg-[#0A2E9E] text-white font-sans font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      Nivel {estimatedLevel} Estimado
                    </span>
                    <span className="text-[9px] bg-slate-100 font-sans font-bold text-slate-600 uppercase tracking-wider px-3 py-1 rounded-full">
                      Admisiones British House
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] bg-[#0A2E9E] text-white font-sans font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Registro de Nivelación
                  </span>
                )}
              </div>

              <h2 className="text-lg font-sans font-black uppercase tracking-wide text-slate-900 mt-1">
                {isPreQuiz ? 'Ingresa tus datos para empezar' : (initialType === 'info' ? 'Solicitar Malla Curricular' : 'Reservar Asesoría Gratuita')}
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                {isPreQuiz
                  ? 'Por favor, completa esta información rápida para poder habilitar tu test de 10 preguntas.'
                  : (initialType === 'info'
                      ? `Descubre la duración, precios y beneficios de estudiar el programa: ${recommendedProgram}.`
                      : 'Agenda una llamada corta de 5 minutos con un especialista para trazar tu ruta académica.')}
              </p>
            </div>

            {/* Modal Form body */}
            <div className="p-6 bg-white">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 text-center text-slate-850"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-600 mb-4 shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-lg font-sans font-black text-slate-900 uppercase tracking-wide mb-1.5">
                      ¡Registro Exitoso!
                    </h3>
                    <p className="text-xs font-sans text-slate-650 max-w-sm mb-5 leading-relaxed font-medium">
                      Muchas gracias por registrarte.
                      Tu nivel estimado es <span className="font-bold text-[#0A2E9E] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded ml-1">{estimatedLevel}</span>. 
                      Un asesor educativo calificado se comunicará contigo en los próximos minutos para brindarte asesoría gratuita de admisión.
                    </p>
                    
                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2 mb-5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-400 uppercase text-[9px] tracking-wider">CENTRO DE ADMISIONES:</span>
                        <span className="font-bold text-slate-800">British House - Perú</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-400 uppercase text-[9px] tracking-wider">TIEMPO ESTIMADO:</span>
                        <span className="font-semibold text-emerald-600">Menos de 10 minutos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-400 uppercase text-[9px] tracking-wider">PROGRAMA RECOMENDADO:</span>
                        <span className="font-bold text-slate-800">{recommendedProgram}</span>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-855 text-white font-sans font-black tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer text-xs"
                    >
                      Cerrar Ventana
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 font-sans text-left"
                  >
                    {/* Course outline indicator */}
                    {!isPreQuiz && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">RECOMENDADO:</span>
                        <span className="font-extrabold text-[#0A2E9E] bg-[#0A2E9E]/5 px-2.5 py-0.5 rounded-lg border border-[#0A2E9E]/10">
                          {recommendedProgram}
                        </span>
                      </div>
                    )}

                    {/* Correo Electrónico */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          placeholder="Ej. juan.perez@gmail.com"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                            errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-slate-400'
                          } text-slate-900 placeholder-slate-400 text-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100/50 transition-all`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-505 text-xs mt-1 font-bold">{errors.email}</p>
                      )}
                    </div>

                    {/* Celular */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
                        Celular (WhatsApp)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          placeholder="Ej. 987654321"
                          maxLength={15}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                            errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-slate-400'
                          } text-slate-900 placeholder-slate-400 text-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100/50 transition-all`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-505 text-xs mt-1 font-bold">{errors.phone}</p>
                      )}
                    </div>

                    {/* Distrito */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
                        Distrito
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => {
                            setFormData({ ...formData, district: e.target.value });
                            if (errors.district) setErrors({ ...errors, district: '' });
                          }}
                          placeholder="Ej. Miraflores"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                            errors.district ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-slate-400'
                          } text-slate-900 placeholder-slate-400 text-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100/50 transition-all`}
                        />
                      </div>
                      {errors.district && (
                        <p className="text-red-505 text-xs mt-1 font-bold">{errors.district}</p>
                      )}
                    </div>

                    {/* Terms & Conditions Box */}
                    <div className="flex items-start gap-2 pt-1 text-left">
                      <input
                        id="privacy-terms-checkbox"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => {
                          setFormData({ ...formData, termsAccepted: e.target.checked });
                          if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: false as any });
                        }}
                        className={`w-4 h-4 rounded mt-0.5 text-[#0A2E9E] focus:ring-slate-100 bg-slate-50 cursor-pointer ${
                          errors.termsAccepted ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      <label htmlFor="privacy-terms-checkbox" className="text-[10px] leading-relaxed text-slate-500 select-none cursor-pointer">
                        Acepto recibir la malla del curso e invitaciones académicas confidenciales de British House Perú en conformidad con la política de seguridad de datos. Conexión encriptada SSL.
                      </label>
                    </div>

                    {/* ACCENT SUBMISSION BUTTON */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 mt-3 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black tracking-widest uppercase rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          {isPreQuiz ? 'Comenzar Test Ahora' : 'Enviar Información'}
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#0A2E9E] uppercase tracking-widest mt-3.5 font-bold font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0A2E9E]" />
                      <span>Preparación Oficial Cambridge • Conexión Segura</span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
