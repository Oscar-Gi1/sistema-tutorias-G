import React, { useState, useEffect } from 'react';
import {
  Tutor,
  EstudianteCatalogo,
  CitaAsesoria,
  RolSimulado,
  SolicitarAsesoriaPayload,
  AgendarSesionGrupalPayload
} from '../types/tutoria';
import { tutoriaService } from '../services/tutoriaService';
import { formatSemestre, getCarreraCorta } from '../utils/tutoriaUtils';
import { abrirGoogleCalendar, descargarArchivoICS } from '../utils/calendarExportUtils';
import { AvatarWithFallback } from './AvatarWithFallback';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  PlusCircle,
  CheckCircle2,
  X,
  Send,
  Filter,
  User,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ExternalLink,
  CalendarCheck,
  CalendarPlus,
  Download,
  ChevronDown,
  Check,
  AlertTriangle,
  Search,
  Sparkles
} from 'lucide-react';

interface CalendarioSesionesViewProps {
  rolActivo: RolSimulado;
  tutorActivo: Tutor;
  estudianteActivo: EstudianteCatalogo;
  catalogoEstudiantes: EstudianteCatalogo[];
}

export const CalendarioSesionesView: React.FC<CalendarioSesionesViewProps> = ({
  rolActivo,
  tutorActivo,
  estudianteActivo,
  catalogoEstudiantes
}) => {
  const [citas, setCitas] = useState<CitaAsesoria[]>([]);
  const [filtroModalidad, setFiltroModalidad] = useState<'TODAS' | 'Presencial' | 'Virtual'>('TODAS');
  const [filtroTipoSesion, setFiltroTipoSesion] = useState<'TODAS' | 'INDIVIDUAL' | 'GRUPAL'>('TODAS');
  const [modalAgendarAbierto, setModalAgendarAbierto] = useState(false);
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);

  // Modal para agregar/quitar tutorados de una sesión grupal existente
  const [modalEditarParticipantesAbierto, setModalEditarParticipantesAbierto] = useState(false);
  const [citaSeleccionadaParaEditar, setCitaSeleccionadaParaEditar] = useState<CitaAsesoria | null>(null);
  const [participantesSeleccionadosEdicion, setParticipantesSeleccionadosEdicion] = useState<string[]>([]);
  const [guardandoParticipantes, setGuardandoParticipantes] = useState(false);

  // Formulario de nueva sesión
  const [tipoNuevaSesion, setTipoNuevaSesion] = useState<'individual' | 'grupal'>(
    rolActivo === 'TUTOR' ? 'grupal' : 'individual'
  );
  const [estudianteSeleccionadoId, setEstudianteSeleccionadoId] = useState(estudianteActivo.id);
  const [estudiantesGrupalesSeleccionados, setEstudiantesGrupalesSeleccionados] = useState<string[]>([
    catalogoEstudiantes[0]?.id || estudianteActivo.id
  ]);
  const [busquedaAlumnoModal, setBusquedaAlumnoModal] = useState('');

  const [tema, setTema] = useState('Revisión de Avance Curricular y Estrategias de Estudio');
  const [fecha, setFecha] = useState('2026-10-18');
  const [hora, setHora] = useState('11:00 AM');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [lugarPresencial, setLugarPresencial] = useState('');
  const [enlaceVirtual, setEnlaceVirtual] = useState('');
  const [motivoDetalle, setMotivoDetalle] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cargarCitas = async () => {
    if (rolActivo === 'TUTOR') {
      const res = await tutoriaService.getCitasPorTutor(tutorActivo.id);
      if (res.data) {
        setCitas(res.data);
      }
    } else {
      const res = await tutoriaService.getMiTutoriaComoAlumno(estudianteActivo.id);
      if (res.data?.citas) {
        setCitas(res.data.citas);
      }
    }
  };

  useEffect(() => {
    cargarCitas();
    const unsub = tutoriaService.subscribe(() => {
      cargarCitas();
    });
    return () => unsub();
  }, [rolActivo, tutorActivo.id, estudianteActivo.id]);

  // Manejo de checkboxes en agendar sesión grupal
  const handleToggleEstudianteGrupal = (id: string) => {
    setEstudiantesGrupalesSeleccionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSeleccionarTodosGrupales = () => {
    setEstudiantesGrupalesSeleccionados(catalogoEstudiantes.map(e => e.id));
  };

  const handleDeseleccionarTodosGrupales = () => {
    setEstudiantesGrupalesSeleccionados([]);
  };

  // Guardar nueva sesión (individual o grupal)
  const handleAgendarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    if (rolActivo === 'TUTOR' && tipoNuevaSesion === 'grupal') {
      if (estudiantesGrupalesSeleccionados.length === 0) {
        setMensajeError('Por favor selecciona al menos un estudiante tutorado para la sesión grupal.');
        setGuardando(false);
        return;
      }

      const payload: AgendarSesionGrupalPayload = {
        tutorId: tutorActivo.id,
        estudiantesIds: estudiantesGrupalesSeleccionados,
        tema,
        fecha,
        hora,
        modalidad,
        lugar: modalidad === 'Presencial' ? (lugarPresencial.trim() || 'Aula Magna de Tutorías / Cubículo') : undefined,
        enlaceVirtual: modalidad === 'Virtual' ? (enlaceVirtual.trim() || 'https://meet.google.com/tutoria-grupal-uat') : undefined,
        motivoDetalle
      };

      const res = await tutoriaService.agendarSesionGrupal(payload);
      setGuardando(false);

      if (res.success) {
        setMensajeExito(res.message);
        setTimeout(() => {
          setModalAgendarAbierto(false);
          setMensajeExito(null);
          setMotivoDetalle('');
        }, 1200);
        cargarCitas();
      } else {
        setMensajeError(res.message);
      }
    } else {
      // Individual
      const payload: SolicitarAsesoriaPayload = {
        estudianteId: rolActivo === 'TUTOR' ? estudianteSeleccionadoId : estudianteActivo.id,
        tutorId: tutorActivo.id,
        tema,
        fecha,
        hora,
        modalidad,
        motivoDetalle
      };

      const res = await tutoriaService.solicitarCitaComoAlumno(payload);
      setGuardando(false);

      if (res.success) {
        setMensajeExito('Sesión individual agendada exitosamente en el calendario.');
        setTimeout(() => {
          setModalAgendarAbierto(false);
          setMensajeExito(null);
          setMotivoDetalle('');
        }, 1200);
        cargarCitas();
      } else {
        setMensajeError(res.message);
      }
    }
  };

  // Respuesta de asistencia del alumno a sesión grupal
  const handleResponderSesionGrupal = async (citaId: string, respuesta: 'Confirmada' | 'Rechazada') => {
    const res = await tutoriaService.responderCitaGrupalComoAlumno(citaId, estudianteActivo.id, respuesta);
    if (res.success) {
      cargarCitas();
    }
  };

  // Abrir modal para editar participantes de una sesión grupal existente (Tutor)
  const handleAbrirEditarParticipantes = (cita: CitaAsesoria) => {
    setCitaSeleccionadaParaEditar(cita);
    setParticipantesSeleccionadosEdicion(cita.estudiantesIds || []);
    setModalEditarParticipantesAbierto(true);
  };

  const handleToggleParticipanteEdicion = (id: string) => {
    setParticipantesSeleccionadosEdicion(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleGuardarParticipantesEdicion = async () => {
    if (!citaSeleccionadaParaEditar) return;
    if (participantesSeleccionadosEdicion.length === 0) {
      alert('La sesión grupal debe contar con al menos un tutorado participante.');
      return;
    }

    setGuardandoParticipantes(true);
    const res = await tutoriaService.actualizarParticipantesSesionGrupal(
      citaSeleccionadaParaEditar.id,
      participantesSeleccionadosEdicion
    );
    setGuardandoParticipantes(false);

    if (res.success) {
      setModalEditarParticipantesAbierto(false);
      setCitaSeleccionadaParaEditar(null);
      cargarCitas();
    }
  };

  const handleCancelarCita = async (citaId: string) => {
    if (confirm('¿Estás seguro de cancelar esta sesión del calendario institucional?')) {
      await tutoriaService.cancelarCitaComoAlumno(citaId);
      cargarCitas();
    }
  };

  // Filtrado de citas
  const citasFiltradas = citas.filter((c) => {
    const matchModalidad = filtroModalidad === 'TODAS' || c.modalidad === filtroModalidad;
    const esGrupal = c.esGrupal || c.estudianteId === 'GRUPAL' || (c.estudiantesIds && c.estudiantesIds.length > 1);
    const matchTipo =
      filtroTipoSesion === 'TODAS' ||
      (filtroTipoSesion === 'GRUPAL' && esGrupal) ||
      (filtroTipoSesion === 'INDIVIDUAL' && !esGrupal);

    return matchModalidad && matchTipo;
  });

  const conteoGrupales = citas.filter(c => c.esGrupal || c.estudianteId === 'GRUPAL').length;
  const conteoIndividuales = citas.length - conteoGrupales;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera del Calendario */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
              Calendario de Sesiones y Asesorías
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EE7402]/10 text-[#EE7402] border border-[#EE7402]/30">
              Ciclo 2026-1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {rolActivo === 'TUTOR'
              ? `Agenda institucional de tutorías individuales y talleres grupales del ${tutorActivo.nombre}`
              : `Tus sesiones individuales y talleres grupales con tu tutor ${tutorActivo.nombre}`}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Filtro por tipo: Todas / Individuales / Grupales */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFiltroTipoSesion('TODAS')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filtroTipoSesion === 'TODAS'
                  ? 'bg-white dark:bg-slate-800 text-[#EE7402] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({citas.length})
            </button>
            <button
              onClick={() => setFiltroTipoSesion('GRUPAL')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filtroTipoSesion === 'GRUPAL'
                  ? 'bg-white dark:bg-slate-800 text-[#EE7402] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Grupales ({conteoGrupales})</span>
            </button>
            <button
              onClick={() => setFiltroTipoSesion('INDIVIDUAL')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filtroTipoSesion === 'INDIVIDUAL'
                  ? 'bg-white dark:bg-slate-800 text-[#EE7402] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Individuales ({conteoIndividuales})</span>
            </button>
          </div>

          {/* Filtro por modalidad */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFiltroModalidad('TODAS')}
              className={`px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filtroModalidad === 'TODAS'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroModalidad('Presencial')}
              className={`px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filtroModalidad === 'Presencial'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Presenciales
            </button>
            <button
              onClick={() => setFiltroModalidad('Virtual')}
              className={`px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filtroModalidad === 'Virtual'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Virtuales
            </button>
          </div>

          {/* Exportar a Google Calendar / ICS */}
          <div className="relative">
            <button
              onClick={() => setMenuExportarAbierto(prev => !prev)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Exportar sesiones a Google Calendar o descargar archivo .ics"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#EE7402]" />
              <span className="hidden sm:inline">Exportar Cal</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {menuExportarAbierto && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    const proxima = citasFiltradas.find(c => c.estado !== 'Cancelada') || citasFiltradas[0];
                    if (proxima) {
                      const alumno = catalogoEstudiantes.find(e => e.id === proxima.estudianteId) || estudianteActivo;
                      abrirGoogleCalendar(proxima, proxima.esGrupal ? 'Sesión Grupal' : alumno.nombre, tutorActivo.nombre);
                    }
                    setMenuExportarAbierto(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block">Abrir en Google Calendar</span>
                    <span className="text-[10px] text-slate-400 block">Añade la próxima sesión activa</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    descargarArchivoICS(citasFiltradas, 'sesiones_tutoria_uat.ics', tutorActivo.nombre);
                    setMenuExportarAbierto(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  <Download className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="font-semibold block">Descargar archivo .ics</span>
                    <span className="text-[10px] text-slate-400 block">Compatible con Google, Apple y Outlook</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Botón Agendar Sesión */}
          <button
            onClick={() => {
              setTipoNuevaSesion(rolActivo === 'TUTOR' ? 'grupal' : 'individual');
              setModalAgendarAbierto(true);
            }}
            className="px-3.5 sm:px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] active:bg-[#BF5600] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.01] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agendar Sesión</span>
          </button>
        </div>
      </div>

      {/* Grid de Sesiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => {
            const esGrupal = cita.esGrupal || cita.estudianteId === 'GRUPAL' || (cita.estudiantesIds && cita.estudiantesIds.length > 1);
            const esVirtual = cita.modalidad === 'Virtual';
            const esCancelada = cita.estado === 'Cancelada';

            // Alumnos participantes de la sesión grupal
            const participantesGrupales: EstudianteCatalogo[] = esGrupal && cita.estudiantesIds
              ? cita.estudiantesIds
                  .map(id => catalogoEstudiantes.find(e => e.id === id))
                  .filter((e): e is EstudianteCatalogo => !!e)
              : [];

            // Estado de confirmación personal para el alumno activo si participa
            const miConfirmacion = esGrupal && cita.confirmaciones
              ? cita.confirmaciones[estudianteActivo.id] || 'Pendiente'
              : undefined;

            const alumnoIndividual = !esGrupal
              ? catalogoEstudiantes.find(e => e.id === cita.estudianteId) || estudianteActivo
              : null;

            return (
              <div
                key={cita.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  esCancelada
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : esGrupal
                    ? 'border-[#EE7402]/40 dark:border-[#EE7402]/30 hover:border-[#EE7402] ring-1 ring-[#EE7402]/10'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50'
                }`}
              >
                <div>
                  {/* Badges superiores: Estado, Modalidad y Etiqueta Grupal */}
                  <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {esGrupal ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EE7402]/15 text-[#C45500] dark:text-[#EE7402] border border-[#EE7402]/40 flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#EE7402]" />
                          <span>Sesión Grupal ({participantesGrupales.length || cita.estudiantesIds?.length || 0} alumnos)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>Individual</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          esCancelada
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            : cita.estado === 'Confirmada'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      {esVirtual ? <Video className="w-3.5 h-3.5 text-sky-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                      {cita.modalidad}
                    </span>
                  </div>

                  {/* Título / Tema */}
                  <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {cita.tema}
                  </h3>

                  {/* Participantes: Grupal vs Individual */}
                  {esGrupal ? (
                    <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-slate-800/60 border border-[#EE7402]/20 dark:border-slate-700 my-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#EE7402]" />
                          <span>Tutorados participantes:</span>
                        </span>

                        {rolActivo === 'TUTOR' && !esCancelada && (
                          <button
                            onClick={() => handleAbrirEditarParticipantes(cita)}
                            className="text-[10px] font-bold text-[#EE7402] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Agregar o quitar alumnos de esta sesión grupal"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Modificar lista</span>
                          </button>
                        )}
                      </div>

                      {/* Lista resumida de avatares y nombres con confirmación */}
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {participantesGrupales.map((alum) => {
                          const conf = cita.confirmaciones?.[alum.id] || 'Pendiente';
                          return (
                            <div
                              key={alum.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <AvatarWithFallback
                                  src={alum.avatar}
                                  alt={alum.nombre}
                                  className="w-5 h-5 rounded-full shrink-0"
                                />
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {alum.nombre}
                                </span>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  conf === 'Confirmada'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : conf === 'Rechazada'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                }`}
                              >
                                {conf}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Participante Individual */
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 my-3">
                      <AvatarWithFallback
                        src={(rolActivo === 'TUTOR' ? alumnoIndividual?.avatar : tutorActivo.avatar) || ''}
                        alt={rolActivo === 'TUTOR' ? alumnoIndividual?.nombre || '' : tutorActivo.nombre}
                        className="w-8 h-8 rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                          {rolActivo === 'TUTOR' ? alumnoIndividual?.nombre : tutorActivo.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {rolActivo === 'TUTOR'
                            ? `${formatSemestre(alumnoIndividual?.semestre || 1)} • ${alumnoIndividual?.matricula}`
                            : tutorActivo.departamento}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fecha, Hora y Ubicación */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium">{cita.fecha}</span>
                      <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{cita.hora}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {esVirtual ? (
                        <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                          <Video className="w-3 h-3" />
                          <span>Google Meet UAT</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#EE7402]" />
                          <span>{cita.lugar || (esGrupal ? 'Aula Magna de Tutorías' : tutorActivo.cubículo)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {cita.motivoDetalle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 line-clamp-2">
                      &ldquo;{cita.motivoDetalle}&rdquo;
                    </p>
                  )}

                  {/* Acciones de confirmación para el alumno en sesiones grupales */}
                  {rolActivo === 'ALUMNO' && esGrupal && !esCancelada && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Tu asistencia:
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            miConfirmacion === 'Confirmada'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : miConfirmacion === 'Rechazada'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {miConfirmacion || 'Pendiente'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleResponderSesionGrupal(cita.id, 'Confirmada')}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            miConfirmacion === 'Confirmada'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirmar</span>
                        </button>

                        <button
                          onClick={() => handleResponderSesionGrupal(cita.id, 'Rechazada')}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            miConfirmacion === 'Rechazada'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Declinar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pie de tarjeta con enlaces y exportar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {esVirtual && cita.enlaceVirtual && !esCancelada ? (
                      <a
                        href={cita.enlaceVirtual}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Unirse a Meet</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {esCancelada ? 'Cancelada' : 'En agenda'}
                      </span>
                    )}

                    {!esCancelada && (
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() =>
                            abrirGoogleCalendar(
                              cita,
                              esGrupal ? 'Sesión Grupal' : alumnoIndividual?.nombre || '',
                              tutorActivo.nombre
                            )
                          }
                          className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="Añadir esta cita a Google Calendar"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Google Cal</span>
                        </button>
                        <button
                          onClick={() =>
                            descargarArchivoICS(
                              [cita],
                              `sesion_${cita.fecha}_${cita.id}.ics`,
                              tutorActivo.nombre
                            )
                          }
                          className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] cursor-pointer"
                          title="Descargar archivo .ics"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!esCancelada && (
                    <button
                      onClick={() => handleCancelarCita(cita.id)}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EE7402]/10 text-[#EE7402] flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              No hay sesiones programadas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {filtroModalidad !== 'TODAS' || filtroTipoSesion !== 'TODAS'
                ? 'No se encontraron citas con los filtros seleccionados.'
                : 'No se encontraron citas activas para este ciclo escolar.'}
            </p>
            <button
              onClick={() => {
                setTipoNuevaSesion(rolActivo === 'TUTOR' ? 'grupal' : 'individual');
                setModalAgendarAbierto(true);
              }}
              className="px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Programar una Sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: AGENDAR NUEVA SESIÓN (INDIVIDUAL O GRUPAL)      */}
      {/* ======================================================== */}
      {modalAgendarAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAgendarAbierto(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EE7402]/15 text-[#EE7402] border border-[#EE7402]/30 flex items-center justify-center">
                  {tipoNuevaSesion === 'grupal' ? <Users className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {tipoNuevaSesion === 'grupal' ? 'Agendar Sesión Grupal de Tutoría' : 'Programar Nueva Asesoría Individual'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rolActivo === 'TUTOR' ? `Docente Tutor: ${tutorActivo.nombre}` : `Con tu tutor: ${tutorActivo.nombre}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAgendarAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAgendarSesion} className="p-5 space-y-4 overflow-y-auto">
              {mensajeExito && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="font-semibold">{mensajeExito}</p>
                </div>
              )}

              {mensajeError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <p className="font-semibold">{mensajeError}</p>
                </div>
              )}

              {/* Selector de Tipo de Sesión (Solo para Tutor) */}
              {rolActivo === 'TUTOR' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Modalidad de Participantes
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoNuevaSesion('grupal')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipoNuevaSesion === 'grupal'
                          ? 'bg-[#EE7402]/10 border-[#EE7402] text-[#EE7402] ring-2 ring-[#EE7402]/20 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Sesión Grupal (Varios Tutorados)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoNuevaSesion('individual')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipoNuevaSesion === 'individual'
                          ? 'bg-[#EE7402]/10 border-[#EE7402] text-[#EE7402] ring-2 ring-[#EE7402]/20 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Individual (1 Alumno)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Si es Grupal: Selector Múltiple de Tutorados con Checkboxes */}
              {rolActivo === 'TUTOR' && tipoNuevaSesion === 'grupal' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Seleccionar Tutorados Convocados <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSeleccionarTodosGrupales}
                        className="text-[#EE7402] hover:underline font-semibold cursor-pointer"
                      >
                        Todos ({catalogoEstudiantes.length})
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeseleccionarTodosGrupales}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {/* Barra de búsqueda de alumnos */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, carrera o matrícula..."
                      value={busquedaAlumnoModal}
                      onChange={(e) => setBusquedaAlumnoModal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                    />
                  </div>

                  {/* Lista con checkboxes */}
                  <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50/60 dark:bg-slate-950/60">
                    {catalogoEstudiantes
                      .filter(al =>
                        !busquedaAlumnoModal.trim() ||
                        al.nombre.toLowerCase().includes(busquedaAlumnoModal.toLowerCase()) ||
                        al.matricula.toLowerCase().includes(busquedaAlumnoModal.toLowerCase()) ||
                        al.carrera.toLowerCase().includes(busquedaAlumnoModal.toLowerCase())
                      )
                      .map((al) => {
                        const isChecked = estudiantesGrupalesSeleccionados.includes(al.id);
                        return (
                          <label
                            key={al.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-orange-50 dark:bg-[#EE7402]/15 border border-[#EE7402]/30'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEstudianteGrupal(al.id)}
                              className="w-4 h-4 rounded text-[#EE7402] focus:ring-[#EE7402] cursor-pointer"
                            />
                            <AvatarWithFallback
                              src={al.avatar}
                              alt={al.nombre}
                              className="w-6 h-6 rounded-full shrink-0"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                {al.nombre}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {al.matricula} &bull; {al.carrera} &bull; Sem. {al.semestre}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Seleccionados:{' '}
                    <strong className="text-[#EE7402]">
                      {estudiantesGrupalesSeleccionados.length} de {catalogoEstudiantes.length} alumnos
                    </strong>
                  </p>
                </div>
              )}

              {/* Si es Individual (Tutor): Selector de un solo alumno */}
              {rolActivo === 'TUTOR' && tipoNuevaSesion === 'individual' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Seleccionar Alumno Tutorado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={estudianteSeleccionadoId}
                    onChange={(e) => setEstudianteSeleccionadoId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 cursor-pointer"
                  >
                    {catalogoEstudiantes.map((al) => (
                      <option key={al.id} value={al.id}>
                        {al.nombre} ({formatSemestre(al.semestre)} • {al.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tema o Motivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Tema o Motivo de la Sesión <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder={tipoNuevaSesion === 'grupal' ? 'Ej. Taller de Técnicas de Estudio y Exámenes Parciales' : 'Ej. Revisión de calificaciones y regularización'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                  required
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Fecha <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Hora <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Modalidad: Presencial vs Virtual */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Modalidad de Impartición
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalidad('Presencial')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalidad === 'Presencial'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Presencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalidad('Virtual')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalidad === 'Virtual'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Virtual (Meet)</span>
                  </button>
                </div>
              </div>

              {/* Ubicación / Enlace específico */}
              {modalidad === 'Presencial' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Lugar o Aula
                  </label>
                  <input
                    type="text"
                    value={lugarPresencial}
                    onChange={(e) => setLugarPresencial(e.target.value)}
                    placeholder={tipoNuevaSesion === 'grupal' ? 'Aula Magna de Tutorías / Sala 3' : tutorActivo.cubículo}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Enlace de Google Meet / Teams
                  </label>
                  <input
                    type="url"
                    value={enlaceVirtual}
                    onChange={(e) => setEnlaceVirtual(e.target.value)}
                    placeholder="https://meet.google.com/tutoria-grupal-uat"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                  />
                </div>
              )}

              {/* Observaciones adicionales */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Observaciones adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={motivoDetalle}
                  onChange={(e) => setMotivoDetalle(e.target.value)}
                  placeholder="Instrucciones, material que deben traer o puntos a revisar..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAgendarAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-[#EE7402] hover:bg-[#D96200] active:bg-[#BF5600] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{tipoNuevaSesion === 'grupal' ? 'Convocar Sesión Grupal' : 'Guardar en Agenda'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: GESTIONAR / AGREGAR / QUITAR ALUMNOS EN GRUPAL  */}
      {/* ======================================================== */}
      {modalEditarParticipantesAbierto && citaSeleccionadaParaEditar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalEditarParticipantesAbierto(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EE7402]/15 text-[#EE7402] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Participantes de Sesión Grupal
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
                    {citaSeleccionadaParaEditar.tema}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEditarParticipantesAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Marca o desmarca los tutorados que deben participar en esta reunión grupal:
              </p>

              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50/50 dark:bg-slate-950/50">
                {catalogoEstudiantes.map((al) => {
                  const isChecked = participantesSeleccionadosEdicion.includes(al.id);
                  return (
                    <label
                      key={al.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-orange-50 dark:bg-[#EE7402]/15 border border-[#EE7402]/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleParticipanteEdicion(al.id)}
                        className="w-4 h-4 rounded text-[#EE7402] focus:ring-[#EE7402] cursor-pointer"
                      />
                      <AvatarWithFallback
                        src={al.avatar}
                        alt={al.nombre}
                        className="w-6 h-6 rounded-full shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate">
                          {al.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {al.matricula} &bull; {al.carrera}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Total convocados: <strong className="text-[#EE7402]">{participantesSeleccionadosEdicion.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setParticipantesSeleccionadosEdicion(catalogoEstudiantes.map(e => e.id))}
                  className="text-[#EE7402] hover:underline font-semibold cursor-pointer"
                >
                  Seleccionar todos
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEditarParticipantesAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarParticipantesEdicion}
                  disabled={guardandoParticipantes}
                  className="px-5 py-2 bg-[#EE7402] hover:bg-[#D96200] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {guardandoParticipantes ? 'Guardando...' : 'Guardar Participantes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
