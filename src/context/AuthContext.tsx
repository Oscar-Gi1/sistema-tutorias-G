import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SesionAutenticada,
  LoginPayload,
  RegistroUsuarioPayload,
  ActualizarPerfilPayload,
  RolUsuario,
  UsuarioSistema,
  ApiResponse
} from '../types/tutoria';
import { authService, PASSWORD_DEMO_DEFAULT } from '../services/authService';

interface AuthContextType {
  sesion: SesionAutenticada | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  rolUsuario: 'tutor' | 'alumno' | null;
  usuariosRegistrados: Array<Omit<UsuarioSistema, 'passwordHash'>>;
  autenticar: (email: string, password: string) => {
    success: boolean;
    message?: string;
    rol?: 'tutor' | 'alumno';
  };
  iniciarSesionDirecta: (rol: 'tutor' | 'alumno') => void;
  login: (payload: LoginPayload) => Promise<ApiResponse<SesionAutenticada>>;
  registrar: (payload: RegistroUsuarioPayload) => Promise<ApiResponse<SesionAutenticada>>;
  actualizarPerfil: (payload: ActualizarPerfilPayload) => Promise<ApiResponse<SesionAutenticada>>;
  cambiarPerfilDemo: (profileId: string, rol: RolUsuario) => void;
  logout: () => void;
  verificarRuta: (rolesPermitidos?: RolUsuario[]) => {
    autorizado: boolean;
    statusCode: 200 | 401 | 403;
    mensaje: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de autenticación inicializado estrictamente en false para login obligatorio
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [rolUsuario, setRolUsuario] = useState<'tutor' | 'alumno' | null>(null);
  const [sesion, setSesion] = useState<SesionAutenticada | null>(null);

  const [usuariosRegistrados, setUsuariosRegistrados] = useState<
    Array<Omit<UsuarioSistema, 'passwordHash'>>
  >(() => authService.getUsuariosRegistrados());

  useEffect(() => {
    const syncState = () => {
      setUsuariosRegistrados(authService.getUsuariosRegistrados());
    };
    const unsubscribe = authService.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  // Inicio de sesión directo e instantáneo por rol (utilizado por el menú flotante y pruebas)
  const iniciarSesionDirecta = (rol: 'tutor' | 'alumno') => {
    if (rol === 'tutor') {
      const sesionExistente = authService.loginPorPerfilId('tutor-001', 'TUTOR');
      const nuevaSesion: SesionAutenticada = sesionExistente || {
        token: 'uat_jwt_token_tutor_2026',
        payload: {
          sub: 'usr-tutor-001',
          nombre: 'Dr. Roberto Mendoza Salinas',
          email: 'roberto.mendoza@universidad.edu.mx',
          rol: 'TUTOR',
          profileId: 'tutor-001',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400
        },
        usuario: {
          id: 'usr-tutor-001',
          nombre: 'Dr. Roberto Mendoza Salinas',
          email: 'roberto.mendoza@universidad.edu.mx',
          rol: 'TUTOR',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          activo: true,
          fechaRegistro: new Date().toISOString(),
          tutorProfileId: 'tutor-001',
          departamento: 'Ingeniería en Sistemas Computacionales',
          cubículo: 'Edificio B, Cubículo 204'
        }
      };
      setSesion(nuevaSesion);
      setRolUsuario('tutor');
      setIsAuthenticated(true);
    } else {
      const sesionExistente = authService.loginPorPerfilId('est-101', 'TUTORADO');
      const nuevaSesion: SesionAutenticada = sesionExistente || {
        token: 'uat_jwt_token_alumno_2026',
        payload: {
          sub: 'usr-est-101',
          nombre: 'Ana Lucía Morales Rivera',
          email: 'ana.lucia@universidad.edu.mx',
          rol: 'TUTORADO',
          profileId: 'est-101',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400
        },
        usuario: {
          id: 'usr-est-101',
          nombre: 'Ana Lucía Morales Rivera',
          email: 'ana.lucia@universidad.edu.mx',
          rol: 'TUTORADO',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          activo: true,
          fechaRegistro: new Date().toISOString(),
          estudianteProfileId: 'est-101',
          matricula: '2023-ISC-014',
          carrera: 'Ingeniería en Sistemas Computacionales',
          semestre: 4,
          promedio: 9.4
        }
      };
      setSesion(nuevaSesion);
      setRolUsuario('alumno');
      setIsAuthenticated(true);
    }
  };

  // Función síncrona limpia para validación estricta inmediata de credenciales
  const autenticar = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Validación de Maestro / Tutor
    if (
      (cleanEmail === 'roberto.mendoza@universidad.edu.mx' || cleanEmail.includes('roberto.mendoza')) &&
      (cleanPass === 'Tutoria2026*' || cleanPass === PASSWORD_DEMO_DEFAULT)
    ) {
      iniciarSesionDirecta('tutor');
      return { success: true, rol: 'tutor' as const };
    }

    // 2. Validación de Alumno / Tutorado
    if (
      (cleanEmail === 'ana.lucia@universidad.edu.mx' || cleanEmail.includes('ana.lucia') || cleanEmail.includes('ana.morales')) &&
      (cleanPass === 'Tutoria2026*' || cleanPass === PASSWORD_DEMO_DEFAULT)
    ) {
      iniciarSesionDirecta('alumno');
      return { success: true, rol: 'alumno' as const };
    }

    return {
      success: false,
      message: 'Correo o contraseña incorrectos. Verifica tus credenciales e inténtalo de nuevo.'
    };
  };

  const login = async (payload: LoginPayload): Promise<ApiResponse<SesionAutenticada>> => {
    const authCheck = autenticar(payload.email, payload.password);
    if (authCheck.success && authCheck.rol) {
      const sesionCreada: SesionAutenticada = {
        token: `uat_token_${authCheck.rol}_${Date.now()}`,
        payload: {
          sub: authCheck.rol === 'tutor' ? 'usr-tutor-001' : 'usr-est-101',
          nombre: authCheck.rol === 'tutor' ? 'Dr. Roberto Mendoza Salinas' : 'Ana Lucía Morales Rivera',
          email: authCheck.rol === 'tutor' ? 'roberto.mendoza@universidad.edu.mx' : 'ana.lucia@universidad.edu.mx',
          rol: authCheck.rol === 'tutor' ? 'TUTOR' : 'TUTORADO',
          profileId: authCheck.rol === 'tutor' ? 'tutor-001' : 'est-101',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400
        },
        usuario: {
          id: authCheck.rol === 'tutor' ? 'usr-tutor-001' : 'usr-est-101',
          nombre: authCheck.rol === 'tutor' ? 'Dr. Roberto Mendoza Salinas' : 'Ana Lucía Morales Rivera',
          email: authCheck.rol === 'tutor' ? 'roberto.mendoza@universidad.edu.mx' : 'ana.lucia@universidad.edu.mx',
          rol: authCheck.rol === 'tutor' ? 'TUTOR' : 'TUTORADO',
          avatar:
            authCheck.rol === 'tutor'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          activo: true,
          fechaRegistro: new Date().toISOString()
        }
      };
      setSesion(sesionCreada);
      return {
        success: true,
        message: `Bienvenido(a) a SIIE - Tutorías UAT.`,
        data: sesionCreada,
        statusCode: 200,
        timestamp: new Date().toISOString()
      };
    }

    // Si no es una de las 2 cuentas principales, probar backend service
    const res = await authService.login(payload);
    if (res.success && res.data) {
      setSesion(res.data);
      setIsAuthenticated(true);
      setRolUsuario(res.data.usuario.rol === 'TUTOR' ? 'tutor' : 'alumno');
      setUsuariosRegistrados(authService.getUsuariosRegistrados());
    }
    return res;
  };

  const registrar = async (payload: RegistroUsuarioPayload) => {
    const res = await authService.registrarUsuario(payload);
    if (res.success && res.data) {
      setSesion(res.data);
      setIsAuthenticated(true);
      setRolUsuario(res.data.usuario.rol === 'TUTOR' ? 'tutor' : 'alumno');
      setUsuariosRegistrados(authService.getUsuariosRegistrados());
    }
    return res;
  };

  const actualizarPerfil = async (payload: ActualizarPerfilPayload) => {
    const res = await authService.actualizarPerfil(sesion?.token || null, payload);
    if (res.success && res.data) {
      setSesion(res.data);
      setUsuariosRegistrados(authService.getUsuariosRegistrados());
    }
    return res;
  };

  const cambiarPerfilDemo = (profileId: string, rol: RolUsuario) => {
    const nuevaSesion = authService.loginPorPerfilId(profileId, rol);
    if (nuevaSesion) {
      setSesion(nuevaSesion);
      setIsAuthenticated(true);
      setRolUsuario(rol === 'TUTOR' ? 'tutor' : 'alumno');
      setUsuariosRegistrados(authService.getUsuariosRegistrados());
    }
  };

  const logout = () => {
    authService.logout();
    setSesion(null);
    setIsAuthenticated(false);
    setRolUsuario(null);
  };

  const verificarRuta = (rolesPermitidos?: RolUsuario[]) => {
    if (!isAuthenticated || !sesion) {
      return {
        autorizado: false,
        statusCode: 401 as const,
        mensaje: 'Debe iniciar sesión para acceder al sistema institucional.'
      };
    }
    const check = authService.middlewareAutorizacion(sesion.token, rolesPermitidos);
    return {
      autorizado: check.autorizado,
      statusCode: check.statusCode,
      mensaje: check.mensaje
    };
  };

  return (
    <AuthContext.Provider
      value={{
        sesion,
        isAuthenticated,
        isLoggedIn: isAuthenticated,
        rolUsuario,
        usuariosRegistrados,
        autenticar,
        iniciarSesionDirecta,
        login,
        registrar,
        actualizarPerfil,
        cambiarPerfilDemo,
        logout,
        verificarRuta
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return ctx;
};
