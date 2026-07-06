import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function MetaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ meta_titulo: string | null; meta_descripcion: string | null; meta_fecha_objetivo: string | null } | null>(null);

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const [historialRes, metaRes] = await Promise.all([
        apiClient.get('/api/user/mi-historial'),
        apiClient.get('/api/user/mi-meta'),
      ]);
      setHistorial(historialRes.data);
      setMeta(metaRes.data);
      if (metaRes.data.meta_titulo) {
        setTitulo(metaRes.data.meta_titulo);
        setDescripcion(metaRes.data.meta_descripcion || '');
        setFechaObjetivo(metaRes.data.meta_fecha_objetivo || '');
      }
    } catch { }
    finally { setLoading(false); }
  }

  async function handleGuardarMeta() {
    setError('');
    if (!titulo.trim()) { setError('Ponle un título a tu meta'); return; }
    setGuardando(true);
    try {
      await apiClient.post('/api/user/actualizar-meta', {
        meta_titulo: titulo,
        meta_descripcion: descripcion,
        meta_fecha_objetivo: fechaObjetivo || null,
      });
      setMeta({ meta_titulo: titulo, meta_descripcion: descripcion, meta_fecha_objetivo: fechaObjetivo || null });
      setEditando(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo guardar tu meta');
    } finally {
      setGuardando(false);
    }
  }

  function handleEliminarMeta() {
    Alert.alert('Eliminar meta', '¿Seguro que quieres eliminar tu meta personalizada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await apiClient.post('/api/user/eliminar-meta', {});
            setMeta({ meta_titulo: null, meta_descripcion: null, meta_fecha_objetivo: null });
            setTitulo(''); setDescripcion(''); setFechaObjetivo('');
          } catch { }
        }
      },
    ]);
  }

  const ultimaEval = historial[0] ?? null;
  const categoria = ultimaEval?.categoria_riesgo ?? null;

  function getColor(cat: string) {
    if (cat === 'bajo') return colors.success;
    if (cat === 'medio') return colors.warning;
    return colors.danger;
  }
  function getBg(cat: string) {
    if (cat === 'bajo') return colors.successBg;
    if (cat === 'medio') return colors.warningBg;
    return colors.dangerBg;
  }

  const sugerenciasBajo = [
    'Mantén tus pagos al día para conservar tu buen historial.',
    'Diversifica tus productos financieros con cuidado.',
    'Evita solicitar créditos que no necesitas.',
  ];
  const sugerenciasMedio = [
    'Reduce tu ratio deuda/ingreso si supera el 30%.',
    'Regulariza cualquier pago pendiente lo antes posible.',
    'Aumenta tu antigüedad laboral evitando cambios frecuentes.',
  ];
  const sugerenciasAlto = [
    'Prioriza pagar las deudas en mora.',
    'Evita adquirir nuevas deudas por ahora.',
    'Busca asesoría financiera gratuita (SBS en Perú).',
  ];

  function getSugerencias() {
    if (categoria === 'bajo') return sugerenciasBajo;
    if (categoria === 'medio') return sugerenciasMedio;
    if (categoria === 'alto') return sugerenciasAlto;
    return [];
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const tieneMeta = !!meta?.meta_titulo && !editando;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Mi meta financiera</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Define tu propia meta, a tu ritmo</Text>
      </View>

      {ultimaEval && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: getColor(categoria), borderLeftWidth: 4 }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Tu nivel actual</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getBg(categoria) }]}>
            <Text style={[styles.estadoText, { color: getColor(categoria) }]}>
              Riesgo {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
            </Text>
          </View>
        </View>
      )}

      {error ? <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}><Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text></View> : null}

      {tieneMeta ? (
        <View style={[styles.metaCard, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
          <Text style={styles.metaIcon}>🎯</Text>
          <Text style={[styles.metaTitulo, { color: colors.primary }]}>{meta!.meta_titulo}</Text>
          {meta?.meta_descripcion ? (
            <Text style={[styles.metaDescripcion, { color: colors.textSecondary }]}>{meta.meta_descripcion}</Text>
          ) : null}
          {meta?.meta_fecha_objetivo ? (
            <Text style={[styles.metaFecha, { color: colors.textMuted }]}>
              Fecha objetivo: {new Date(meta.meta_fecha_objetivo + 'T00:00:00').toLocaleDateString('es-PE')}
            </Text>
          ) : null}
          <View style={styles.metaBtnRow}>
            <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.primary }]} onPress={() => setEditando(true)}>
              <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.danger }]} onPress={handleEliminarMeta}>
              <Text style={[styles.btnSecondaryText, { color: colors.danger }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {meta?.meta_titulo ? 'Editar tu meta' : 'Crea tu propia meta'}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Escribe en tus propias palabras qué quieres lograr financieramente. No la generamos por ti — es tuya.
          </Text>

          <Text style={[styles.label, { color: colors.textLabel }]}>Título de tu meta *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Ej: Ahorrar para la cuota inicial de un auto"
            placeholderTextColor={colors.textMuted}
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={[styles.label, { color: colors.textLabel }]}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Describe los pasos o el plan que tienes en mente..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={[styles.label, { color: colors.textLabel }]}>Fecha objetivo (opcional, AAAA-MM-DD)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Ej: 2026-12-31"
            placeholderTextColor={colors.textMuted}
            value={fechaObjetivo}
            onChangeText={setFechaObjetivo}
          />

          <View style={styles.metaBtnRow}>
            {meta?.meta_titulo && (
              <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.textMuted, flex: 0 }]} onPress={() => setEditando(false)}>
                <Text style={[styles.btnSecondaryText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleGuardarMeta} disabled={guardando}>
              {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Guardar mi meta</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {ultimaEval && getSugerencias().length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Sugerencias según tu perfil</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Ideas generales basadas en tu última evaluación — tu meta de arriba es la que de verdad cuenta.
          </Text>
          {getSugerencias().map((s, i) => (
            <View key={i} style={styles.sugerenciaRow}>
              <Text style={[styles.sugerenciaBullet, { color: colors.primary }]}>→</Text>
              <Text style={[styles.sugerenciaText, { color: colors.textSecondary }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {!ultimaEval && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Realiza tu primera evaluación crediticia para recibir sugerencias personalizadas según tu perfil.</Text>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary, marginTop: 10 }]} onPress={() => router.push('/(user)/formulario' as any)}>
            <Text style={styles.btnPrimaryText}>Evaluar ahora</Text>
          </TouchableOpacity>
        </View>
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
  sub: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  cardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  cardSub: { fontSize: 13, marginBottom: 14, lineHeight: 20 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { fontSize: 13, textAlign: 'center' },
  estadoBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  estadoText: { fontSize: 14, fontWeight: '700' },
  metaCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, borderWidth: 1.5 },
  metaIcon: { fontSize: 36, marginBottom: 10 },
  metaTitulo: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  metaDescripcion: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
  metaFecha: { fontSize: 12, marginBottom: 12 },
  metaBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  textArea: { height: 90, textAlignVertical: 'top' },
  sugerenciaRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  sugerenciaBullet: { fontSize: 14, fontWeight: '700' },
  sugerenciaText: { fontSize: 13, flex: 1, lineHeight: 19 },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 13, alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});
