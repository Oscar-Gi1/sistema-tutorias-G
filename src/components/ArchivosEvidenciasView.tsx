import React, { useState, useEffect, useRef } from 'react';
import {
  ArchivoSistema,
  ActividadAsignada,
  RolSimulado,
  Tutor,
  EstudianteCatalogo,
  CategoriaArchivo,
  EstadoRevisionArchivo
} from '../types/tutoria';
import { tutoriaService } from '../services/tutoriaService';
import { AvatarWithFallback } from './AvatarWithFallback';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Search,
  Filter,
  PlusCircle,
  FileCheck,
  FolderOpen,
  Calendar,
  X,
  ShieldCheck,
  FileUp,
  MessageSquare
} from 'lucide-react';

interface ArchivosEvidenciasViewProps {
  rolActivo: RolSimulado;
  tutorActivo: Tutor;
  estudianteActivo: EstudianteCatalogo;
  catalogoEstudiantes: EstudianteCatalogo[];
}

export const ArchivosEvidenciasView: React.FC<ArchivosEvidenciasViewProps> = ({
  rolActivo,
  tutorActivo,
  estudianteActivo,
  catalogoEstudiantes
}) => {
  const [archivos, setArchivos] = useState<ArchivoSistema[]>([]);
  const [actividades, setActividades] = useState<ActividadAsignada[]>([]);
  const [cargando, setCargando] = useState(false);
  const [tabActiva, setTabActiva] = useState<'archivos' | 'actividades'>('archivos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // Modales
  const [modalSubirAbierto, setModalSubirAbierto] = useState(false);
  const [modalActividadAbierto, setModalActividadAbierto] = useState(false);
  const [modalRevisarAbierto, setModalRevisarAbierto] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<ArchivoSistema | null>(null);

  // Formulario Subir Archivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [archivoDataUrl, setArchivoDataUrl] = useState<string>('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaArchivo>(
    rolActivo === 'TUTOR' ? 'Material de Apoyo' : 'Evidencia'
  );
  const [descripcion, setDescripcion] = useState('');
  const [alumnoAsignadoId, setAlumnoAsignadoId] = useState(estudianteActivo.id);
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Formulario Revisar (Tutor)
  const [nuevoEstadoRevision, setNuevoEstadoRevision] = useState<EstadoRevisionArchivo>('Aprobado');
  const [comentarioRevision, setComentarioRevision] = useState('');

  // Formulario Nueva Actividad (Tutor)
  const [actTitulo, setActTitulo] = useState('');
  const [actDescripcion, setActDescripcion] = useState('');
  const [actFechaLimite, setActFechaLimite] = useState('2026-10-30');
  const [actEstudianteId, setActEstudianteId] = useState('TODOS');

  const cargarDatos = async () => {
    setCargando(true);
    const filtrosArchivos =
      rolActivo === 'TUTOR'
        ? { tutorId: tutorActivo.id }
        : { tutoradoId: estudianteActivo.id };

    const resArchivos = await tutoriaService.getArchivos(filtrosArchivos);
    if (resArchivos.success && resArchivos.data) {
      setArchivos(resArchivos.data);
    }

    const resAct = await tutoriaService.getActividades({
      tutorId: rolActivo === 'TUTOR' ? tutorActivo.id : undefined,
      estudianteId: rolActivo === 'ALUMNO' ? estudianteActivo.id : undefined
    });
    if (resAct.success && resAct.data) {
      setActividades(resAct.data);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
    const unsub = tutoriaService.subscribe(() => {
      cargarDatos();
    });
    return () => unsub();
  }, [rolActivo, tutorActivo.id, estudianteActivo.id]);

  const procesarArchivoSeleccionado = (file: File) => {
    setArchivoFile(file);
    if (!nombreArchivo) {
      setNombreArchivo(file.name);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setArchivoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivoSeleccionado(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivoSeleccionado(file);
  };

  const handleSubirArchivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArchivo.trim() || !archivoDataUrl) {
      setMensajeAlerta({ texto: 'Por favor selecciona un archivo para cargar.', tipo: 'error' });
      return;
    }

    setSubiendo(true);
    const autor =
      rolActivo === 'TUTOR'
        ? { id: tutorActivo.id, nombre: tutorActivo.nombre, rol: 'TUTOR' as const }
        : { id: estudianteActivo.id, nombre: estudianteActivo.nombre, rol: 'TUTORADO' as const };

    const res = await tutoriaService.subirArchivo(
      {
        nombre: nombreArchivo.trim(),
        tipo: archivoFile?.type || 'application/octet-stream',
        tamano: archivoFile?.size || 1024,
        contenidoDataUrl: archivoDataUrl,
        categoria,
        descripcion,
        tutoradoId: rolActivo === 'ALUMNO' ? estudianteActivo.id : alumnoAsignadoId,
        tutorId: tutorActivo.id
      },
      autor
    );

    setSubiendo(false);
    if (res.success) {
      setMensajeAlerta({ texto: 'Documento cargado exitosamente en el sistema institucional.', tipo: 'ok' });
      setTimeout(() => {
        setModalSubirAbierto(false);
        setMensajeAlerta(null);
        setArchivoFile(null);
        setArchivoDataUrl('');
        setNombreArchivo('');
        setDescripcion('');
      }, 900);
      cargarDatos();
    } else {
      setMensajeAlerta({ texto: res.message, tipo: 'error' });
    }
  };

  const handleGuardarRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoSeleccionado) return;

    const res = await tutoriaService.revisarArchivo(
      {
        archivoId: archivoSeleccionado.id,
        estadoRevision: nuevoEstadoRevision,
        comentarioTutor: comentarioRevision
      },
      tutorActivo.id
    );

    if (res.success) {
      setModalRevisarAbierto(false);
      setArchivoSeleccionado(null);
      setComentarioRevision('');
      cargarDatos();
    }
  };

  const handleCrearActividadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitulo.trim() || !actFechaLimite) return;

    const res = await tutoriaService.crearActividad(
      {
        titulo: actTitulo,
        descripcion: actDescripcion,
        fechaLimite: actFechaLimite,
        estudianteId: actEstudianteId
      },
      { id: tutorActivo.id, nombre: tutorActivo.nombre }
    );

    if (res.success) {
      setModalActividadAbierto(false);
      setActTitulo('');
      setActDescripcion('');
      cargarDatos();
    }
  };

  const handleDescargar = (archivo: ArchivoSistema) => {
    const enlace = document.createElement('a');
    enlace.href = archivo.contenidoDataUrl;
    enlace.download = archivo.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  const handleEliminarArchivo = async (id: string) => {
    if (confirm('¿Deseas eliminar este documento institucional de forma permanente?')) {
      await tutoriaService.eliminarArchivo(id);
      cargarDatos();
    }
  };

  // Filtrado de archivos
  const archivosFiltrados = archivos.filter((a) => {
    const matchBusqueda =
      !busqueda.trim() ||
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.autorNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.descripcion && a.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

    const matchCategoria = filtroCategoria === 'TODAS' || a.categoria === filtroCategoria;
    const matchEstado = filtroEstado === 'TODOS' || a.estadoRevision === filtroEstado;

    return matchBusqueda && matchCategoria && matchEstado;
  });

  const conteoPendientes = archivos.filter((a) => a.estadoRevision === 'Pendiente').length;
  const conteoAprobados = archivos.filter((a) => a.estadoRevision === 'Aprobado').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera Principal Institucional UAT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EE7402]/10 text-[#EE7402] border border-[#EE7402]/30 font-heading">
              UAT &middot; Gestión Documental
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sistema Institucional de Tutorías
            </span>
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 tracking-tight">
            {rolActivo === 'TUTOR'
              ? 'Gestión de Documentos y Formatos Institucionales'
              : 'Subir Documentos y Evidencias de Tutoría'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {rolActivo === 'TUTOR'
              ? 'Administra formatos oficiales de acompañamiento, revisa evidencias entregadas y publica guías para tus tutorados.'
              : 'Entrega tus tareas, comprobantes escolares y evidencias de tutoría para revisión por tu tutor Dr. Roberto Mendoza.'}
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2.5">
          {rolActivo === 'TUTOR' && (
            <button
              onClick={() => setModalActividadAbierto(true)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <PlusCircle className="w-4 h-4 text-[#EE7402]" />
              <span>Nueva Actividad</span>
            </button>
          )}

          <button
            onClick={() => {
              setModalSubirAbierto(true);
              setNombreArchivo('');
              setArchivoDataUrl('');
              setArchivoFile(null);
            }}
            className="px-4 py-2.5 bg-[#EE7402] hover:bg-[#D96200] active:bg-[#BF5600] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{rolActivo === 'TUTOR' ? 'Subir Formato / Guía' : 'Subir Documento'}</span>
          </button>
        </div>
      </div>

      {/* ROL ALUMNO: Componente Prominente de Carga Rápida de Archivos con Soporte Claro/Oscuro */}
      {rolActivo === 'ALUMNO' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            setModalSubirAbierto(true);
          }}
          className={`rounded-2xl p-8 border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#EE7402] bg-[#FFF7ED] dark:bg-[#EE7402]/10 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#EE7402] dark:hover:border-[#EE7402] bg-white dark:bg-slate-900 hover:bg-[#FFF7ED]/50 dark:hover:bg-[#EE7402]/5 shadow-xs'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EE7402]/15 text-[#EE7402] flex items-center justify-center mx-auto mb-3">
            <FileUp className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Arrastra tu archivo aquí o haz clic para subir
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Sube constancias, justificantes médicos, tareas de asesoría o evidencias de seguimiento escolar.
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono mt-3">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              PDF
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              DOCX
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              PNG/JPG
            </span>
            <span className="text-slate-400">&bull; Hasta 15 MB</span>
          </div>
        </div>
      )}

      {/* Pestañas de Vista para Tutor */}
      {rolActivo === 'TUTOR' && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
            <button
              onClick={() => setTabActiva('archivos')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                tabActiva === 'archivos'
                  ? 'bg-[#EE7402] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Documentos y Evidencias Recibidas ({archivos.length})</span>
            </button>

            <button
              onClick={() => setTabActiva('actividades')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                tabActiva === 'actividades'
                  ? 'bg-[#EE7402] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Tareas y Formatos Oficiales ({actividades.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-semibold flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{conteoPendientes} Por revisar</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{conteoAprobados} Aprobados</span>
            </span>
          </div>
        </div>
      )}

      {/* Contenido Tab 1: Lista de Documentos */}
      {tabActiva === 'archivos' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                {rolActivo === 'TUTOR' ? 'Expediente Documental' : 'Mis Entregas y Documentos'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ({archivosFiltrados.length} archivos)
              </span>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar documento..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                />
              </div>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="TODAS">Todas las categorías</option>
                <option value="Evidencia">Evidencias</option>
                <option value="Material de Apoyo">Material de Apoyo</option>
                <option value="Tarea / Actividad">Tareas</option>
                <option value="Documento Institucional">Institucionales</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Aprobado">Aprobados</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Requiere Corrección">Requieren Corrección</option>
              </select>
            </div>
          </div>

          {/* Tabla de Documentos con Estilo Institucional UAT */}
          {archivosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Fecha de Subida</th>
                    <th className="py-3 px-3">Estado de Revisión</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {archivosFiltrados.map((archivo) => {
                    const esAprobado = archivo.estadoRevision === 'Aprobado';
                    const esPendiente = archivo.estadoRevision === 'Pendiente';
                    const esCorrec = archivo.estadoRevision === 'Requiere Corrección';

                    return (
                      <tr
                        key={archivo.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#EE7402]/10 text-[#EE7402] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-heading font-semibold text-slate-900 dark:text-white truncate">
                                {archivo.nombre}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {archivo.tamanoFormateado} &middot; Subido por {archivo.autorNombre}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {archivo.categoria}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          {archivo.fechaSubida}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              esAprobado
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                : esPendiente
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                                : esCorrec
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                esAprobado ? 'bg-emerald-500' : esPendiente ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{archivo.estadoRevision}</span>
                          </span>

                          {archivo.comentarioTutor && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#EE7402] shrink-0" />
                              <span className="truncate max-w-[200px]">{archivo.comentarioTutor}</span>
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDescargar(archivo)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Descargar archivo"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {rolActivo === 'TUTOR' && (
                              <button
                                onClick={() => {
                                  setArchivoSeleccionado(archivo);
                                  setNuevoEstadoRevision(archivo.estadoRevision);
                                  setComentarioRevision(archivo.comentarioTutor || '');
                                  setModalRevisarAbierto(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#EE7402]/10 hover:bg-[#EE7402] hover:text-white text-[#EE7402] text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Revisar
                              </button>
                            )}

                            {rolActivo === 'TUTOR' && (
                              <button
                                onClick={() => handleEliminarArchivo(archivo.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Eliminar archivo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                No hay documentos registrados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {rolActivo === 'TUTOR'
                  ? 'Aquí aparecerán los archivos y evidencias entregadas por los alumnos.'
                  : 'Aún no has subido ningún documento. Utiliza el botón "+ Subir Documento".'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Contenido Tab 2: Tareas y Formatos Oficiales (Tutor) */}
      {tabActiva === 'actividades' && rolActivo === 'TUTOR' && (
        <div className="space-y-4">
          {actividades.length > 0 ? (
            actividades.map((act) => (
              <div
                key={act.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EE7402]/10 text-[#EE7402]">
                      Actividad Programada
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Fecha límite: {act.fechaLimite}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    {act.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {act.descripcion}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                No hay actividades registradas
              </h3>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SUBIR ARCHIVO / EVIDENCIA                        */}
      {/* ========================================================= */}
      {modalSubirAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EE7402]/15 text-[#EE7402] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {rolActivo === 'TUTOR' ? 'Subir Formato / Guía Oficial' : 'Subir Documento de Tutoría'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Almacenamiento institucional UAT
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalSubirAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mensajeAlerta && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  mensajeAlerta.tipo === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {mensajeAlerta.tipo === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{mensajeAlerta.texto}</span>
              </div>
            )}

            <form onSubmit={handleSubirArchivoSubmit} className="space-y-3.5">
              {/* Selector de Archivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccionar Documento (PDF, DOCX, ZIP, PNG, JPG) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSeleccionarArchivo}
                  required
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EE7402]/15 file:text-[#EE7402] hover:file:bg-[#EE7402]/25 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Institucional del Archivo *
                </label>
                <input
                  type="text"
                  required
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Ej. Evidencia_Tutorias_2026_1.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 focus:border-[#EE7402]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaArchivo)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                  >
                    <option value="Evidencia">Evidencia de Acompañamiento</option>
                    <option value="Material de Apoyo">Material de Apoyo / Guía</option>
                    <option value="Tarea / Actividad">Tarea / Entrega Escolar</option>
                    <option value="Documento Institucional">Formato Institucional UAT</option>
                  </select>
                </div>

                {rolActivo === 'TUTOR' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Destinatario
                    </label>
                    <select
                      value={alumnoAsignadoId}
                      onChange={(e) => setAlumnoAsignadoId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="TODOS">Todos mis tutorados</option>
                      {catalogoEstudiantes.map((es) => (
                        <option key={es.id} value={es.id}>
                          {es.nombre} ({es.matricula})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Notas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre el contenido del documento entregado..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSubirAbierto(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] active:bg-[#BF5600] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{subiendo ? 'Guardando en UAT...' : 'Subir Documento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REVISAR ARCHIVO (TUTOR)                          */}
      {/* ========================================================= */}
      {modalRevisarAbierto && archivoSeleccionado && rolActivo === 'TUTOR' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#EE7402]" />
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Revisar Evidencia de Tutoría
                </h3>
              </div>
              <button
                onClick={() => setModalRevisarAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-white block">
                {archivoSeleccionado.nombre}
              </span>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Subido por: {archivoSeleccionado.autorNombre} &middot; {archivoSeleccionado.tamanoFormateado}
              </span>
            </div>

            <form onSubmit={handleGuardarRevision} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dictamen Docente *
                </label>
                <select
                  value={nuevoEstadoRevision}
                  onChange={(e) => setNuevoEstadoRevision(e.target.value as EstadoRevisionArchivo)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Aprobado">Aprobado (Con visto bueno)</option>
                  <option value="En Revisión">En Revisión (Pendiente de ajuste)</option>
                  <option value="Requiere Corrección">Requiere Corrección (Re-entrega)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones para el Alumno
                </label>
                <textarea
                  rows={3}
                  value={comentarioRevision}
                  onChange={(e) => setComentarioRevision(e.target.value)}
                  placeholder="Escribe comentarios formativos o indicaciones..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRevisarAbierto(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] text-white rounded-xl text-xs font-semibold"
                >
                  Guardar Dictamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ASIGNAR NUEVA ACTIVIDAD (TUTOR)                  */}
      {/* ========================================================= */}
      {modalActividadAbierto && rolActivo === 'TUTOR' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#EE7402]" />
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Asignar Nueva Tarea o Actividad
                </h3>
              </div>
              <button
                onClick={() => setModalActividadAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearActividadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Actividad *
                </label>
                <input
                  type="text"
                  required
                  value={actTitulo}
                  onChange={(e) => setActTitulo(e.target.value)}
                  placeholder="Ej. Diagnóstico Inicial de Hábitos de Estudio"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instrucciones para los Alumnos
                </label>
                <textarea
                  rows={3}
                  value={actDescripcion}
                  onChange={(e) => setActDescripcion(e.target.value)}
                  placeholder="Pautas de entrega y formato requerido..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha Límite de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={actFechaLimite}
                    onChange={(e) => setActFechaLimite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alumnos Destino
                  </label>
                  <select
                    value={actEstudianteId}
                    onChange={(e) => setActEstudianteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="TODOS">Todos mis tutorados</option>
                    {catalogoEstudiantes.map((es) => (
                      <option key={es.id} value={es.id}>
                        {es.nombre} ({es.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalActividadAbierto(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Crear y Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
