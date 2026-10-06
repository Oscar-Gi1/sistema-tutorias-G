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
import {
  dataUrlToBlob,
  abrirDocumentoEnPestana,
  descargarDocumento,
  decodeTextFromDataUrl
} from '../utils/tutoriaUtils';
import { AvatarWithFallback } from './AvatarWithFallback';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  PlusCircle,
  FileCheck,
  FolderOpen,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Database,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  FileSpreadsheet,
  FileArchive,
  FileCode
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

  // Modal Visor de Documentos
  const [modalVisorAbierto, setModalVisorAbierto] = useState(false);
  const [archivoAVisualizar, setArchivoAVisualizar] = useState<ArchivoSistema | null>(null);
  const [blobUrlActual, setBlobUrlActual] = useState<string>('');
  const [textoDecodificado, setTextoDecodificado] = useState<string | null>(null);
  const [zoomImagen, setZoomImagen] = useState<number>(100);
  const [copiadoTexto, setCopiadoTexto] = useState(false);

  // Modal de Confirmación de Eliminación (reemplaza window.confirm bloqueado)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState<ArchivoSistema | null>(null);
  const [eliminandoArchivo, setEliminandoArchivo] = useState(false);


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

  // Formulario Revisar
  const [nuevoEstadoRevision, setNuevoEstadoRevision] = useState<EstadoRevisionArchivo>('Aprobado');
  const [comentarioRevision, setComentarioRevision] = useState('');

  // Formulario Nueva Actividad
  const [actTitulo, setActTitulo] = useState('');
  const [actDescripcion, setActDescripcion] = useState('');
  const [actFechaLimite, setActFechaLimite] = useState('2026-10-30');
  const [actEstudianteId, setActEstudianteId] = useState('TODOS');
  const [actArchivoAdjunto, setActArchivoAdjunto] = useState<{ nombre: string; dataUrl: string; tamano: string } | null>(null);

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

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivoFile(file);
    setNombreArchivo(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setArchivoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubirArchivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArchivo.trim() || !archivoDataUrl) {
      setMensajeAlerta({ texto: 'Por favor selecciona un archivo para subir.', tipo: 'error' });
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
      setMensajeAlerta({ texto: 'Archivo guardado de forma persistente.', tipo: 'ok' });
      setTimeout(() => {
        setModalSubirAbierto(false);
        setMensajeAlerta(null);
        setArchivoFile(null);
        setArchivoDataUrl('');
        setNombreArchivo('');
        setDescripcion('');
      }, 1000);
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
        estudianteId: actEstudianteId,
        archivoAdjunto: actArchivoAdjunto || undefined
      },
      { id: tutorActivo.id, nombre: tutorActivo.nombre }
    );

    if (res.success) {
      setModalActividadAbierto(false);
      setActTitulo('');
      setActDescripcion('');
      setActArchivoAdjunto(null);
      cargarDatos();
    }
  };

  const handleAbrirVisor = (archivo: ArchivoSistema) => {
    setArchivoAVisualizar(archivo);
    setZoomImagen(100);
    setCopiadoTexto(false);

    // Intentar decodificar como texto si es archivo de texto, código, csv, markdown o json
    const esTexto =
      archivo.tipo.startsWith('text/') ||
      archivo.nombre.match(/\.(txt|md|csv|json|js|ts|py|sql|html|css|xml|log|ini|env)$/i);

    if (esTexto && archivo.contenidoDataUrl) {
      const decoded = decodeTextFromDataUrl(archivo.contenidoDataUrl);
      setTextoDecodificado(decoded);
    } else {
      setTextoDecodificado(null);
    }

    const blob = dataUrlToBlob(archivo.contenidoDataUrl);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setBlobUrlActual(url);
    } else {
      setBlobUrlActual(archivo.contenidoDataUrl || '');
    }
    setModalVisorAbierto(true);
  };

  const handleCerrarVisor = () => {
    setModalVisorAbierto(false);
    if (blobUrlActual && blobUrlActual.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrlActual);
    }
    setBlobUrlActual('');
    setArchivoAVisualizar(null);
    setTextoDecodificado(null);
    setZoomImagen(100);
  };

  const handlePedirEliminar = (archivo: ArchivoSistema) => {
    setArchivoAEliminar(archivo);
    setModalEliminarAbierto(true);
  };

  const handleEjecutarEliminacion = async () => {
    if (!archivoAEliminar) return;
    const targetId = archivoAEliminar.id;
    setEliminandoArchivo(true);

    // Actualización inmediata en el estado para respuesta instantánea al usuario
    setArchivos((prev) => prev.filter((a) => a.id !== targetId));

    const res = await tutoriaService.eliminarArchivo(targetId);
    setEliminandoArchivo(false);
    setModalEliminarAbierto(false);
    setArchivoAEliminar(null);

    if (res.success) {
      setMensajeAlerta({ texto: 'Archivo eliminado correctamente del almacenamiento persistente.', tipo: 'ok' });
    } else {
      setMensajeAlerta({ texto: res.message || 'Error al eliminar el archivo.', tipo: 'error' });
    }
    setTimeout(() => setMensajeAlerta(null), 3000);
    await cargarDatos();
  };

  const handleCopiarAlPortapapeles = (texto: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoTexto(true);
      setTimeout(() => setCopiadoTexto(false), 2000);
    });
  };

  const handleDescargar = (archivo: ArchivoSistema) => {
    descargarDocumento(archivo.contenidoDataUrl, archivo.nombre);
  };


  const handleVaciarDatosMock = () => {
    if (
      confirm(
        '¿Deseas vaciar todos los datos de prueba y comenzar con almacenamiento 100% limpio? Todos los datos nuevos que registres se mantendrán guardados.'
      )
    ) {
      tutoriaService.vaciarDatosMock();
      cargarDatos();
    }
  };

  const handleCargarSemilla = () => {
    tutoriaService.resetToDefault();
    cargarDatos();
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
      {/* Cabecera Principal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#20B2AA]/15 text-[#0E7470] dark:text-[#20B2AA] font-heading">
              Desarrollador 2 &middot; Persistencia &amp; Archivos
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Almacenamiento Local Permanente
            </span>
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 tracking-tight">
            Documentos, Evidencias y Actividades
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {rolActivo === 'TUTOR'
              ? 'Publica materiales de apoyo institucional, asigna actividades y califica las evidencias entregadas por tus alumnos.'
              : 'Sube tus evidencias escolares, consulta el material publicado por tu tutor y da seguimiento a tus tareas.'}
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2.5">
          {rolActivo === 'TUTOR' && (
            <button
              onClick={() => {
                setModalActividadAbierto(true);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#20B2AA]" />
              <span>Asignar Actividad</span>
            </button>
          )}

          <button
            onClick={() => {
              setCategoria(rolActivo === 'TUTOR' ? 'Material de Apoyo' : 'Evidencia');
              setModalSubirAbierto(true);
            }}
            className="px-4 py-2 bg-[#20B2AA] hover:bg-[#1CA099] active:bg-[#178B85] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{rolActivo === 'TUTOR' ? 'Subir Material / Guía' : 'Subir Evidencia'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas KPI de Documentos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total de Archivos</span>
            <FolderOpen className="w-4 h-4 text-[#20B2AA]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {archivos.length}
            </span>
            <span className="text-[11px] text-slate-500">en almacenamiento</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Por Revisar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {conteoPendientes}
            </span>
            <span className="text-[11px] text-slate-500">pendientes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Revisados / Aprobados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {conteoAprobados}
            </span>
            <span className="text-[11px] text-slate-500">con visto bueno</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Actividades Asignadas</span>
            <Calendar className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
              {actividades.length}
            </span>
            <span className="text-[11px] text-slate-500">tareas escolares</span>
          </div>
        </div>
      </div>

      {/* Barra de Pestañas y Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setTabActiva('archivos')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              tabActiva === 'archivos'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#20B2AA]" />
            <span>Archivos y Evidencias ({archivos.length})</span>
          </button>
          <button
            onClick={() => setTabActiva('actividades')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              tabActiva === 'actividades'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Actividades Asignadas ({actividades.length})</span>
          </button>
        </div>

        {/* Buscador y Filtros */}
        {tabActiva === 'archivos' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar archivo o autor..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#20B2AA]/40 w-48 sm:w-56"
              />
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="TODAS">Categoría: Todas</option>
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
              <option value="TODOS">Revisión: Todas</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Requiere Corrección">Requiere Corrección</option>
            </select>
          </div>
        )}

        {/* Herramienta de Limpieza de Datos de Prueba (Requisito Desarrollador 2) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleVaciarDatosMock}
            title="Quitar todos los datos de prueba y dejar almacenamiento limpio"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Limpiar mocks</span>
          </button>

          <button
            onClick={handleCargarSemilla}
            title="Recargar semilla demo de prueba si se desea"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#20B2AA] hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* Contenido Pestaña 1: Archivos y Evidencias */}
      {tabActiva === 'archivos' && (
        <div className="space-y-3">
          {archivosFiltrados.length > 0 ? (
            archivosFiltrados.map((archivo) => {
              const esEvidencia = archivo.categoria === 'Evidencia';
              const esAprobado = archivo.estadoRevision === 'Aprobado';
              const esCorreccion = archivo.estadoRevision === 'Requiere Corrección';
              const esPendiente = archivo.estadoRevision === 'Pendiente';

              return (
                <div
                  key={archivo.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#20B2AA]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#20B2AA] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {archivo.categoria}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            esAprobado
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                              : esCorreccion
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                          }`}
                        >
                          {archivo.estadoRevision}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {archivo.tamanoFormateado}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleAbrirVisor(archivo)}
                        className="font-heading font-semibold text-sm text-slate-900 dark:text-white mt-1 break-all cursor-pointer hover:text-[#20B2AA] dark:hover:text-[#20B2AA] transition-colors"
                        title="Haz clic para abrir este documento"
                      >
                        {archivo.nombre}
                      </h3>

                      {archivo.descripcion && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {archivo.descripcion}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 flex-wrap">
                        <span>Subido por: <strong>{archivo.autorNombre}</strong> ({archivo.autorRol})</span>
                        <span>&bull;</span>
                        <span className="font-mono">{new Date(archivo.fechaSubida).toLocaleDateString()}</span>
                      </div>

                      {/* Comentario / Retroalimentación del Tutor */}
                      {archivo.comentarioTutor && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#0E7470] dark:text-[#20B2AA] mb-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Retroalimentación del Tutor:</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 italic">
                            &ldquo;{archivo.comentarioTutor}&rdquo;
                          </p>
                          {archivo.fechaRevision && (
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                              Revisado el: {new Date(archivo.fechaRevision).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAbrirVisor(archivo)}
                      className="px-3 py-1.5 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      title="Abrir y previsualizar documento en pantalla"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDescargar(archivo)}
                      className="px-3 py-1.5 bg-[#20B2AA]/10 hover:bg-[#20B2AA] hover:text-white text-[#0E7470] dark:text-[#20B2AA] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Descargar copia del archivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>

                    {rolActivo === 'TUTOR' && (
                      <button
                        type="button"
                        onClick={() => {
                          setArchivoSeleccionado(archivo);
                          setNuevoEstadoRevision(archivo.estadoRevision);
                          setComentarioRevision(archivo.comentarioTutor || '');
                          setModalRevisarAbierto(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#20B2AA]" />
                        <span>Revisar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePedirEliminar(archivo)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este archivo permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (

            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                No hay documentos registrados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Utiliza el botón de subida para adjuntar evidencias escolares o guías académicas que se conservarán en almacenamiento persistente.
              </p>
              <button
                onClick={() => setModalSubirAbierto(true)}
                className="px-4 py-2 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Subir Primer Archivo</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña 2: Actividades Asignadas */}
      {tabActiva === 'actividades' && (
        <div className="space-y-3">
          {actividades.length > 0 ? (
            actividades.map((act) => (
              <div
                key={act.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200">
                      Actividad de Tutoría
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#20B2AA]" />
                      Límite: <strong>{act.fechaLimite}</strong>
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    {act.titulo}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.descripcion}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Asignado por: <strong>{act.tutorNombre}</strong></span>
                    <span>&bull;</span>
                    <span>Destinado a: <strong>{act.estudianteId === 'TODOS' ? 'Todos los Tutorados' : 'Tutorado individual'}</strong></span>
                  </div>

                  {act.archivoAdjunto && (
                    <div className="mt-2 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <FileText className="w-3.5 h-3.5 text-[#20B2AA]" />
                      <span className="font-semibold">{act.archivoAdjunto.nombre}</span>
                      <span className="text-slate-400 font-mono">({act.archivoAdjunto.tamano})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {rolActivo === 'ALUMNO' && (
                    <button
                      onClick={() => {
                        setCategoria('Tarea / Actividad');
                        setDescripcion(`Entrega para la actividad: ${act.titulo}`);
                        setModalSubirAbierto(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Subir Mi Entrega</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                No hay actividades asignadas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Los tutores pueden asignar tareas con fecha límite y documentos adjuntos para dar seguimiento curricular.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SUBIR ARCHIVO / EVIDENCIA                        */}
      {/* ========================================================= */}
      {modalSubirAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#20B2AA]/15 text-[#20B2AA] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {rolActivo === 'TUTOR' ? 'Subir Material de Apoyo' : 'Subir Evidencia de Tutoría'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    El archivo se guardará en almacenamiento persistente
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalSubirAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{mensajeAlerta.texto}</span>
              </div>
            )}

            <form onSubmit={handleSubirArchivoSubmit} className="space-y-3.5">
              {/* Selector de Archivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccionar Documento (PDF, DOCX, PNG, etc.) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSeleccionarArchivo}
                  required
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#20B2AA]/15 file:text-[#0E7470] hover:file:bg-[#20B2AA]/25 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre para mostrar *
                </label>
                <input
                  type="text"
                  required
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Ej. Evidencia_Unidad_1_Calculo.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#20B2AA]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría del Archivo
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaArchivo)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Evidencia">Evidencia de Acompañamiento</option>
                    <option value="Material de Apoyo">Material de Apoyo / Guía</option>
                    <option value="Tarea / Actividad">Tarea / Entrega</option>
                    <option value="Documento Institucional">Documento Institucional</option>
                  </select>
                </div>

                {rolActivo === 'TUTOR' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Alumno Destino
                    </label>
                    <select
                      value={alumnoAsignadoId}
                      onChange={(e) => setAlumnoAsignadoId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="TODOS">Todos los alumnos</option>
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
                  Descripción u observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre el contenido del documento o justificación de entrega..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSubirAbierto(false)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="px-4 py-2 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{subiendo ? 'Guardando...' : 'Subir y Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REVISAR ARCHIVO (TUTOR)                          */}
      {/* ========================================================= */}
      {modalRevisarAbierto && archivoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#20B2AA]" />
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Revisar Evidencia de Tutoría
                </h3>
              </div>
              <button
                onClick={() => setModalRevisarAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
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
                  Dictamen de Revisión *
                </label>
                <select
                  value={nuevoEstadoRevision}
                  onChange={(e) => setNuevoEstadoRevision(e.target.value as EstadoRevisionArchivo)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Aprobado">Aprobado (Con visto bueno)</option>
                  <option value="En Revisión">En Revisión (Pendiente de ajuste menor)</option>
                  <option value="Requiere Corrección">Requiere Corrección (Re-entregar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comentario / Retroalimentación para el alumno
                </label>
                <textarea
                  rows={3}
                  value={comentarioRevision}
                  onChange={(e) => setComentarioRevision(e.target.value)}
                  placeholder="Escribe comentarios, sugerencias o indicaciones de corrección..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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
                  className="px-4 py-2 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold"
                >
                  Guardar Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ASIGNAR NUEVA ACTIVIDAD (TUTOR)                  */}
      {/* ========================================================= */}
      {modalActividadAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#20B2AA]" />
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Asignar Nueva Actividad a Tutorados
                </h3>
              </div>
              <button
                onClick={() => setModalActividadAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
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
                  placeholder="Ej. Entrega de Diagnóstico de Avance Curricular"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instrucciones o Descripción
                </label>
                <textarea
                  rows={3}
                  value={actDescripcion}
                  onChange={(e) => setActDescripcion(e.target.value)}
                  placeholder="Describe qué debe entregar el alumno y las pautas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha Límite *
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
                    Tutorado(s) Destino
                  </label>
                  <select
                    value={actEstudianteId}
                    onChange={(e) => setActEstudianteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="TODOS">Todos los alumnos</option>
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
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#20B2AA] hover:bg-[#1CA099] text-white rounded-xl text-xs font-semibold"
                >
                  Crear y Publicar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VISOR DE DOCUMENTOS Y EVIDENCIAS                 */}
      {/* ========================================================= */}
      {modalVisorAbierto && archivoAVisualizar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Cabecera del visor */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#20B2AA] flex items-center justify-center shrink-0">
                  {archivoAVisualizar.tipo.startsWith('image/') || archivoAVisualizar.nombre.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                    <Eye className="w-5 h-5 text-[#20B2AA]" />
                  ) : archivoAVisualizar.tipo === 'application/pdf' || archivoAVisualizar.nombre.endsWith('.pdf') ? (
                    <FileText className="w-5 h-5 text-rose-500" />
                  ) : archivoAVisualizar.nombre.match(/\.(xlsx|xls|csv)$/i) ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  ) : archivoAVisualizar.nombre.match(/\.(zip|rar|7z|tar|gz)$/i) ? (
                    <FileArchive className="w-5 h-5 text-purple-600" />
                  ) : archivoAVisualizar.nombre.match(/\.(js|ts|py|sql|html|css|json|md|txt)$/i) ? (
                    <FileCode className="w-5 h-5 text-amber-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#20B2AA]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                      {archivoAVisualizar.nombre}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20B2AA]/15 text-[#0E7470] dark:text-[#20B2AA]">
                      {archivoAVisualizar.categoria}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {archivoAVisualizar.tamanoFormateado} &bull; Subido por <strong>{archivoAVisualizar.autorNombre}</strong> ({archivoAVisualizar.autorRol}) &bull; {new Date(archivoAVisualizar.fechaSubida).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDescargar(archivoAVisualizar)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#20B2AA] hover:bg-[#1CA099] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Descargar y guardar copia original en tu equipo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar / Abrir</span>
                </button>

                <button
                  type="button"
                  onClick={handleCerrarVisor}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Cerrar visor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido / Vista Previa del Documento */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[380px]">
              {/* CASO 1: IMÁGENES */}
              {archivoAVisualizar.tipo.startsWith('image/') || archivoAVisualizar.nombre.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {/* Controles de zoom para imágenes */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs text-xs font-medium text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      onClick={() => setZoomImagen((prev) => Math.max(50, prev - 25))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                      title="Alejar"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] px-1">{zoomImagen}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomImagen((prev) => Math.min(200, prev + 25))}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                      title="Acercar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomImagen(100)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer ml-1 text-slate-400 hover:text-slate-700"
                      title="Restablecer tamaño"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-[64vh] overflow-auto flex items-center justify-center p-2 w-full">
                    <img
                      src={blobUrlActual || archivoAVisualizar.contenidoDataUrl}
                      alt={archivoAVisualizar.nombre}
                      style={{ transform: `scale(${zoomImagen / 100})`, transformOrigin: 'center center' }}
                      className="max-h-[58vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-slate-800 transition-transform duration-150"
                    />
                  </div>
                </div>
              ) : textoDecodificado !== null ? (
                /* CASO 2: TEXTO / CÓDIGO / MARKDOWN / CSV / JSON DECODIFICADO */
                <div className="w-full max-w-3xl flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                      <FileCode className="w-4 h-4 text-[#20B2AA]" />
                      <span>Contenido de Texto del Archivo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopiarAlPortapapeles(textoDecodificado)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiadoTexto ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiadoTexto ? 'Copiado' : 'Copiar Texto'}</span>
                    </button>
                  </div>
                  <pre className="p-4 overflow-auto max-h-[60vh] font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text bg-slate-50/50 dark:bg-slate-950/60">
                    {textoDecodificado || '(El archivo no contiene texto legible)'}
                  </pre>
                </div>
              ) : archivoAVisualizar.tipo === 'application/pdf' || archivoAVisualizar.nombre.endsWith('.pdf') ? (
                /* CASO 3: DOCUMENTO PDF */
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <span>Documento PDF: {archivoAVisualizar.nombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDescargar(archivoAVisualizar)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Abrir en Visor PDF Nativo</span>
                    </button>
                  </div>

                  <iframe
                    src={blobUrlActual || archivoAVisualizar.contenidoDataUrl}
                    title={archivoAVisualizar.nombre}
                    className="w-full h-[62vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                  />
                </div>
              ) : (
                /* CASO 4: DOCUMENTOS OFFICE (WORD, EXCEL, POWERPOINT) Y COMPRIMIDOS */
                <div className="max-w-lg w-full bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-sm animate-in zoom-in-95 duration-150">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#20B2AA] flex items-center justify-center mx-auto">
                    {archivoAVisualizar.nombre.match(/\.(xlsx|xls)$/i) ? (
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    ) : archivoAVisualizar.nombre.match(/\.(zip|rar|7z)$/i) ? (
                      <FileArchive className="w-8 h-8 text-purple-600" />
                    ) : (
                      <FileText className="w-8 h-8 text-[#20B2AA]" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white break-all">
                      {archivoAVisualizar.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {archivoAVisualizar.categoria} &bull; {archivoAVisualizar.tamanoFormateado} &bull; Formato: {archivoAVisualizar.tipo || 'Documento binario'}
                    </p>
                  </div>

                  {archivoAVisualizar.descripcion && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Descripción de la entrega:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                        &ldquo;{archivoAVisualizar.descripcion}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-3 text-left">
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      💡 <strong>Apertura de Documentos:</strong> Los archivos de Microsoft Office (.docx, .xlsx, .pptx) y comprimidos se descargan y abren de forma nativa en tu suite ofimática preferida con 100% de fidelidad tipográfica y de fórmulas.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDescargar(archivoAVisualizar)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#20B2AA] hover:bg-[#1CA099] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar y Abrir en mi Equipo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopiarAlPortapapeles(archivoAVisualizar.nombre)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiadoTexto ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiadoTexto ? 'Copiado' : 'Copiar Nombre'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pie del visor con comentarios del tutor si existen */}
            {archivoAVisualizar.comentarioTutor && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#0E7470] dark:text-[#20B2AA] mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Retroalimentación del Tutor ({archivoAVisualizar.estadoRevision}):</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  &ldquo;{archivoAVisualizar.comentarioTutor}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: CONFIRMAR ELIMINACIÓN DE ARCHIVO (SIN WINDOW.CONFIRM) */}
      {/* ========================================================= */}
      {modalEliminarAbierto && archivoAEliminar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                ¿Eliminar archivo permanentemente?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Se borrará del almacenamiento persistente de forma irreversible.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {archivoAEliminar.nombre}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {archivoAEliminar.categoria} &bull; {archivoAEliminar.tamanoFormateado} &bull; Subido por {archivoAEliminar.autorNombre}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalEliminarAbierto(false);
                  setArchivoAEliminar(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminandoArchivo}
                onClick={handleEjecutarEliminacion}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{eliminandoArchivo ? 'Eliminando...' : 'Sí, Eliminar Archivo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

