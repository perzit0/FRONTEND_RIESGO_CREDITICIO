import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { cerrarSesion } from '../../storage/secureStorage';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      // El interceptor de client.ts agrega el token automáticamente
      const [perfilRes, historialRes] = await Promise.all([
        apiClient.get('/api/user/mi-perfil'),
        apiClient.get('/api/user/mi-historial'),
      ]);
      setPerfil(perfilRes.data);
      setHistorial(historialRes.data);
    } catch (err) {
      console.log('Error cargando home:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCerrarSesion() {
    await cerrarSesion();
    router.replace('/(auth)/login');
  }

  function getColorCategoria(cat: string) {
    if (cat === 'bajo') return '#059669';
    if (cat === 'medio') return '#D97706';
    return '#DC2626';
  }

  function getBgCategoria(cat: string) {
    if (cat === 'bajo') return '#ECFDF5';
    if (cat === 'medio') return '#FFFBEB';
    return '#FEF2F2';
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
      </View>
    );
  }

  const ultimaEval = historial[0] ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>UNFV — Riesgo Crediticio</Text>
          <Text style={styles.headerTitle}>
            Hola, {perfil?.nombre?.split(' ')[0] ?? 'Usuario'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCerrarSesion} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Última evaluación */}
      {ultimaEval ? (
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getColorCategoria(ultimaEval.categoria_riesgo) }]}>
          <Text style={styles.cardLabel}>Tu último resultado</Text>
          <View style={styles.resultRow}>
            <View style={[styles.resultBadge, { backgroundColor: getBgCategoria(ultimaEval.categoria_riesgo) }]}>
              <Text style={[styles.resultBadgeText, { color: getColorCategoria(ultimaEval.categoria_riesgo) }]}>
                Riesgo {ultimaEval.categoria_riesgo.charAt(0).toUpperCase() + ultimaEval.categoria_riesgo.slice(1)}
              </Text>
            </View>
            <Text style={styles.resultFecha}>
              {new Date(ultimaEval.fecha).toLocaleDateString('es-PE')}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Aún no tienes evaluaciones</Text>
          <Text style={styles.cardSub}>Realiza tu primera evaluación crediticia</Text>
        </View>
      )}

      {/* Acciones principales */}
      <View style={styles.accionesGrid}>
        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: '#6B4EFF' }]}
          onPress={() => router.push('/(user)/formulario')}
        >
          <Text style={styles.accionIcon}>+</Text>
          <Text style={styles.accionLabel}>Nueva evaluación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: '#1A1A2E' }]}
          onPress={() => router.push('/(user)/comunidad')}
        >
          <Text style={styles.accionIcon}>👥</Text>
          <Text style={styles.accionLabel}>Comunidad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: '#059669' }]}
          onPress={() => router.push('/(user)/meta')}
        >
          <Text style={styles.accionIcon}>🎯</Text>
          <Text style={styles.accionLabel}>Mi meta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: '#D97706' }]}
          onPress={() => router.push('/(user)/perfil')}
        >
          <Text style={styles.accionIcon}>👤</Text>
          <Text style={styles.accionLabel}>Mi perfil</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.infoBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.infoBtnText}>¿Qué es el riesgo crediticio?</Text>
      </TouchableOpacity>

      {/* Historial */}
      {historial.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de evaluaciones</Text>
          {historial.slice(0, 5).map((e: any) => (
            <View key={e.id} style={styles.historialRow}>
              <View style={[styles.historialDot, { backgroundColor: getColorCategoria(e.categoria_riesgo) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historialCategoria}>
                  Riesgo {e.categoria_riesgo.charAt(0).toUpperCase() + e.categoria_riesgo.slice(1)}
                </Text>
                <Text style={styles.historialFecha}>
                  {new Date(e.fecha).toLocaleDateString('es-PE')}
                </Text>
              </View>
              <View style={[styles.historialBadge, { backgroundColor: getBgCategoria(e.categoria_riesgo) }]}>
                <Text style={[styles.historialBadgeText, { color: getColorCategoria(e.categoria_riesgo) }]}>
                  {e.categoria_riesgo.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal ¿Qué es el riesgo crediticio? */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Qué es el riesgo crediticio?</Text>
            <ScrollView style={{ maxHeight: 340 }}>
              <Text style={styles.modalText}>
                El <Text style={styles.bold}>riesgo crediticio</Text> es la probabilidad de que una persona no pueda cumplir con sus obligaciones financieras, como pagar un préstamo o una deuda, en el tiempo acordado.
              </Text>
              <Text style={styles.modalText}>
                En términos simples: es una medida de qué tan "confiable" eres financieramente ante una entidad bancaria o prestamista.
              </Text>
              <Text style={styles.modalSubtitle}>¿Cómo se clasifica?</Text>
              {[
                { color: '#059669', label: 'Riesgo Bajo', desc: 'Buena salud financiera. Pagas a tiempo y tienes ingresos estables.' },
                { color: '#D97706', label: 'Riesgo Medio', desc: 'Hay aspectos a mejorar. Puedes acceder a créditos, pero con más restricciones.' },
                { color: '#DC2626', label: 'Riesgo Alto', desc: 'Situación financiera delicada. Se recomienda tomar medidas para mejorar tu perfil.' },
              ].map(({ color, label, desc }) => (
                <View key={label} style={styles.modalRiesgoRow}>
                  <View style={[styles.modalRiesgoDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalRiesgoLabel}>{label}</Text>
                    <Text style={styles.modalRiesgoDesc}>{desc}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.modalSubtitle}>¿Para qué sirve conocerlo?</Text>
              <Text style={styles.modalText}>
                Conocer tu riesgo crediticio te permite tomar mejores decisiones financieras, prepararte para solicitar un crédito, y trabajar en mejorar tu historial antes de necesitarlo.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 20 },
  loadingWrap: { flex: 1, backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerSub: { fontSize: 12, color: '#6B4EFF', fontWeight: '600', marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  logoutText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardLabel: { fontSize: 12, color: '#8892B0', fontWeight: '500', marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#A0AEC0' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  resultBadgeText: { fontSize: 14, fontWeight: '700' },
  resultFecha: { fontSize: 12, color: '#A0AEC0' },
  accionesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  accionBtn: {
    width: '47%', borderRadius: 16, padding: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  accionIcon: { fontSize: 28, marginBottom: 8 },
  accionLabel: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  infoBtn: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 14,
    borderWidth: 1.5, borderColor: '#6B4EFF',
  },
  infoBtnText: { color: '#6B4EFF', fontSize: 14, fontWeight: '600' },
  historialRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0EFFF' },
  historialDot: { width: 10, height: 10, borderRadius: 5 },
  historialCategoria: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  historialFecha: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
  historialBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historialBadgeText: { fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  modalText: { fontSize: 14, color: '#4A5568', lineHeight: 22, marginBottom: 12 },
  modalSubtitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 10, marginTop: 4 },
  modalRiesgoRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  modalRiesgoDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  modalRiesgoLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  modalRiesgoDesc: { fontSize: 12, color: '#8892B0', lineHeight: 18 },
  bold: { fontWeight: '700', color: '#1A1A2E' },
  modalBtn: { backgroundColor: '#6B4EFF', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
