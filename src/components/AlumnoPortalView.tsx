import React, { useState, useEffect } from 'react';
import { EstudianteCatalogo, Tutor, AsignacionTutorado, CitaAsesoria, SolicitarAsesoriaPayload } from '../types/tutoria';
import { tutoriaService } from '../services/tutoriaService';
import { formatSemestre, getEstadoConfig } from '../utils/tutoriaUtils';
import { AvatarWithFallback } from './AvatarWithFallback';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Trash2,
  Plus
} from 'lucide-react';

interface NotaPersonal {
  id: number;
  texto: string;
  fecha: string;
}

interface AlumnoPortalViewProps {
  estudianteActivo: EstudianteCatalogo;
  onCambiarEstudiante: (estudiante: EstudianteCatalogo) => void;
  catalogoEstudiantes: EstudianteCatalogo[];
}

export const AlumnoPortalView: React.FC<AlumnoPortalViewProps> = ({
  estudianteActivo
}) => {
  const [asignacion, setAsignacion] = useState<AsignacionTutorado | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [citas, setCitas] = useState<CitaAsesoria[]>([]);
  const [modalSolicitarAbierto, setModalSolicitarAbierto] = useState(false);

  // Notas Personales del estudiante
  const [notasPersonales, setNotasPersonales] = useState<NotaPersonal[]>([
    {
      id: 1,
      texto: 'Preguntar al Dr. Mendoza sobre los requisitos de titulación por promedio y seminario.',
      fecha: '14 de octubre, 2026'
    },
    {
      id: 2,
      texto: 'Repasar apuntes de la unidad 2 antes de la sesión presencial de este jueves a las 11:00 AM.',
      fecha: '12 de octubre, 2026'
    }
  ]);
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');

  const handleAgregarNota = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevaNotaTexto.trim()) return;

    const nueva: NotaPersonal = {
      id: Date.now(),
      texto: nuevaNotaTexto.trim(),
      fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setNotasPersonales(prev => [nueva, ...prev]);
    setNuevaNotaTexto('');
  };

  const handleEliminarNota = (id: number) => {
    setNotasPersonales(prev => prev.filter(n => n.id !== id));
  };

  // Formulario de solicitud de cita
  const [tema, setTema] = useState('Dificultad Académica en Materias');
  const [fecha, setFecha] = useState('2026-10-15');
  const [hora, setHora] = useState('11:00 AM');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [motivoDetalle, setMotivoDetalle] = useState('');
  const [enviandoCita, setEnviandoCita] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarDatosAlumno = async () => {
    const res = await tutoriaService.getMiTutoriaComoAlumno(estudianteActivo.id);
    if (res.success && res.data) {
      setAsignacion(res.data.asignacion);
      setTutor(res.data.tutor);
      setCitas(res.data.citas);
    }
  };

  useEffect(() => {
    cargarDatosAlumno();
    const unsub = tutoriaService.subscribe(() => {
      cargarDatosAlumno();
    });
    return () => unsub();
  }, [estudianteActivo.id]);

  const estadoCfg = asignacion ? getEstadoConfig(asignacion.estado) : null;
  const esRiesgo = asignacion?.estado === 'EN_RIESGO';

  const handleSolicitarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;

    setEnviandoCita(true);
    setMensajeExito(null);

    const payload: SolicitarAsesoriaPayload = {
      estudianteId: estudianteActivo.id,
      tutorId: tutor.id,
      tema,
      fecha,
      hora,
      modalidad,
      motivoDetalle
    };

    const res = await tutoriaService.solicitarCitaComoAlumno(payload);
    setEnviandoCita(false);

    if (res.success) {
      setMensajeExito('¡Tu solicitud de cita ha sido confirmada y enviada a tu tutor!');
      setTimeout(() => {
        setModalSolicitarAbierto(false);
        setMensajeExito(null);
        setMotivoDetalle('');
      }, 1400);
    }
  };

  const handleCancelarCita = async (citaId: string) => {
    if (confirm('¿Deseas cancelar esta sesión de tutoría?')) {
      await tutoriaService.cancelarCitaComoAlumno(citaId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. SECCIÓN SUPERIOR (HERO): Perfil Horizontal Limpio     */}
      {/* Todo el ancho superior: Nombre, Carrera, Semestre, Estado*/}
      {/* y Promedio. Sin botones duplicados en esta barra.        */}
      {/* ======================================================== */}
      <section className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <AvatarWithFallback
              src={estudianteActivo.avatar}
              alt={estudianteActivo.nombre}
              className="w-16 h-16 rounded-2xl ring-2 ring-[#20B2AA]/30 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-semibold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  {estudianteActivo.nombre}
                </h1>
                {estadoCfg && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 ${estadoCfg.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dotClass}`} />
                    <span>{estadoCfg.label}</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-[#64748B] dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[#0E7470] dark:text-[#20B2AA] font-semibold bg-[#20B2AA]/10 px-2 py-0.5 rounded border border-[#20B2AA]/30">
                  {estudianteActivo.matricula}
                </span>
                <span>&bull;</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {estudianteActivo.carrera}
                </span>
                <span>&bull;</span>
                <span className="font-semibold text-[#20B2AA]">
                  {formatSemestre(estudianteActivo.semestre)}
                </span>
              </div>
            </div>
          </div>

          {/* Promedio Acumulado */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-left sm:text-right shrink-0">
            <span className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-bold tracking-wider block">
              Promedio Acumulado
            </span>
            <span className="font-heading font-bold text-2xl text-[#20B2AA] tabular-nums">
              {estudianteActivo.promedio.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ 10</span>
            </span>
          </div>
        </div>

        {/* Alerta de regularización si aplica */}
        {esRiesgo && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#FFF5F2] dark:bg-rose-950/30 border border-[#FF7F50]/40 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF7F50] shrink-0" />
            <p className="text-[#C4431B] dark:text-rose-300 text-xs leading-relaxed">
              <strong>Atención Académica:</strong> Tienes una recomendación de regularización preventiva en este ciclo escolar.
            </p>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. CUERPO PRINCIPAL: Grid de 2 Columnas Equilibradas     */}
      {/* Columna Izquierda: Mi Tutor con ÚNICO Botón Verde Grande */}
      {/* Columna Derecha: Mi Actividad (Próximas Sesiones y Notas)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ------------------------------------------------------ */}
        {/* COLUMNA IZQUIERDA (5 cols): Tarjeta Destacada Mi Tutor */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-heading font-semibold text-xs uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#20B2AA]" />
                Mi Docente Tutor Asignado
              </span>
              <span className="text-[10px] font-mono text-[#20B2AA] bg-[#20B2AA]/10 px-2 py-0.5 rounded-full font-bold">
                Ciclo 2026-1
              </span>
            </div>

            {tutor ? (
              <div className="space-y-5">
                {/* Perfil del Tutor */}
                <div className="flex items-center gap-4">
                  <AvatarWithFallback
                    src={tutor.avatar}
                    alt={tutor.nombre}
                    className="w-16 h-16 rounded-2xl ring-2 ring-[#20B2AA]/30 shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
                      {tutor.nombre}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      {tutor.departamento}
                    </p>
                    <span className="text-xs text-[#20B2AA] font-medium inline-block mt-0.5">
                      {tutor.cubículo}
                    </span>
                  </div>
                </div>

                {/* Datos de Contacto y Atención */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={`mailto:${tutor.email}`} className="text-[#20B2AA] hover:underline truncate">
                      {tutor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Atención presencial en {tutor.cubículo}</span>
                  </div>
                </div>

                {/* ÚNICO BOTÓN PRINCIPAL VERDE MENTA GRANDE */}
                <div className="pt-2">
                  <button
                    onClick={() => setModalSolicitarAbierto(true)}
                    className="w-full py-3.5 px-4 bg-[#20B2AA] hover:bg-[#1CA099] active:bg-[#178B85] text-white rounded-[12px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Cita / Solicitar Asesoría</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#64748B] dark:text-slate-500">
                Actualmente no tienes un tutor asignado para este periodo.
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* COLUMNA DERECHA (7 cols): Mi Actividad (Citas y Notas) */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tarjeta 1: Próximas Sesiones Agendadas */}
          <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#20B2AA]" />
                <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                  Próximas Sesiones Agendadas ({citas.length})
                </h2>
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                Agenda del ciclo
              </span>
            </div>

            {/* Listado de Citas */}
            <div className="space-y-3">
              {citas.length > 0 ? (
                citas.map((cita) => {
                  const esVirtual = cita.modalidad === 'Virtual';
                  const esCancelada = cita.estado === 'Cancelada';

                  return (
                    <div
                      key={cita.id}
                      className={`p-4 rounded-xl border transition-all ${
                        esCancelada
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-[#20B2AA]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              esCancelada
                                ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                : cita.estado === 'Confirmada'
                                ? 'bg-[#20B2AA]/15 text-[#0E7470] dark:text-[#20B2AA] border-[#20B2AA]/30'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                            }`}>
                              {cita.estado}
                            </span>

                            <span className="text-[10px] font-medium text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                              {esVirtual ? <Video className="w-3 h-3 text-sky-500" /> : <MapPin className="w-3 h-3 text-[#20B2AA]" />}
                              {cita.modalidad}
                            </span>
                          </div>

                          <h3 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5">
                            {cita.tema}
                          </h3>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1 sm:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-[#20B2AA]" />
                            {cita.fecha}
                          </span>
                          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono flex items-center gap-1 sm:justify-end">
                            <Clock className="w-3 h-3" />
                            {cita.hora}
                          </span>
                        </div>
                      </div>

                      {/* Motivo o detalle */}
                      {cita.motivoDetalle && (
                        <p className="text-[11px] text-[#64748B] dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 mt-2">
                          {cita.motivoDetalle}
                        </p>
                      )}

                      {/* Enlace o lugar y botón cancelar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                          {esVirtual && cita.enlaceVirtual ? (
                            <a
                              href={cita.enlaceVirtual}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Enlace a Google Meet</span>
                            </a>
                          ) : (
                            <span>Lugar: {cita.lugar || tutor?.cubículo || 'Cubículo de tutoría'}</span>
                          )}
                        </div>

                        {!esCancelada && (
                          <button
                            onClick={() => handleCancelarCita(cita.id)}
                            className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            Cancelar cita
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-[#64748B] dark:text-slate-400 space-y-1">
                  <Calendar className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                  <p>No tienes citas o asesorías agendadas actualmente.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta 2: Bitácora & Acuerdos */}
          <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-heading font-semibold text-xs uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#20B2AA]" />
                Bitácora & Acuerdos con el Tutor ({asignacion?.notas?.length || 0})
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {asignacion?.notas && asignacion.notas.length > 0 ? (
                asignacion.notas.map((nota) => (
                  <div
                    key={nota.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#0E7470] dark:text-[#20B2AA] bg-[#20B2AA]/10 px-2 py-0.5 rounded border border-[#20B2AA]/30">
                        {nota.tipo}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(nota.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed pt-1">
                      {nota.contenido}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#64748B] dark:text-slate-500 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No hay notas o acuerdos registrados aún en tu bitácora escolar.
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta 3: 📝 Mis Notas Personales (Funcionalidad Interactiva) */}
          <div className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  📝 Mis Notas Personales
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Espacio privado para tus apuntes, dudas y recordatorios
                </p>
              </div>
              {notasPersonales.length > 0 && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {notasPersonales.length}
                </span>
              )}
            </div>

            {/* Zona de entrada */}
            <form onSubmit={handleAgregarNota} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <textarea
                value={nuevaNotaTexto}
                onChange={(e) => setNuevaNotaTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAgregarNota();
                  }
                }}
                rows={2}
                placeholder="Escribe un recordatorio o duda para tu próxima tutoría..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#20B2AA] resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Presiona Enter o haz clic en Añadir</span>
                <button
                  type="submit"
                  disabled={!nuevaNotaTexto.trim()}
                  className="px-3.5 py-1.5 bg-[#20B2AA] hover:bg-[#1CA099] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Añadir</span>
                </button>
              </div>
            </form>

            {/* Lista de notas con fondo ultra claro #F1F5F9 */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {notasPersonales.length > 0 ? (
                notasPersonales.map((nota) => (
                  <div
                    key={nota.id}
                    className="p-3 bg-[#F1F5F9] dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3 group transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium block mb-1">
                        {nota.fecha}
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                        {nota.texto}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminarNota(nota.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Aún no tienes notas personales guardadas. Escribe arriba para añadir tu primera nota.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal / Formulario Flotante para Solicitar Asesoría */}
      {modalSolicitarAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalSolicitarAbierto(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto">
            {/* Cabecera */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#20B2AA]/15 text-[#20B2AA] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Solicitar Cita de Asesoría
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Con tu tutor: <strong className="text-slate-700 dark:text-slate-200">{tutor?.nombre}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalSolicitarAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSolicitarCita} className="p-5 space-y-4">
              {mensajeExito && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="font-semibold">{mensajeExito}</p>
                </div>
              )}

              {/* Tema o Asunto */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Motivo Principal de la Asesoría <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#20B2AA] cursor-pointer"
                >
                  <option value="Dificultad Académica en Materias">Dificultad Académica en Materias</option>
                  <option value="Asesoría para Proyecto de Titulación">Asesoría para Proyecto de Titulación</option>
                  <option value="Trámites Escolares / Beca Universitaria">Trámites Escolares / Beca Universitaria</option>
                  <option value="Orientación Vocacional y Curricular">Orientación Vocacional y Curricular</option>
                  <option value="Situación Personal / Canalización">Situación Personal / Canalización</option>
                  <option value="Otro Asunto General">Otro Asunto General</option>
                </select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Fecha Propuesta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Horario Preferido <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#20B2AA] cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Modalidad de Atención
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalidad('Presencial')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalidad === 'Presencial'
                        ? 'bg-[#20B2AA]/15 border-[#20B2AA] text-[#0E7470] dark:text-[#20B2AA] font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Presencial ({tutor?.cubículo?.split(',')[1]?.trim() || 'Cubículo'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalidad('Virtual')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalidad === 'Virtual'
                        ? 'bg-[#20B2AA]/15 border-[#20B2AA] text-[#0E7470] dark:text-[#20B2AA] font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Virtual (Meet)</span>
                  </button>
                </div>
              </div>

              {/* Detalle o Mensaje para el Tutor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Mensaje o Dudas Específicas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={motivoDetalle}
                  onChange={(e) => setMotivoDetalle(e.target.value)}
                  placeholder="Describe brevemente los temas que te gustaría tratar con tu tutor..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#20B2AA] resize-none"
                />
              </div>

              {/* Acciones */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalSolicitarAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoCita}
                  className="px-5 py-2 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {enviandoCita ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Agendando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirmar Cita</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
