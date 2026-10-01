import React from 'react';
import { AsignacionTutorado } from '../types/tutoria';
import { formatSemestre, getCarreraCorta, getEstadoConfig } from '../utils/tutoriaUtils';
import { AvatarWithFallback } from './AvatarWithFallback';
import { BookOpen, GraduationCap, Award, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

interface StudentCardProps {
  asignacion: AsignacionTutorado;
  onSeleccionar: (asignacion: AsignacionTutorado) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ asignacion, onSeleccionar }) => {
  const est = asignacion.estudiante;
  const estadoCfg = getEstadoConfig(asignacion.estado);
  const esRiesgo = asignacion.estado === 'EN_RIESGO';
  const esCondicionado = asignacion.estado === 'CONDICIONADO';

  // Porcentaje estimado de avance curricular (base 9 semestres)
  const avanceEstimado = Math.min(100, Math.round((est.semestre / 9) * 100));

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
        esRiesgo
          ? 'border-rose-300 dark:border-rose-500/60 shadow-rose-100/50 dark:shadow-rose-950/20'
          : esCondicionado
          ? 'border-amber-300 dark:border-amber-500/50'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50'
      }`}
    >
      {/* Barra de acento prioritario a la izquierda para alumnos en riesgo */}
      {esRiesgo && (
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500" />
      )}
      {esCondicionado && (
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
      )}

      <div>
        {/* Cabecera de la Tarjeta: Avatar, Datos básicos y Estado */}
        <div className="flex items-start justify-between gap-3 mb-3 pl-1">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithFallback
              src={est.avatar}
              alt={est.nombre}
              className="w-12 h-12 rounded-xl ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                {est.nombre}
              </h4>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block tracking-tight">
                {est.matricula}
              </span>
            </div>
          </div>

          {/* Badge de Estado con diseño corporativo y alto contraste */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${estadoCfg.badgeClass}`}
            title={`Estado: ${estadoCfg.label}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dotClass}`} />
            <span>{estadoCfg.label}</span>
          </div>
        </div>

        {/* ETIQUETAS DESTACADAS: Semestre Actual y Carrera */}
        <div className="my-3 pl-1 flex items-center gap-2 flex-wrap">
          {/* Badge claro del Semestre */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold text-xs shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{formatSemestre(est.semestre)}</span>
          </div>

          {/* Badge del Programa Académico */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
            title={est.carrera}
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{getCarreraCorta(est.carrera)}</span>
          </span>
        </div>

        {/* Panel de Datos Académicos y Periodo */}
        <div className="space-y-2 text-xs my-3 bg-slate-50/80 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Ciclo Escolar:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px]">
              {asignacion.periodoEscolar}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Promedio General:</span>
            <span
              className={`font-mono font-bold text-xs tabular-nums flex items-center gap-1 ${
                est.promedio >= 8.5
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : est.promedio >= 7.0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400 font-extrabold'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {est.promedio.toFixed(1)} / 10
            </span>
          </div>

          {/* Barra de progreso de avance semestral */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-900">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Progreso de Carrera</span>
              <span className="font-mono">{avanceEstimado}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${avanceEstimado}%` }}
              />
            </div>
          </div>
        </div>

        {/* Observaciones o diagnóstico */}
        {asignacion.observaciones && (
          <div className="text-[11px] text-slate-600 dark:text-slate-300 italic mb-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-lg flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">&ldquo;{asignacion.observaciones}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Pie de la Tarjeta */}
      <div className="border-t border-slate-100 dark:border-slate-800/90 pt-3 mt-1 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{asignacion.notas?.length || 0} notas en bitácora</span>
        </span>

        <button
          onClick={() => onSeleccionar(asignacion)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
        >
          <span>Ficha y Bitácora</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
