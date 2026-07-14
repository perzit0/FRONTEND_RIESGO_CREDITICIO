import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { cerrarSesion } from '../../storage/secureStorage';
import { useTheme } from '../../context/ThemeContext';

type ModalKey = 'riesgo' | 'quienes' | 'ofrecemos' | 'soporte' | null;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [modalActivo, setModalActivo] = useState<ModalKey>(null);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const modalesContenido: Record<Exclude<ModalKey, null>, { titulo: string; render: () => JSX.Element }> = {
    riesgo: {
      titulo: '¿Qué es el riesgo crediticio?',
      render: () => (
        <>
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
          <Text style={[styles.modalText, { color: colors.textSecondary, marginTop: 8 }]}>
            El score que calculamos va de 0 a 100: mientras más alto, mayor la probabilidad estimada de incumplimiento según nuestro modelo de IA.
          </Text>
        </>
      ),
    },
    quienes: {
      titulo: 'Quiénes somos',
      render: () => (
        <Text style={[styles.modalText, { color: colors.textSecondary }]}>
          CreditoSmart es un proyecto académico de la Universidad Nacional Federico Villarreal, desarrollado para evaluar el riesgo crediticio mediante modelos de Machine Learning, con el objetivo de acercar herramientas de análisis financiero a más personas.
        </Text>
      ),
    },
    ofrecemos: {
      titulo: 'Qué ofrecemos',
      render: () => (
        <>
          {[
            'Predicción de riesgo crediticio con IA',
            'Historial y reportes descargables en PDF',
            'Educación financiera personalizada',
            'Seguimiento de tu evolución en el tiempo',
          ].map((item) => (
            <View key={item} style={styles.footerBullet}>
              <Text style={[styles.footerBulletDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.modalText, { color: colors.textSecondary, flex: 1, marginBottom: 0 }]}>{item}</Text>
            </View>
          ))}
        </>
      ),
    },
    soporte: {
      titulo: 'Soporte al usuario',
      render: () => (
        <Text style={[styles.modalText, { color: colors.textSecondary }]}>
          ¿Tienes dudas o problemas con tu cuenta? Escríbenos a percy19marceliano@gmail.com y te responderemos a la brevedad.
        </Text>
      ),
    },
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>UNFV — Riesgo Crediticio</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Hola, {perfil?.nombre?.split(' ')[0] ?? 'Usuario'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={[styles.gearBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {ultimaEval ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Tu último resultado</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultLeft}>
              <View style={[styles.dotIndicator, { backgroundColor: getColorCat(ultimaEval.categoria_riesgo) }]} />
              <Text style={[styles.resultCategoria, { color: colors.textPrimary }]}>
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

      <View style={styles.accionesRow}>
        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(user)/formulario' as any)}
        >
          <Text style={[styles.accionIcon, { color: colors.primary }]}>＋</Text>
          <Text style={[styles.accionLabel, { color: colors.textPrimary }]}>Nueva evaluación</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.accionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(user)/meta' as any)}
        >
          <Text style={styles.accionIcon}>🎯</Text>
          <Text style={[styles.accionLabel, { color: colors.textPrimary }]}>Mi meta</Text>
        </TouchableOpacity>
      </View>

      {historial.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Historial de evaluaciones</Text>
            <TouchableOpacity onPress={() => router.push('/(user)/historial' as any)}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Ver todo →</Text>
            </TouchableOpacity>
          </View>
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
            </View>
          ))}
        </View>
      )}

      {/* Barra de texto clickeable (footer institucional) */}
      <View style={[styles.footerDivider, { borderTopColor: colors.divider }]} />

      <View style={styles.footerBar}>
        {([
          { key: 'riesgo', label: '¿Qué es el riesgo crediticio?' },
          { key: 'quienes', label: 'Quiénes somos' },
          { key: 'ofrecemos', label: 'Qué ofrecemos' },
          { key: 'soporte', label: 'Soporte' },
        ] as { key: Exclude<ModalKey, null>; label: string }[]).map(({ key, label }) => (
          <TouchableOpacity key={key} onPress={() => setModalActivo(key)} style={styles.footerLinkBtn}>
            <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menú de la tuerquita */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {[
              { label: 'Mi perfil', ruta: '/(user)/perfil' },
              { label: 'Comunidad', ruta: '/(user)/comunidad' },
              { label: 'Configuración', ruta: '/(user)/configuracion' },
            ].map(({ label, ruta }) => (
              <TouchableOpacity
                key={ruta}
                style={[styles.menuItem, { borderBottomColor: colors.divider }]}
                onPress={() => { setMenuVisible(false); router.push(ruta as any); }}
              >
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); handleCerrarSesion(); }}
            >
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal generico para los links del footer, con X para cerrar */}
      <Modal visible={modalActivo !== null} transparent animationType="slide" onRequestClose={() => setModalActivo(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {modalActivo ? modalesContenido[modalActivo].titulo : ''}
              </Text>
              <TouchableOpacity
                onPress={() => setModalActivo(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.input }]}
              >
                <Text style={[styles.modalCloseText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {modalActivo ? modalesContenido[modalActivo].render() : null}
            </ScrollView>
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
  headerSub: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  gearBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  cardSub: { fontSize: 13 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotIndicator: { width: 8, height: 8, borderRadius: 4 },
  resultCategoria: { fontSize: 15, fontWeight: '600' },
  resultFecha: { fontSize: 12 },
  accionesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  accionBtn: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', gap: 6 },
  accionIcon: { fontSize: 22 },
  accionLabel: { fontSize: 14, fontWeight: '600' },
  historialRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  historialDot: { width: 7, height: 7, borderRadius: 3.5 },
  historialCategoria: { fontSize: 13, fontWeight: '500' },
  historialFecha: { fontSize: 11, marginTop: 1 },
  footerDivider: { borderTopWidth: 1, marginTop: 8, marginBottom: 14 },
  footerBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 8 },
  footerLinkBtn: { paddingVertical: 6 },
  footerLinkText: { fontSize: 13, fontWeight: '500', textDecorationLine: 'underline' },
  footerBullet: { flexDirection: 'row', gap: 8, marginTop: 4 },
  footerBulletDot: { fontSize: 13 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 56, paddingRight: 20 },
  menuCard: { borderRadius: 14, borderWidth: 1, width: 200, paddingVertical: 4 },
  menuItem: { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  menuItemText: { fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  modalCloseText: { fontSize: 16, fontWeight: '700' },
  modalText: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  modalSubtitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  modalRiesgoRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  modalRiesgoDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  modalRiesgoLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  modalRiesgoDesc: { fontSize: 12, lineHeight: 17 },
  bold: { fontWeight: '700' },
});
