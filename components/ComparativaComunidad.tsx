import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  miScore: number | null;
  scorePromedio: number | null;
  mejorQuePct: number | null;
  totalPersonas: number;
}

/**
 * Compara el score del usuario contra el promedio de la comunidad.
 * Importante: en este modelo un score MAS BAJO es MEJOR (es la probabilidad
 * estimada de incumplimiento), por eso estar por debajo del promedio es
 * una buena noticia.
 */
export default function ComparativaComunidad({ miScore, scorePromedio, mejorQuePct, totalPersonas }: Props) {
  const { colors } = useTheme();

  if (miScore == null || scorePromedio == null) return null;

  const diferencia = miScore - scorePromedio;
  const mejorQueElPromedio = diferencia < 0;
  const colorEstado = mejorQueElPromedio ? colors.success : colors.danger;

  const maxEscala = Math.max(miScore, scorePromedio, 100);

  const Barra = ({ label, valor, color }: { label: string; valor: number; color: string }) => (
    <View style={styles.barraRow}>
      <Text style={[styles.barraLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.barraTrack, { backgroundColor: colors.input }]}>
        <View style={[styles.barraFill, { width: `${(valor / maxEscala) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barraValor, { color: colors.textPrimary }]}>{valor.toFixed(0)}</Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.titulo, { color: colors.textPrimary }]}>Tú vs. la comunidad</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        Comparado con {totalPersonas} {totalPersonas === 1 ? 'persona evaluada' : 'personas evaluadas'}
      </Text>

      <Barra label="Tu score" valor={miScore} color={colorEstado} />
      <Barra label="Promedio" valor={scorePromedio} color={colors.textMuted} />

      <View style={[styles.resumen, { backgroundColor: colors.input, borderColor: colorEstado + '55' }]}>
        <Text style={[styles.resumenTexto, { color: colors.textSecondary }]}>
          {mejorQueElPromedio ? (
            <>
              Tu riesgo es <Text style={{ color: colorEstado, fontWeight: '700' }}>{Math.abs(diferencia).toFixed(1)} puntos menor</Text> que el promedio.
              {mejorQuePct != null && ` Estás mejor que el ${mejorQuePct}% de los usuarios.`}
            </>
          ) : diferencia === 0 ? (
            <>Tu score está exactamente en el promedio de la comunidad.</>
          ) : (
            <>
              Tu riesgo es <Text style={{ color: colorEstado, fontWeight: '700' }}>{diferencia.toFixed(1)} puntos mayor</Text> que el promedio.
              {mejorQuePct != null && ` Aun así, estás mejor que el ${mejorQuePct}% de los usuarios.`}
            </>
          )}
        </Text>
      </View>

      <Text style={[styles.nota, { color: colors.textMuted }]}>
        Recuerda: un score más bajo significa menor riesgo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  titulo: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sub: { fontSize: 11, marginBottom: 14 },
  barraRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barraLabel: { fontSize: 12, width: 68 },
  barraTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 5 },
  barraValor: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  resumen: { borderRadius: 10, borderWidth: 1, padding: 11, marginTop: 4 },
  resumenTexto: { fontSize: 12, lineHeight: 18 },
  nota: { fontSize: 10, marginTop: 8, fontStyle: 'italic' },
});
