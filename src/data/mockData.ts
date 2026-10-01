import { Tutor, EstudianteCatalogo, AsignacionTutorado } from '../types/tutoria';

export const TUTORES_DEMO: Tutor[] = [
  {
    id: 'tutor-001',
    nombre: 'Dr. Roberto Mendoza Salinas',
    email: 'roberto.mendoza@universidad.edu.mx',
    departamento: 'Ingeniería en Sistemas Computacionales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rol: 'tutor',
    cubículo: 'Edificio B, Cubículo 204'
  },
  {
    id: 'tutor-002',
    nombre: 'Mtra. Sofía Álvarez Morales',
    email: 'sofia.alvarez@universidad.edu.mx',
    departamento: 'Ingeniería Industrial y Gestión',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rol: 'tutor',
    cubículo: 'Edificio C, Cubículo 112'
  },
  {
    id: 'tutor-003',
    nombre: 'Dr. Carlos Emilio Villarreal',
    email: 'carlos.villarreal@universidad.edu.mx',
    departamento: 'Licenciatura en Administración',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rol: 'tutor',
    cubículo: 'Edificio A, Cubículo 305'
  }
];

export const CATALOGO_ESTUDIANTES: EstudianteCatalogo[] = [
  {
    id: 'est-101',
    matricula: '2023-ISC-014',
    nombre: 'Ana Lucía Morales Rivera',
    email: 'ana.morales@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 4,
    promedio: 9.4,
    telefono: '+52 55 4123 9081',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-102',
    matricula: '2022-ISC-089',
    nombre: 'Diego Alejandro Torres Vega',
    email: 'diego.torres@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 6,
    promedio: 7.2,
    telefono: '+52 55 8734 1120',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-103',
    matricula: '2024-ISC-003',
    nombre: 'Mariana Celeste Gómez Pardo',
    email: 'mariana.gomez@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 2,
    promedio: 8.8,
    telefono: '+52 55 6289 0041',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-104',
    matricula: '2023-ISC-055',
    nombre: 'Gabriel Enrique Peña Ruiz',
    email: 'gabriel.pena@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 4,
    promedio: 6.8,
    telefono: '+52 55 9912 3456',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-105',
    matricula: '2021-IND-042',
    nombre: 'Valeria Montserrat Domínguez',
    email: 'valeria.dominguez@alumno.universidad.edu.mx',
    carrera: 'Ingeniería Industrial',
    semestre: 8,
    promedio: 9.1,
    telefono: '+52 55 1209 8834',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-106',
    matricula: '2023-IND-019',
    nombre: 'Sebastián Ortiz Navarro',
    email: 'sebastian.ortiz@alumno.universidad.edu.mx',
    carrera: 'Ingeniería Industrial',
    semestre: 5,
    promedio: 7.9,
    telefono: '+52 55 4567 1198',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-107',
    matricula: '2024-ADM-012',
    nombre: 'Camila Fernanda Silva Cruz',
    email: 'camila.silva@alumno.universidad.edu.mx',
    carrera: 'Licenciatura en Administración',
    semestre: 2,
    promedio: 8.5,
    telefono: '+52 55 7712 3344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-108',
    matricula: '2022-ADM-067',
    nombre: 'Javier Rodrigo Meza Solís',
    email: 'javier.meza@alumno.universidad.edu.mx',
    carrera: 'Licenciatura en Administración',
    semestre: 6,
    promedio: 6.5,
    telefono: '+52 55 3321 9900',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  // Alumnos sin tutor asignado (listos para ser agregados):
  {
    id: 'est-109',
    matricula: '2024-ISC-099',
    nombre: 'Leonardo Daniel Fuentes Lozano',
    email: 'leonardo.fuentes@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 1,
    promedio: 8.9,
    telefono: '+52 55 8899 4433',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-110',
    matricula: '2023-ISC-038',
    nombre: 'Paola Jimena Cárdenas Gil',
    email: 'paola.cardenas@alumno.universidad.edu.mx',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: 3,
    promedio: 8.2,
    telefono: '+52 55 6677 8811',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'est-111',
    matricula: '2024-IND-005',
    nombre: 'Rodrigo Andrés Castro Peña',
    email: 'rodrigo.castro@alumno.universidad.edu.mx',
    carrera: 'Ingeniería Industrial',
    semestre: 2,
    promedio: 9.0,
    telefono: '+52 55 1122 3344',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

export const ASIGNACIONES_INICIALES: AsignacionTutorado[] = [
  // Tutor 1 (Dr. Roberto Mendoza)
  {
    id: 'asig-001',
    tutorId: 'tutor-001',
    estudianteId: 'est-101',
    estudiante: CATALOGO_ESTUDIANTES[0],
    fechaAsignacion: '2026-01-15T09:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'ACTIVO',
    observaciones: 'Excelente desempeño académico. Interesada en proyecto de titulación en IA.',
    notas: [
      {
        id: 'nota-1',
        fecha: '2026-02-10T11:00:00.000Z',
        tipo: 'Sesión Ordinaria',
        contenido: 'Revisión de avance curricular. Alumna sin materias reprobadas y con postulación a beca.',
        autorId: 'tutor-001'
      }
    ]
  },
  {
    id: 'asig-002',
    tutorId: 'tutor-001',
    estudianteId: 'est-102',
    estudiante: CATALOGO_ESTUDIANTES[1],
    fechaAsignacion: '2026-01-15T09:30:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'EN_RIESGO',
    observaciones: 'Problemas en Cálculo Vectorial y Estructuras de Datos. Requiere asesoría académica prioritaria.',
    notas: [
      {
        id: 'nota-2',
        fecha: '2026-02-18T16:00:00.000Z',
        tipo: 'Alerta Académica',
        contenido: 'Se canalizó a círculo de estudios de matemáticas y se acordó seguimiento quincenal.',
        autorId: 'tutor-001'
      }
    ]
  },
  {
    id: 'asig-003',
    tutorId: 'tutor-001',
    estudianteId: 'est-103',
    estudiante: CATALOGO_ESTUDIANTES[2],
    fechaAsignacion: '2026-02-01T10:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'ACTIVO',
    observaciones: 'Estudiante de nuevo ingreso con buena adaptación universitaria.',
    notas: []
  },
  {
    id: 'asig-004',
    tutorId: 'tutor-001',
    estudianteId: 'est-104',
    estudiante: CATALOGO_ESTUDIANTES[3],
    fechaAsignacion: '2026-01-20T12:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'CONDICIONADO',
    observaciones: 'Baja asistencia durante el primer mes por temas de transporte foráneo.',
    notas: [
      {
        id: 'nota-3',
        fecha: '2026-03-01T10:30:00.000Z',
        tipo: 'Orientación Vocacional',
        contenido: 'Se gestionó apoyo de movilidad y horario especial con coordinadores de materia.',
        autorId: 'tutor-001'
      }
    ]
  },

  // Tutor 2 (Mtra. Sofía Álvarez)
  {
    id: 'asig-005',
    tutorId: 'tutor-002',
    estudianteId: 'est-105',
    estudiante: CATALOGO_ESTUDIANTES[4],
    fechaAsignacion: '2026-01-16T11:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'ACTIVO',
    observaciones: 'Preparando examen de egreso y residencia profesional.',
    notas: []
  },
  {
    id: 'asig-006',
    tutorId: 'tutor-002',
    estudianteId: 'est-106',
    estudiante: CATALOGO_ESTUDIANTES[5],
    fechaAsignacion: '2026-01-18T10:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'ACTIVO',
    observaciones: 'Asistencia regular a tutorías grupales.',
    notas: []
  },

  // Tutor 3 (Dr. Carlos Villarreal)
  {
    id: 'asig-007',
    tutorId: 'tutor-003',
    estudianteId: 'est-107',
    estudiante: CATALOGO_ESTUDIANTES[6],
    fechaAsignacion: '2026-01-22T09:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'ACTIVO',
    observaciones: 'Participando en concurso de emprendimiento.',
    notas: []
  },
  {
    id: 'asig-008',
    tutorId: 'tutor-003',
    estudianteId: 'est-108',
    estudiante: CATALOGO_ESTUDIANTES[7],
    fechaAsignacion: '2026-01-25T14:00:00.000Z',
    periodoEscolar: '2026-1',
    estado: 'EN_RIESGO',
    observaciones: 'Materias en segunda oportunidad.',
    notas: []
  }
];
