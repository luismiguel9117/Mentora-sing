import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Laptop, 
  Clock, 
  Globe2, 
  CheckCircle2, 
  Award, 
  Users, 
  Building2 
} from 'lucide-react';
import MascotLion from './MascotLion';

interface HeroLandingProps {
  onStartAssessment: () => void;
  onSeeSampleResults: () => void;
}

export default function HeroLanding({
  onStartAssessment,
  onSeeSampleResults,
}: HeroLandingProps) {
  
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center py-10 px-4 md:px-8 overflow-hidden bg-union-jack-grid">
      
      {/* Immersive background light leaks and glows */}
      <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[#1736D1]/20 blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#4A2DCC]/15 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN - CONTENT */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col justify-center text-left space-y-6"
        >
          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5.5xl xl:text-6xl font-sans font-black text-white tracking-tight leading-[1.08] uppercase"
          >
            Mide tu inglés <br />
            y accede a mejores <br />
            oportunidades
          </motion.h1>

          {/* Benefits Badges Grid (Matching reference layout) */}
          <motion.div
            variants={itemVariants}
            className="space-y-3 max-w-xl"
          >
            {/* Red benefit pill (Clases 100% virtual) */}
            <div className="bg-[#FF1A3B] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs md:text-sm shadow-[0_4px_15px_rgba(255,26,59,0.3)] w-fit">
              <Laptop className="w-4 h-4 text-white" />
              <span>Evaluación 100% gratis y en línea</span>
            </div>

            {/* 2x2 Grid of white benefit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1 */}
              <div className="bg-white text-slate-800 p-3 rounded-xl shadow-md flex items-center gap-3 border border-slate-100 text-xs md:text-sm font-semibold">
                <div className="w-8 h-8 rounded-lg bg-[#FF1A3B]/10 flex items-center justify-center text-[#FF1A3B] shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span>Mide tu nivel en solo 5 minutos</span>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white text-slate-800 p-3 rounded-xl shadow-md flex items-center gap-3 border border-slate-100 text-xs md:text-sm font-semibold">
                <div className="w-8 h-8 rounded-lg bg-[#FF1A3B]/10 flex items-center justify-center text-[#FF1A3B] shrink-0">
                  <Globe2 className="w-4.5 h-4.5" />
                </div>
                <span>Estándar oficial MCER (A1 - C1)</span>
              </div>

              {/* Card 3 */}
              <div className="bg-white text-slate-800 p-3 rounded-xl shadow-md flex items-center gap-3 border border-slate-100 text-xs md:text-sm font-semibold">
                <div className="w-8 h-8 rounded-lg bg-[#FF1A3B]/10 flex items-center justify-center text-[#FF1A3B] shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span>Reporte de resultados inmediato</span>
              </div>

              {/* Card 4 */}
              <div className="bg-white text-slate-800 p-3 rounded-xl shadow-md flex items-center gap-3 border border-slate-100 text-xs md:text-sm font-semibold">
                <div className="w-8 h-8 rounded-lg bg-[#FF1A3B]/10 flex items-center justify-center text-[#FF1A3B] shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <span>Certificación de nivel estimada</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            {/* Red button Iniciar Test */}
            <button
              onClick={onStartAssessment}
              className="group flex items-center justify-center gap-2 bg-[#FF1A3B] hover:bg-[#E00F2E] text-white font-sans font-black tracking-wider uppercase rounded-full px-8 py-4 transition-all duration-300 shadow-[0_6px_20px_rgba(255,26,59,0.45)] hover:scale-[1.03] cursor-pointer text-center text-sm"
              id="cta-start-free-test"
            >
              <span>Quiero medir mi nivel</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 stroke-[3px]" />
            </button>

            {/* Outline button demo */}
            <button
              onClick={onSeeSampleResults}
              className="flex items-center justify-center border border-white hover:bg-white/10 text-white font-sans font-bold tracking-wider uppercase rounded-full px-8 py-4 hover:scale-[1.03] transition-all cursor-pointer text-sm"
            >
              <span>Ver reporte de ejemplo</span>
            </button>
          </motion.div>

          {/* Bottom highlights / stats (Matching reference) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-[11px] font-bold text-white/90 border-t border-white/10 max-w-xl"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00B5F7]" />
              <span>+17 años de experiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00B5F7]" />
              <span>+50k alumnos formados</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00B5F7]" />
              <span>Empresa peruana del año 2021-2024</span>
            </div>
          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN - MASCOT LION WITH FLOATING BADGES (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="hidden lg:flex lg:col-span-5 items-center justify-center relative lg:mt-0"
        >
          {/* Main 3D Mascot Lion */}
          <div className="relative w-full max-w-md mx-auto min-h-[380px] md:min-h-[460px] flex items-center justify-center">
            <MascotLion
              state="welcome"
              className="w-full h-auto animate-float-slow object-contain"
            />



            {/* Floating Blue Badge */}
            <div className="absolute -bottom-4 -left-2 bg-[#004BDC] text-white py-2 px-3.5 md:py-3 md:px-5 rounded-2xl shadow-[0_10px_25px_rgba(0,75,220,0.4)] flex flex-col items-start select-none rotate-[-6deg] border border-white/10">
              <span className="text-[8px] md:text-[10px] font-black tracking-widest text-[#00B5F7] uppercase">Evaluación</span>
              <span className="text-base md:text-xl font-black tracking-tight leading-none mt-0.5 md:mt-1">100% GRATIS</span>
              <span className="text-[7px] md:text-[9px] font-bold text-white/80 mt-0.5 md:mt-1 uppercase">Sin tarjeta de crédito</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
