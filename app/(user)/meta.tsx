import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { obtenerToken } from '../../storage/secureStorage';

export default function MetaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => { cargarHistorial(); }, []);

  async function cargarHistorial() {
    try {
      const token = await obtenerToken();
      const res = await apiClient.get('/api/user/mi-historial', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistorial(res.data);
    } catch { }
    finally { setLoading(false); }
  }

  const ultimaEval = historial[0] ?? null;
  const categoria = ultimaEval?.categoria_riesgo ?? null;

  function getColor(cat: string) {
    if (cat === 'bajo') return '#059669';
    if (cat === 'medio') return '#D97706';
    return '#DC2626';
  }

  function getBg(cat: string) {
    if (cat === 'bajo') return '#ECFDF5';
    if (cat === 'medio') return '#FFFBEB';
    return '#FEF2F2';
  }

  const pasosBajo = [
    { titulo: 'Mantén tus pagos al día', desc: 'No tener días de mora es el factor más importante para mantener un perfil de riesgo bajo. Programa recordatorios de pago.' },
    { titulo: 'Diversifica tus productos financieros', desc: 'Tener una cuenta de ahorro y un crédito activo bien manejado fortalece tu historial crediticio.' },
    { titulo: 'No solicites créditos innecesarios', desc: 'Cada solicitud de crédito puede afectar temporalmente tu perfil. Solo solicita cuando realmente lo necesites.' },
    { titulo: 'Mantén un fondo de emergencia', desc: 'Tener ahorros equivalentes a 3 meses de gastos te protege de caer en mora ante imprevistos.' },
  ];

  const pasosMedio = [
    { titulo: 'Reduce tu ratio deuda/ingreso', desc: 'Si tus deudas superan el 30% de tus ingresos mensuales, trabaja en pagarlas antes de adquirir nuevas obligaciones.' },
    { titulo: 'Regulariza pagos pendientes', desc: 'Si tienes cuotas atrasadas, ponlas al día lo antes posible. Cada mes sin mora mejora tu historial.' },
    { titulo: 'Aumenta tu antigüedad laboral', desc: 'La estabilidad laboral influye positivamente. Si puedes, evita cambios de trabajo frecuentes.' },
    { titulo: 'Consolida tus deudas', desc: 'Si tienes múltiples deudas pequeñas, considera consolidarlas en un solo crédito con menor tasa de interés.' },
    { titulo: 'Ahorra aunque sea poco', desc: 'Tener saldo en cuentas bancarias, aunque sea pequeño, mejora tu perfil financiero percibido.' },
  ];

  const pasosAlto = [
    { titulo: 'Prioridad: pagar deudas en mora', desc: 'Las deudas con días de mora son el factor que más daña tu perfil. Negocia con las entidades para ponerte al día.' },
    { titulo: 'No adquieras más deudas ahora', desc: 'Antes de solicitar cualquier crédito nuevo, enfócate en sanear las obligaciones actuales.' },
    { titulo: 'Busca asesoría financiera gratuita', desc: 'Entidades como la SBS en Perú ofrecen orientación financiera gratuita para personas en situación de sobreendeudamiento.' },
    { titulo: 'Reduce gastos fijos', desc: 'Analiza tus gastos mensuales e identifica cuáles puedes reducir o eliminar temporalmente para liberar dinero para deudas.' },
    { titulo: 'Busca ingresos adicionales', desc: 'Un trabajo secundario o freelance puede acelerar el pago de deudas y mejorar tu perfil en menos tiempo.' },
    { titulo: 'Vuelve a evaluar en 3 meses', desc: 'Si aplicas estos pasos consistentemente, en 3 meses deberías ver una mejora notable en tu nivel de riesgo.' },
  ];

  function getPasos() {
    if (categoria === 'bajo') return pasosBajo;
    if (categoria === 'medio') return pasosMedio;
    return pasosAlto;
  }

  function getTituloMeta() {
    if (categoria === 'bajo') return 'Tu meta: Mantener el riesgo bajo';
    if (categoria === 'medio') return 'Tu meta: Alcanzar riesgo bajo';
    return 'Tu meta: Reducir tu riesgo crediticio';
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mi meta financiera</Text>
        <Text style={styles.sub}>Pasos concretos para mejorar tu perfil crediticio</Text>
      </View>

      {/* Sin evaluaciones */}
      {!ultimaEval && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aún no tienes evaluaciones</Text>
          <Text style={styles.cardSub}>
            Realiza tu primera evaluación crediticia para recibir un plan personalizado.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(user)/formulario')}
          >
            <Text style={styles.btnPrimaryText}>Evaluar ahora</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Con evaluacion */}
      {ultimaEval && (
        <>
          {/* Estado actual */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getColor(categoria) }]}>
            <Text style={styles.cardLabel}>Tu nivel actual</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getBg(categoria) }]}>
              <Text style={[styles.estadoText, { color: getColor(categoria) }]}>
                Riesgo {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </Text>
            </View>
            <Text style={styles.cardSub}>
              Última evaluación: {new Date(ultimaEval.fecha).toLocaleDateString('es-PE')}
            </Text>
          </View>

          {/* Meta */}
          <View style={styles.metaCard}>
            <Text style={styles.metaIcon}>🎯</Text>
            <Text style={styles.metaTitulo}>{getTituloMeta()}</Text>
          </View>

          {/* Pasos */}
          <Text style={styles.pasosTitle}>Plan de acción</Text>
          {getPasos().map((paso, i) => (
            <View key={i} style={styles.pasoCard}>
              <View style={[styles.pasoNum, { backgroundColor: categoria === 'bajo' ? '#EDE9FF' : categoria === 'medio' ? '#FFFBEB' : '#FEF2F2' }]}>
                <Text style={[styles.pasoNumText, { color: getColor(categoria) }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pasoTitulo}>{paso.titulo}</Text>
                <Text style={styles.pasoDesc}>{paso.desc}</Text>
              </View>
            </View>
          ))}

          {/* CTA nueva evaluacion */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(user)/formulario')}
          >
            <Text style={styles.btnPrimaryText}>Realizar nueva evaluación</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 20 },
  loadingWrap: {
    flex: 1, backgroundColor: '#F0EFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#6B4EFF', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  sub: { fontSize: 13, color: '#8892B0', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  cardLabel: { fontSize: 12, color: '#8892B0', fontWeight: '500', marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#8892B0', marginTop: 6, lineHeight: 20 },
  estadoBadge: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8,
  },
  estadoText: { fontSize: 14, fontWeight: '700' },
  metaCard: {
    backgroundColor: '#EDE9FF', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1.5, borderColor: '#C4B5FD',
  },
  metaIcon: { fontSize: 36, marginBottom: 10 },
  metaTitulo: { fontSize: 17, fontWeight: '700', color: '#4C36C9', textAlign: 'center' },
  pasosTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  pasoCard: {
    flexDirection: 'row', gap: 14, backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  pasoNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pasoNumText: { fontSize: 14, fontWeight: '700' },
  pasoTitulo: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  pasoDesc: { fontSize: 12, color: '#8892B0', lineHeight: 18 },
  btnPrimary: {
    backgroundColor: '#6B4EFF', borderRadius: 12,
    padding: 15, alignItems: 'center', marginTop: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});