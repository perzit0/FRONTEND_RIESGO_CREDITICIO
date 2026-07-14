import { Platform } from 'react-native';
import { BASE_URL } from './client';
import { obtenerToken } from '../../storage/secureStorage';

/**
 * Descarga un PDF protegido por JWT y lo entrega al usuario, funcionando
 * de forma consistente tanto en web como en móvil (iOS/Android).
 *
 * - Web: hace fetch con el header Authorization, crea un Blob y dispara
 *   la descarga con un <a download>.
 * - Móvil: usa expo-file-system (con el header Authorization) para bajar
 *   el archivo y expo-sharing para abrir el diálogo de compartir/guardar.
 *
 * Antes cada pantalla lo resolvía a su manera: resultado.tsx abría la URL
 * con Linking (sin token → 401 en móvil) y historial.tsx usaba downloadAsync
 * incluso en web (donde documentDirectory es null). Este helper unifica
 * ambos casos.
 *
 * @param endpoint  Ruta relativa del PDF, ej: `/api/user/evaluacion/12/pdf`
 * @param nombreArchivo  Nombre sugerido del archivo, ej: `Reporte_12.pdf`
 * @returns true si la descarga se completó, false si hubo error.
 */
export async function descargarPdfAutenticado(
  endpoint: string,
  nombreArchivo: string
): Promise<boolean> {
  const token = await obtenerToken();
  const url = `${BASE_URL}${endpoint}`;

  if (Platform.OS === 'web') {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;

    const blob = await response.blob();
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
    return true;
  }

  // Móvil (iOS / Android)
  const FileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');

  const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const fileUri = `${dir}${nombreArchivo}`;

  const resultado = await FileSystem.downloadAsync(url, fileUri, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (resultado.status !== 200) return false;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(resultado.uri, { mimeType: 'application/pdf' });
  }
  return true;
}
