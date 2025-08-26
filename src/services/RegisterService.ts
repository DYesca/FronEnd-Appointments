/**
 * @fileoverview Servicio de registro de clientes
 * @description Este servicio maneja el registro de nuevos clientes en la aplicación,
 * incluyendo validación de datos y comunicación con la API backend.
 * @author Integrador III - Frontend Team
 * @version 1.0.0
 */

/**
 * Interfaz que define la estructura de datos requerida para el registro de un cliente
 * @interface RegisterDataClient
 */
export interface RegisterDataClient {
  /** Nombre del cliente */
  first_name: string;
  /** Apellido del cliente */
  last_name: string;
  /** Número de cédula del cliente */
  cedula: string;
  /** Correo electrónico del cliente */
  email: string;
  /** Número de teléfono del cliente (8 dígitos) */
  personal_phone_number: string;
  /** Contraseña del cliente */
  password: string;
  /** Confirmación de la contraseña */
  password_confirmation: string;
}

/** URL base de la API obtenida desde las variables de entorno */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Servicio para el registro de clientes
 * @namespace registerService
 */
export const registerService = {
  /**
   * Registra un nuevo cliente en el sistema
   * 
   * @async
   * @function registerClient
   * @param {RegisterDataClient} data - Datos del cliente a registrar
   * @throws {Error} Lanza un error si la validación falla o si hay problemas en la comunicación con la API
   * @returns {Promise<void>} Promesa que se resuelve cuando el registro es exitoso
   * 
   * @example
   * ```typescript
   * const clientData = {
   *   first_name: 'Juan',
   *   last_name: 'Pérez',
   *   cedula: '123456789',
   *   email: 'juan@email.com',
   *   personal_phone_number: '12345678',
   *   password: 'password123',
   *   password_confirmation: 'password123'
   * };
   * 
   * try {
   *   await registerService.registerClient(clientData);
   *   console.log('Cliente registrado exitosamente');
   * } catch (error) {
   *   console.error('Error en el registro:', error.message);
   * }
   * ```
   */
  async registerClient(data: RegisterDataClient): Promise<void>{
    // Validar los datos antes de enviar la petición
    const errors: string[] = validateData(data);
    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }
    
    try {
      // Realizar petición POST a la API para registrar el cliente
      const response = await fetch(`${API_BASE_URL}/register/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error('Error en el registro del cliente');
      }
    } catch (error : any) {
      // Re-lanzar el error con información adicional
      throw new Error(`Error en el servicio de registro: ${error.message}`);
    }
  }
}

/**
 * Valida los datos del cliente antes del registro
 * 
 * @function validateData
 * @param {RegisterDataClient} data - Datos del cliente a validar
 * @returns {string[]} Array de errores encontrados durante la validación
 * 
 * @description
 * Realiza las siguientes validaciones:
 * - Verifica que todos los campos requeridos estén presentes
 * - Comprueba que las contraseñas coincidan
 * - Valida el formato del email usando expresiones regulares
 * - Verifica que el teléfono tenga exactamente 8 dígitos
 * 
 * @example
 * ```typescript
 * const errors = validateData(clientData);
 * if (errors.length > 0) {
 *   console.log('Errores de validación:', errors);
 * }
 * ```
 */
function validateData(data: RegisterDataClient): string[] {
    const errors: string[] = [];
    
    // Validación de campos obligatorios
    if (!data.first_name || !data.last_name || !data.cedula || !data.email || !data.personal_phone_number || !data.password || !data.password_confirmation) {
        errors.push('Todos los campos son obligatorios.');
    }
    
    // Validación de confirmación de contraseña
    if (data.password !== data.password_confirmation) {
        errors.push('Las contraseñas no coinciden.');
    }
    
    // Validación de formato de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        errors.push('El email no es válido.');
    }
    
    // Validación de formato de teléfono (exactamente 8 dígitos)
    const phonePattern = /^\d{8}$/;
    if (!phonePattern.test(data.personal_phone_number)) {
        errors.push('El teléfono debe contener exactamente 8 dígitos.');
    }
    
    return errors;
}

/**
 * @module RegisterService
 * @description
 * Este módulo proporciona funcionalidades para el registro de clientes en la aplicación.
 * 
 * ## Características principales:
 * - Validación completa de datos del cliente
 * - Comunicación segura con la API backend
 * - Manejo de errores robusto
 * - Interfaz TypeScript para type safety
 * 
 * ## Validaciones implementadas:
 * - **Campos obligatorios**: Todos los campos deben estar presentes
 * - **Email**: Debe tener un formato válido (usuario@dominio.com)
 * - **Teléfono**: Debe contener exactamente 8 dígitos numéricos
 * - **Contraseñas**: Deben coincidir entre sí
 * 
 * ## Endpoint utilizado:
 * - `POST /register/client` - Registro de nuevos clientes
 * 
 * ## Variables de entorno requeridas:
 * - `VITE_API_BASE_URL` - URL base de la API backend
 * 
 * ## Manejo de errores:
 * El servicio puede lanzar errores en los siguientes casos:
 * - Datos de validación incorrectos
 * - Problemas de conectividad con la API
 * - Respuestas de error del servidor
 * 
 * @since 1.0.0
 */
