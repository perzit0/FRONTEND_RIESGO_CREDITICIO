import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import apiClient, { BASE_URL } from '../../data/api/client';
import { obtenerToken } from '../../storage/secureStorage';
import { useTheme } from '../../context/ThemeContext';

export default function HistorialScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => { cargarHistorial(); }, []);

  async function cargarHistorial() {
    try {
      const res = await apiClient.get('/api/user/mi-historial');
      setHistorial(res.data);
    } catch { }
    finally { setLoading(false); }
  }

  function getColorCat(cat: string) {
    if (cat === 'bajo') return colors.success;
    if (cat === 'medio') return colors.warning;
    return colors.danger;
  }
  function getBgCat(cat: string) {
    if (cat === 'bajo') return colors.successBg;
    if (cat === 'medio') return colors.warningBg;
    return colors.dangerBg;
  }

  async function handleDescargarPdf(evaluacionId: number, fecha: string) {
    setDescargandoId(evaluacionId);
    try {
      const token = await obtenerToken();
      const fechaArchivo = fecha.split('T')[0];
      const fileUri = FileSystem.documentDirectory + `reporte_riesgo_${fechaArchivo}.pdf`;

      const resultado = await FileSystem.downloadAsync(
        `${BASE_URL}/api/user/evaluacion/${evaluacionId}/pdf`,
        fileUri,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resultado.status !== 200) {
        throw new Error('No se pudo descargar el PDF');
      }

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(resultado.uri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Descargado', `PDF guardado en: ${resultado.uri}`);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo descargar el reporte. Intenta nuevamente.');
    } finally {
      setDescargandoId(null);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Historial de evaluaciones</Text>
      </View>

      {historial.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.vacioText, { color: colors.textMuted }]}>
            Aún no tienes evaluaciones registradas
          </Text>
        </View>
      ) : (
        historial.map((e: any) => (
          <View
            key={e.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: getColorCat(e.categoria_riesgo) }]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.fecha, { color: colors.textMuted }]}>
                {new Date(e.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
              <View style={[styles.badge, { backgroundColor: getBgCat(e.categoria_riesgo) }]}>
                <Text style={[styles.badgeText, { color: getColorCat(e.categoria_riesgo) }]}>
                  {e.categoria_riesgo.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={[styles.score, { color: colors.textPrimary }]}>
              Score: {e.score_final?.toFixed(1) ?? '—'}
            </Text>

            <TouchableOpacity
              style={[styles.btnDescargar, { backgroundColor: colors.primary }]}
              onPress={() => handleDescargarPdf(e.id, e.fecha)}
              disabled={descargandoId === e.id}
            >
              {descargandoId === e.id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnDescargarText}>📄 Descargar reporte PDF</Text>
              )}
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  backText: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  card: {
    borderRadius: 16, padding: 18, borderWidth: 1.5, borderLeftWidth: 5, marginBottom: 14,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fecha: { fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  score: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  btnDescargar: { borderRadius: 12, padding: 12, alignItems: 'center' },
  btnDescargarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  vacioText: { textAlign: 'center', fontSize: 14, paddingVertical: 10 },
});