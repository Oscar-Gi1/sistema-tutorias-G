import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tutoriaService } from '../services/tutoriaService';
import { NotaPersonalItem } from '../types/tutoria';
import {
  NotebookPen,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const NotasPersonalesView: React.FC = () => {
  const { sesion } = useAuth();
  const estudianteId = sesion?.usuario.estudianteProfileId || 'est-101';

  const [notas, setNotas] = useState<NotaPersonalItem[]>([]);
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');
  const [nuevaNotaCategoria, setNuevaNotaCategoria] = useState<NotaPersonalItem['categoria']>('Duda de Asesoría');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const cargarNotas = async () => {
    const res = await tutoriaService.getNotasPersonales(estudianteId);
    if (res.success && res.data) {
      setNotas(res.data);
    }
  };

  useEffect(() => {
    cargarNotas();
    const unsub = tutoriaService.subscribe(() => {
      cargarNotas();
    });
    return () => unsub();
  }, [estudianteId]);

  const handleAgregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim()) return;

    await tutoriaService.guardarNotaPersonal({
      alumnoId: estudianteId,
      categoria: nuevaNotaCategoria,
      texto: nuevaNotaTexto.trim()
    });

    setNuevaNotaTexto('');
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 2500);
    await cargarNotas();
  };

  const handleEliminarNota = async (id: string | number) => {
    await tutoriaService.eliminarNotaPersonal(id);
    await cargarNotas();
  };

  const notasFiltradas = notas.filter(nota => {
    const coincideTexto =
      !busqueda.trim() ||
      nota.texto.toLowerCase().includes(busqueda.toLowerCase()) ||
      nota.categoria.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = filtroCategoria === 'TODAS' || nota.categoria === filtroCategoria;
    return coincideTexto && coincideCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Header / Hero de la Vista Dedicada de Notas */}
      <section className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EE7402]/15 text-[#EE7402] flex items-center justify-center shrink-0">
              <NotebookPen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EE7402]/10 text-[#EE7402] dark:text-[#EE7402] font-heading">
                  Cuaderno Privado UAT
                </span>
                <span className="text-xs text-[#64748B] dark:text-slate-400">
                  {notas.length} {notas.length === 1 ? 'nota guardada' : 'notas guardadas'}
                </span>
              </div>
              <h1 className="font-heading font-semibold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 tracking-tight">
                Mis Notas Personales
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Espacio exclusivo para tus apuntes, dudas previas a la sesión y compromisos con tu tutor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Formulario para Crear Nueva Nota */}
      <section className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/90 dark:border-slate-800">
        <h2 className="font-heading font-semibold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>✍️ Redactar Nueva Nota</span>
        </h2>

        {mensajeGuardado && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Nota agregada correctamente a tu cuaderno personal.</span>
          </div>
        )}

        <form onSubmit={handleAgregarNota} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={nuevaNotaCategoria}
                onChange={(e) => setNuevaNotaCategoria(e.target.value as NotaPersonalItem['categoria'])}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 focus:border-[#EE7402] cursor-pointer"
              >
                <option value="Duda de Asesoría">Duda de Asesoría</option>
                <option value="Recordatorio">Recordatorio de Estudio</option>
                <option value="Trámite / Beca">Trámite o Beca</option>
                <option value="General">Apunte General</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contenido del apunte o recordatorio
              </label>
              <textarea
                value={nuevaNotaTexto}
                onChange={(e) => setNuevaNotaTexto(e.target.value)}
                placeholder="Escribe lo que quieres recordar o plantearle a tu tutor..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30 focus:border-[#EE7402] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-[#64748B] dark:text-slate-400">
              Solo tú puedes ver estas notas privadas
            </span>

            <button
              type="submit"
              disabled={!nuevaNotaTexto.trim()}
              className="px-4 py-2 bg-[#EE7402] hover:bg-[#D96200] active:bg-[#BF5600] disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Guardar Nota</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Filtros y Búsqueda de Notas */}
      <section className="bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Mis Apuntes Guardados ({notasFiltradas.length})
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Filtra por categoría o busca palabras clave
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en mis notas..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE7402]/30"
            />
          </div>
        </div>

        {/* Chips de Categoría */}
        <div className="flex items-center gap-2 flex-wrap">
          {['TODAS', 'Duda de Asesoría', 'Recordatorio', 'Trámite / Beca', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filtroCategoria === cat
                  ? 'bg-[#EE7402] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'TODAS' ? 'Todas las Notas' : cat}
            </button>
          ))}
        </div>

        {/* Cuadrícula de Notas */}
        {notasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {notasFiltradas.map((nota) => (
              <div
                key={nota.id}
                className="bg-[#F1F5F9] dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700 flex flex-col justify-between gap-3 transition-all hover:border-[#EE7402]/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[#EE7402] dark:text-[#EE7402] border border-slate-200 dark:border-slate-600">
                      {nota.categoria}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                      {nota.fecha}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                    {nota.texto}
                  </p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => handleEliminarNota(nota.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 p-1 rounded-md transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Eliminar nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#64748B] dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <NotebookPen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No se encontraron notas</p>
            <p className="mt-1">Agrega una nueva nota en el formulario superior para comenzar tu cuaderno privado.</p>
          </div>
        )}
      </section>
    </div>
  );
};
