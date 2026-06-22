import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const ROL_KEY = 'user_rol';

async function guardar(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function obtener(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function eliminar(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function guardarToken(token: string): Promise<void> {
  await guardar(TOKEN_KEY, token);
}

export async function obtenerToken(): Promise<string | null> {
  return await obtener(TOKEN_KEY);
}

export async function eliminarToken(): Promise<void> {
  await eliminar(TOKEN_KEY);
}

export async function guardarRol(rol: string): Promise<void> {
  await guardar(ROL_KEY, rol);
}

export async function obtenerRol(): Promise<string | null> {
  return await obtener(ROL_KEY);
}

export async function eliminarRol(): Promise<void> {
  await eliminar(ROL_KEY);
}

export async function cerrarSesion(): Promise<void> {
  await eliminarToken();
  await eliminarRol();
}