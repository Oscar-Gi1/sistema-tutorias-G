import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AsignacionTutorado, Tutor, RolSimulado } from '../types/tutoria';
import { formatSemestre } from '../utils/tutoriaUtils';

interface RightPanelProps {
  rolActivo: RolSimulado;
  tutorActivo: Tutor;
  totalTutorados: number;
  alumnosEnRiesgo: AsignacionTutorado[];
  promedioGeneral: string;
  totalNotas: number;
  onAbrirAsignarModal: () => void;
  onVerDirectorio: () => void;
  onVerCalendario: () => void;
  onSeleccionarTutorado?: (asig: AsignacionTutorado) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  rolActivo,
  tutorActivo,
  totalTutorados,
  alumnosEnRiesgo,
  promedioGeneral,
  totalNotas,
  onAbrirAsignarModal,
  onVerDirectorio,
  onVerCalendario,
  onSeleccionarTutorado
}) => {
  // Porcentaje simulado de cumplimiento de sesiones planeadas
  const metaSesiones = Math.max(totalTutorados * 2, 10);
  const porcentajeCumplimiento = Math.min(Math.round((totalNotas / metaSesiones) * 100), 100);

  return (
    <aside className="space-y-6">
      {/* 1. Tarjeta Urgente Resaltada en Coral / Salmón (#FF7F50): "Próxima Acción" */}
      <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border-2 border-[#FF7F50] relative overflow-hidden transition-all">
        {/* Glow sutil en esquina */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF7F50]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7F50] animate-pulse" />
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#FF7F50]">
              Próxima Acción Prioritaria
            </span>
          </div>
          <span className="bg-[#FF7F50]/15 text-[#C4431B] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FF7F50]/30">
            Urgente
          </span>
        </div>

        {alumnosEnRiesgo.length > 0 ? (
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white leading-tight">
              {alumnosEnRiesgo.length} {alumnosEnRiesgo.length === 1 ? 'Alumno en Riesgo' : 'Alumnos en Riesgo'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-4 leading-relaxed">
              Requieren regularización preventiva y acuerdo de compromisos antes de la evaluación parcial.
            </p>

            {/* Ficha limpia del alumno prioritario */}
            <div className="p-3.5 bg-[#FFF5F2] dark:bg-rose-950/20 rounded-xl border border-[#FF7F50]/30 mb-4">
              <span className="font-heading font-semibold text-xs text-slate-900 dark:text-white block truncate">
                {alumnosEnRiesgo[0].estudiante.nombre}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400 block truncate mt-0.5">
                {alumnosEnRiesgo[0].estudiante.carrera} &bull; Promedio: <strong className="text-[#FF7F50]">{alumnosEnRiesgo[0].estudiante.promedio}</strong>
              </span>
            </div>

            {/* Un solo botón principal en la tarjeta */}
            <button
              onClick={() => {
                if (onSeleccionarTutorado) {
                  onSeleccionarTutorado(alumnosEnRiesgo[0]);
                } else {
                  onVerDirectorio();
                }
              }}
              className="w-full py-2.5 px-4 bg-[#FF7F50] hover:bg-[#E86C3D] active:bg-[#D95F31] text-white text-xs font-semibold rounded-[12px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Atender Caso Prioritario</span>
            </button>
          </div>
        ) : (
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Todo al día en tu grupo
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-4">
              No tienes alertas académicas activas sin atender. ¡Excelente labor de seguimiento!
            </p>
            <button
              onClick={onVerDirectorio}
              className="w-full py-2.5 px-4 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-[12px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Ver Directorio de Alumnos</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Resumen Rápido con Gráfico de Progreso Verde Menta (#20B2AA) */}
      <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
            Avance del Plan Escolar
          </span>
          <span className="text-[11px] font-mono text-[#20B2AA] bg-[#20B2AA]/10 px-2 py-0.5 rounded-full font-bold">
            Ciclo 2026-1
          </span>
        </div>

        {/* Gráfico de Progreso Verde Menta (#20B2AA) */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-slate-400 font-medium">
              Sesiones Registradas
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {porcentajeCumplimiento}%
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-[#20B2AA]"
              style={{ width: `${porcentajeCumplimiento}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 text-right">
            {totalNotas} de {metaSesiones} sesiones proyectadas
          </p>
        </div>

        {/* Cuadrícula de Métricas Resumidas */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold block">
              Tutorados
            </span>
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white mt-0.5 block">
              {totalTutorados}
            </span>
            <span className="text-[10px] text-[#20B2AA] font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Asignados
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold block">
              Promedio
            </span>
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white mt-0.5 block">
              {promedioGeneral}
            </span>
            <span className="text-[10px] text-[#64748B] dark:text-slate-400">
              Escala de 10
            </span>
          </div>
        </div>
      </div>

      {/* 3. Acción Principal Única: Asignar Alumno */}
      {rolActivo === 'TUTOR' && (
        <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            Gestión Rápida
          </h4>

          <button
            onClick={onAbrirAsignarModal}
            className="w-full py-3 px-4 bg-[#20B2AA] hover:bg-[#1CA099] active:bg-[#178B85] text-white rounded-[12px] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Asignar Nuevo Alumno</span>
          </button>
        </div>
      )}

      {/* 4. Recordatorio Institucional Rápido */}
      <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#20B2AA]" />
          <h4 className="font-heading font-semibold text-xs text-slate-900 dark:text-white">
            Recordatorio del Periodo
          </h4>
        </div>
        <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
          El primer corte de bitácoras institucionales concluye el <strong className="text-slate-800 dark:text-slate-200">28 de Octubre</strong>. Registra las notas de acuerdos de cada sesión a tiempo.
        </p>
      </div>
    </aside>
  );
};
