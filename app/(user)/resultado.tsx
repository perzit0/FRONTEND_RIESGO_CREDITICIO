import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { obtenerToken } from '../../storage/secureStorage';
import { BASE_URL } from '../../data/api/client';

function Velocimetro({ categoria }: { categoria: string }) {
  const W = 300;
  const H = 180;
  const cx = W / 2;
  const cy = H - 24;
  const r = 110;

  function getAngulo() {
    if (categoria === 'bajo') return -20;
    if (categoria === 'medio') return -90;
    return -160;
  }

  const angulo = getAngulo();
  const rad = (angulo * Math.PI) / 180;
  const agujaX = cx + (r - 22) * Math.cos(rad);
  const agujaY = cy + (r - 22) * Math.sin(rad);

  function getColor() {
    if (categoria === 'bajo') return '#059669';
    if (categoria === 'medio') return '#D97706';
    return '#DC2626';
  }

  function arcPath(startDeg: number, endDeg: number) {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  // Posiciones de las marcas numéricas en el arco
  // El arco va de -180° (izquierda=alto) a 0° (derecha=bajo)
  // Marcas: 0, 25, 50, 75, 100 distribuidas en el arco
  function marcaPos(pct: number) {
    const deg = -180 + pct * 1.8; // 0% → -180°, 100% → 0°
    const rad2 = (deg * Math.PI) / 180;
    const rMarca = r + 16;
    return {
      x: cx + rMarca * Math.cos(rad2),
      y: cy + rMarca * Math.sin(rad2),
    };
  }

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Track fondo */}
      <Path d={arcPath(-180, 0)} fill="none" stroke="#E2E8F0" strokeWidth={18} strokeLinecap="round" />
      {/* Zona roja: alto */}
      <Path d={arcPath(-180, -120)} fill="none" stroke="#EF4444" strokeWidth={18} strokeLinecap="round" />
      {/* Zona amarilla: medio */}
      <Path d={arcPath(-120, -60)} fill="none" stroke="#F59E0B" strokeWidth={18} strokeLinecap="round" />
      {/* Zona verde: bajo */}
      <Path d={arcPath(-60, 0)} fill="none" stroke="#10B981" strokeWidth={18} strokeLinecap="round" />

      {/* Marcas numéricas en el arco — CORREGIDO: fuera del arco para no superponerse */}
      {[
        { pct: 0, label: '0' },
        { pct: 33, label: '33' },
        { pct: 66, label: '66' },
        { pct: 100, label: '100' },
      ].map(({ pct, label }) => {
        const pos = marcaPos(pct);
        return (
          <SvgText
            key={label}
            x={pos.x}
            y={pos.y}
            fill="#8892B0"
            fontSize={9}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {label}
          </SvgText>
        );
      })}

      {/* Labels de zona — debajo del arco para no superponerse con la aguja */}
      <SvgText x={24} y={H - 6} fill="#EF4444" fontSize={10} fontWeight="700" textAnchor="middle">Alto</SvgText>
      <SvgText x={cx} y={36} fill="#F59E0B" fontSize={10} fontWeight="700" textAnchor="middle">Medio</SvgText>
      <SvgText x={W - 24} y={H - 6} fill="#10B981" fontSize={10} fontWeight="700" textAnchor="middle">Bajo</SvgText>

      {/* Aguja */}
      <Line
        x1={cx} y1={cy}
        x2={agujaX} y2={agujaY}
        stroke={getColor()}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Centro de la aguja */}
      <Circle cx={cx} cy={cy} r={9} fill={getColor()} />
      <Circle cx={cx} cy={cy} r={4} fill="#fff" />
    </Svg>
  );
}

export default function ResultadoScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const resultado = data ? JSON.parse(data as string) : null;

  if (!resultado) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay datos de evaluación</Text>
      </View>
    );
  }

  const categoria = resultado.categoria_riesgo ?? 'desconocido';
  const factores = resultado.factores_influyentes ?? [];
  const recomendaciones = resultado.recomendaciones ?? [];

  function getCategoriaColor() {
    if (categoria === 'bajo') return '#059669';
    if (categoria === 'medio') return '#D97706';
    return '#DC2626';
  }

  function getCategoriaBg() {
    if (categoria === 'bajo') return '#ECFDF5';
    if (categoria === 'medio') return '#FFFBEB';
    return '#FEF2F2';
  }

  function getCategoriaLabel() {
    if (categoria === 'bajo') return 'Riesgo Bajo';
    if (categoria === 'medio') return 'Riesgo Medio';
    return 'Riesgo Alto';
  }

  function getCategoriaDesc() {
    if (categoria === 'bajo') return 'Tu perfil financiero se encuentra en buen estado';
    if (categoria === 'medio') return 'Hay aspectos que podrías mejorar';
    return 'Te recomendamos revisar tu situación financiera';
  }

  async function handleDescargarPDF() {
    try {
      const token = await obtenerToken();
      const evaluacionId = resultado.evaluacion_id;

      // CORRECCIÓN: usa BASE_URL del apiClient, no URL hardcodeada a Render
      const url = `${BASE_URL}/api/user/evaluacion/${evaluacionId}/pdf`;

      if (Platform.OS === 'web') {
        // En web: fetch + descarga por blob
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          Alert.alert('Error', 'No se pudo generar el PDF');
          return;
        }
        const blob = await response.blob();
        const urlBlob = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `Reporte_Crediticio_${evaluacionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);
      } else {
        // En móvil: abrir en navegador
        const { Linking } = await import('react-native');
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Error', 'No se pudo descargar el reporte');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>UNFV — Riesgo Crediticio</Text>
        <View style={[styles.badge, { backgroundColor: getCategoriaBg(), borderColor: getCategoriaColor() + '40' }]}>
          <Text style={[styles.badgeText, { color: getCategoriaColor() }]}>Verificado</Text>
        </View>
      </View>

      {/* Velocímetro — CORREGIDO: números en el arco, labels sin superposición */}
      <View style={styles.card}>
        <View style={styles.velocimetroWrap}>
          <Velocimetro categoria={categoria} />
          <Text style={[styles.resultLabel, { color: getCategoriaColor() }]}>
            {getCategoriaLabel()}
          </Text>
          <Text style={styles.resultDesc}>{getCategoriaDesc()}</Text>
        </View>
      </View>

      {/* Factores */}
      {factores.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Factores que influyeron</Text>
          {factores.map((f: any, i: number) => (
            <View key={i} style={styles.factorRow}>
              <View style={[styles.factorDot, {
                backgroundColor: f.impacto === 'positivo' ? '#059669' : '#DC2626'
              }]} />
              <Text style={styles.factorText}>{f.factor}</Text>
              <View style={[styles.factorBadge, {
                backgroundColor: f.impacto === 'positivo' ? '#ECFDF5' : '#FEF2F2'
              }]}>
                <Text style={[styles.factorBadgeText, {
                  color: f.impacto === 'positivo' ? '#059669' : '#DC2626'
                }]}>
                  {f.impacto === 'positivo' ? '↑ positivo' : '↓ negativo'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recomendaciones */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recomendaciones</Text>
        {recomendaciones.map((rec: string, i: number) => (
          <View key={i} style={styles.recRow}>
            <Text style={styles.recBullet}>→</Text>
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleDescargarPDF}>
        <Text style={styles.btnPrimaryText}>Descargar reporte PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => router.replace('/(user)/home')}
      >
        <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 20, alignItems: 'center' },
  errorText: { color: '#8892B0', textAlign: 'center', marginTop: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
    width: '100%', maxWidth: 480,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#6B4EFF' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  card: {
    width: '100%', maxWidth: 480,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginBottom: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
  velocimetroWrap: { alignItems: 'center', paddingVertical: 8 },
  resultLabel: { fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  resultDesc: { fontSize: 13, color: '#8892B0', textAlign: 'center' },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  factorDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  factorText: { fontSize: 13, color: '#4A5568', flex: 1 },
  factorBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  factorBadgeText: { fontSize: 11, fontWeight: '600' },
  recRow: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 10, backgroundColor: '#F7F8FC',
    borderRadius: 10, marginBottom: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  recBullet: { color: '#6B4EFF', fontSize: 14, flexShrink: 0, fontWeight: '700' },
  recText: { fontSize: 12, color: '#4A5568', flex: 1, lineHeight: 18 },
  btnPrimary: {
    width: '100%', maxWidth: 480,
    backgroundColor: '#6B4EFF', borderRadius: 12,
    padding: 15, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    width: '100%', maxWidth: 480,
    borderWidth: 1.5, borderColor: '#6B4EFF',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  btnSecondaryText: { color: '#6B4EFF', fontSize: 14, fontWeight: '600' },
});
