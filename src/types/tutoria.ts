export type RolSimulado = 'TUTOR' | 'ALUMNO';

export interface Tutor {
  id: string;
  nombre: string;
  email: string;
  departamento: string;
  avatar: string;
  rol: 'tutor';
  cubículo: string;
}

export interface EstudianteCatalogo {
  id: string;
  matricula: string;
  nombre: string;
  email: string;
  carrera: string;
  semestre: number;
  promedio: number;
  telefono: string;
  avatar: string;
}

export type EstadoTutorado = 'ACTIVO' | 'EN_RIESGO' | 'CONDICIONADO' | 'CONCLUIDO';

export interface NotaSeguimiento {
  id: string;
  fecha: string;
  tipo: 'Sesión Ordinaria' | 'Alerta Académica' | 'Canalización Psicológica' | 'Orientación Vocacional';
  contenido: string;
  autorId: string;
}

export interface AsignacionTutorado {
  id: string; // ID de la asignación (relación)
  tutorId: string; // FK a Tutor
  estudianteId: string; // FK a Estudiante
  estudiante: EstudianteCatalogo; // Datos denormalizados o populados del estudiante
  fechaAsignacion: string; // ISO Date
  periodoEscolar: string; // Ej: "2026-1"
  estado: EstadoTutorado;
  observaciones?: string;
  notas: NotaSeguimiento[];
}

export interface AsignarTutoradoPayload {
  estudianteEmailOrMatricula: string;
  periodoEscolar: string;
  observaciones?: string;
  estadoInicial?: EstadoTutorado;
}

export interface CitaAsesoria {
  id: string;
  estudianteId: string;
  tutorId: string;
  fecha: string;
  hora: string;
  tema: string;
  modalidad: 'Presencial' | 'Virtual';
  estado: 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada';
  lugar?: string;
  enlaceVirtual?: string;
  motivoDetalle?: string;
}

export interface SolicitarAsesoriaPayload {
  estudianteId: string;
  tutorId: string;
  tema: string;
  fecha: string;
  hora: string;
  modalidad: 'Presencial' | 'Virtual';
  motivoDetalle: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface BackendGuardSpec {
  endpoint: string;
  metodo: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  rolRequerido: 'TUTOR' | 'ALUMNO';
  reglaAislamiento: string;
  codigoErrorSiFalla: 401 | 403 | 404;
}
