import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { cerrarSesion } from '../../storage/secureStorage';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const [perfilRes, historialRes] = await Promise.all([
        apiClient.get('/api/user/mi-perfil'),
        apiClient.get('/api/user/mi-historial'),
      ]);
      setPerfil(perfilRes.data);
      setHistorial(historialRes.data);
    } catch { }
    finally { setLoading(false); }
  }

  async function handleCerrarSesion() {
    await cerrarSesion();
    router.replace('/(auth)/login');
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const ultimaEval = historial[0] ?? null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSub, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Hola, {perfil?.nombre?.split(' ')[0] ?? 'Usuario'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCerrarSesion} style={[styles.logoutBtn, { borderColor: colors.logoutBorder, backgroundColor: colors.card }]}>
          <Text style={[styles.logoutText, { color: colors.logoutText }]}>Salir</Text>
        </TouchableOpacity>
      </View>

      {ultimaEval ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: getColorCat(ultimaEval.categoria_riesgo) }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Tu último resultado</Text>
          <View style={styles.resultRow}>
            <View style={[styles.resultBadge, { backgroundColor: getBgCat(ultimaEval.categoria_riesgo) }]}>
              <Text style={[styles.resultBadgeText, { color: getColorCat(ultimaEval.categoria_riesgo) }]}>
                Riesgo {ultimaEval.categoria_riesgo.charAt(0).toUpperCase() + ultimaEval.categoria_riesgo.slice(1)}
              </Text>
            </View>
            <Text style={[styles.resultFecha, { color: colors.textMuted }]}>
              {new Date(ultimaEval.fecha).toLocaleDateString('es-PE')}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Aún no tienes evaluaciones</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>Realiza tu primera evaluación crediticia</Text>
        </View>
      )}

      <View style={styles.accionesGrid}>
        {[
          { bg: colors.primary, icon: '+', label: 'Nueva evaluación', ruta: '/(user)/formulario' },
          { bg: '#1A1A2E', icon: '👥', label: 'Comunidad', ruta: '/(user)/comunidad' },
          { bg: colors.success, icon: '🎯', label: 'Mi meta', ruta: '/(user)/meta' },
          { bg: colors.warning, icon: '👤', label: 'Mi perfil', ruta: '/(user)/perfil' },
        ].map(({ bg, icon, label, ruta }) => (
          <TouchableOpacity key={ruta} style={[styles.accionBtn, { backgroundColor: bg }]} onPress={() => router.push(ruta as any)}>
            <Text style={styles.accionIcon}>{icon}</Text>
            <Text style={styles.accionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.infoBtn, { backgroundColor: colors.card, borderColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={[styles.infoBtnText, { color: colors.primary }]}>¿Qué es el riesgo crediticio?</Text>
      </TouchableOpacity>

      {historial.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Historial de evaluaciones</Text>
          {historial.slice(0, 5).map((e: any) => (
            <View key={e.id} style={[styles.historialRow, { borderBottomColor: colors.divider }]}>
              <View style={[styles.historialDot, { backgroundColor: getColorCat(e.categoria_riesgo) }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.historialCategoria, { color: colors.textPrimary }]}>
                  Riesgo {e.categoria_riesgo.charAt(0).toUpperCase() + e.categoria_riesgo.slice(1)}
                </Text>
                <Text style={[styles.historialFecha, { color: colors.textMuted }]}>
                  {new Date(e.fecha).toLocaleDateString('es-PE')}
                </Text>
              </View>
              <View style={[styles.historialBadge, { backgroundColor: getBgCat(e.categoria_riesgo) }]}>
                <Text style={[styles.historialBadgeText, { color: getColorCat(e.categoria_riesgo) }]}>
                  {e.categoria_riesgo.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>¿Qué es el riesgo crediticio?</Text>
            <ScrollView style={{ maxHeight: 340 }}>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                El <Text style={[styles.bold, { color: colors.textPrimary }]}>riesgo crediticio</Text> es la probabilidad de que una persona no pueda cumplir con sus obligaciones financieras en el tiempo acordado.
              </Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                En términos simples: es una medida de qué tan confiable eres financieramente ante una entidad bancaria o prestamista.
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textPrimary }]}>¿Cómo se clasifica?</Text>
              {[
                { color: colors.success, label: 'Riesgo Bajo', desc: 'Buena salud financiera. Pagas a tiempo y tienes ingresos estables.' },
                { color: colors.warning, label: 'Riesgo Medio', desc: 'Hay aspectos a mejorar. Puedes acceder a créditos, pero con más restricciones.' },
                { color: colors.danger, label: 'Riesgo Alto', desc: 'Situación financiera delicada. Se recomienda tomar medidas para mejorar tu perfil.' },
              ].map(({ color, label, desc }) => (
                <View key={label} style={styles.modalRiesgoRow}>
                  <View style={[styles.modalRiesgoDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalRiesgoLabel, { color: colors.textPrimary }]}>{label}</Text>
                    <Text style={[styles.modalRiesgoDesc, { color: colors.textSecondary }]}>{desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerSub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  logoutText: { fontSize: 13, fontWeight: '500' },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  cardSub: { fontSize: 13 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  resultBadgeText: { fontSize: 14, fontWeight: '700' },
  resultFecha: { fontSize: 12 },
  accionesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  accionBtn: { width: '47%', borderRadius: 16, padding: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  accionIcon: { fontSize: 28, marginBottom: 8 },
  accionLabel: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  infoBtn: { borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 14, borderWidth: 1.5 },
  infoBtnText: { fontSize: 14, fontWeight: '600' },
  historialRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  historialDot: { width: 10, height: 10, borderRadius: 5 },
  historialCategoria: { fontSize: 13, fontWeight: '600' },
  historialFecha: { fontSize: 11, marginTop: 2 },
  historialBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historialBadgeText: { fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  modalText: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  modalSubtitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  modalRiesgoRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  modalRiesgoDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  modalRiesgoLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  modalRiesgoDesc: { fontSize: 12, lineHeight: 18 },
  bold: { fontWeight: '700' },
  modalBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});