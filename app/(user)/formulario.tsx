import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

// El formulario pide EXCLUSIVAMENTE los datos que el modelo de IA utiliza:
//   edad, ingreso_mensual, tipo_vivienda, antiguedad_laboral_meses,
//   deuda_mensual, dias_mora_historico, anios_historial_crediticio.
// Se eliminaron tipo_empleo, dependientes, monto en bancos, número de
// cuentas y créditos previos porque el modelo no los usa.

export default function FormularioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tuvoCredito, setTuvoCredito] = useState<boolean | null>(null);

  const [datos1, setDatos1] = useState({
    edad: '', antiguedad_laboral_meses: '', tipo_vivienda: 'propia',
  });

  const [datos2, setDatos2] = useState({
    ingreso_mensual: '', deuda_mensual: '0',
    dias_mora_historico: '0', anios_historial_crediticio: '0',
  });

  function update1(field: string, value: string) { setDatos1(prev => ({ ...prev, [field]: value })); }
  function update2(field: string, value: string) { setDatos2(prev => ({ ...prev, [field]: value })); }

  function handleSiguiente() {
    const edadNum = Number(datos1.edad);
    if (!datos1.edad || isNaN(edadNum) || edadNum < 18 || edadNum > 100) {
      Alert.alert('Error', 'Ingresa una edad válida (entre 18 y 100 años)'); return;
    }
    const antNum = Number(datos1.antiguedad_laboral_meses);
    if (datos1.antiguedad_laboral_meses === '' || isNaN(antNum) || antNum < 0 || antNum > 720) {
      Alert.alert('Error', 'Ingresa una antigüedad laboral válida en meses (0 a 720)'); return;
    }
    setPaso(2);
  }

  function handleSeleccionCredito(tuvo: boolean) {
    setTuvoCredito(tuvo);
    if (!tuvo) {
      // Si nunca tuvo crédito, mora e historial quedan en 0 y no se le piden.
      setDatos2(prev => ({ ...prev, dias_mora_historico: '0', anios_historial_crediticio: '0' }));
    }
  }

  async function handleAnalizar() {
    const ingreso = Number(datos2.ingreso_mensual);
    const deuda = Number(datos2.deuda_mensual);

    if (!datos2.ingreso_mensual || isNaN(ingreso) || ingreso <= 0) {
      Alert.alert('Error', 'El ingreso mensual debe ser un número mayor a 0'); return;
    }
    if (isNaN(deuda) || deuda < 0) {
      Alert.alert('Error', 'La deuda mensual no puede ser negativa'); return;
    }
    if (tuvoCredito === true) {
      const historial = Number(datos2.anios_historial_crediticio);
      const mora = Number(datos2.dias_mora_historico);
      if ([historial, mora].some(v => isNaN(v) || v < 0)) {
        Alert.alert('Error', 'Los datos de crédito (mora e historial) no pueden ser negativos'); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        edad: Number(datos1.edad),
        antiguedad_laboral_meses: Number(datos1.antiguedad_laboral_meses),
        tipo_vivienda: datos1.tipo_vivienda,
        ingreso_mensual: ingreso,
        deuda_mensual: deuda,
        dias_mora_historico: Number(datos2.dias_mora_historico),
        anios_historial_crediticio: Number(datos2.anios_historial_crediticio),
      };
      const res = await apiClient.post('/api/user/evaluar-riesgo', payload);
      router.push({ pathname: '/(user)/resultado', params: { data: JSON.stringify(res.data) } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo evaluar');
    } finally {
      setLoading(false);
    }
  }

  function Opcion({ selected, onPress, label }: { selected: boolean, onPress: () => void, label: string }) {
    return (
      <TouchableOpacity
        style={[styles.optionBtn, {
          backgroundColor: selected ? colors.primaryLight : colors.input,
          borderColor: selected ? colors.primary : colors.inputBorder,
        }]}
        onPress={onPress}
      >
        <Text style={[styles.optionText, { color: selected ? colors.primary : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 24 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          <Text style={[styles.headerTitle, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>

          <View style={styles.stepWrap}>
            <View style={[styles.stepDot, { backgroundColor: paso >= 1 ? colors.primary : colors.primaryLight }]}>
              <Text style={[styles.stepNum, { color: paso >= 1 ? '#fff' : colors.primary }]}>{paso > 1 ? '✓' : '1'}</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: paso > 1 ? colors.primary : colors.primaryLight }]} />
            <View style={[styles.stepDot, { backgroundColor: paso === 2 ? colors.primary : colors.primaryLight }]}>
              <Text style={[styles.stepNum, { color: paso === 2 ? '#fff' : colors.primary }]}>2</Text>
            </View>
          </View>

          {paso === 1 && (
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Datos demográficos</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>Información personal para el análisis</Text>

              <Text style={[styles.label, { color: colors.textLabel }]}>Edad *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="Ej: 32" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={datos1.edad} onChangeText={v => update1('edad', v)} />

              <Text style={[styles.label, { color: colors.textLabel }]}>Antigüedad laboral (meses) *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="Ej: 36" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={datos1.antiguedad_laboral_meses} onChangeText={v => update1('antiguedad_laboral_meses', v)} />

              <Text style={[styles.label, { color: colors.textLabel }]}>Tipo de vivienda</Text>
              <View style={styles.optionGroup}>
                {['propia', 'alquilada', 'familiar'].map(op => (
                  <Opcion key={op} selected={datos1.tipo_vivienda === op} onPress={() => update1('tipo_vivienda', op)} label={op.charAt(0).toUpperCase() + op.slice(1)} />
                ))}
              </View>

              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleSiguiente}>
                <Text style={styles.btnPrimaryText}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          )}

          {paso === 2 && (
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Datos financieros</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>Ingresos y comportamiento crediticio</Text>

              <Text style={[styles.label, { color: colors.textLabel }]}>¿Has tenido un crédito antes? *</Text>
              <View style={styles.optionGroup}>
                <Opcion selected={tuvoCredito === true} onPress={() => handleSeleccionCredito(true)} label="Sí" />
                <Opcion selected={tuvoCredito === false} onPress={() => handleSeleccionCredito(false)} label="No" />
              </View>

              {[
                { label: 'Ingresos mensuales (S/.) *', field: 'ingreso_mensual', ph: 'Ej: 3500' },
                { label: 'Deuda mensual (S/.)', field: 'deuda_mensual', ph: 'Ej: 800' },
              ].map(({ label, field, ph }) => (
                <View key={field}>
                  <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                    placeholder={ph} placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={(datos2 as any)[field]}
                    onChangeText={v => update2(field, v)}
                  />
                </View>
              ))}

              {(() => {
                const ing = Number(datos2.ingreso_mensual);
                const deu = Number(datos2.deuda_mensual);
                if (!ing || ing <= 0 || isNaN(deu) || deu < 0) return null;
                const ratio = deu / ing;
                const pct = Math.round(ratio * 100);
                let color = colors.success, texto = 'Endeudamiento saludable';
                if (ratio >= 0.35) { color = colors.danger; texto = 'Endeudamiento alto'; }
                else if (ratio >= 0.2) { color = colors.warning; texto = 'Endeudamiento moderado'; }
                return (
                  <View style={[styles.ratioBox, { backgroundColor: colors.input, borderColor: color + '55' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={[styles.ratioLabel, { color: colors.textSecondary }]}>Ratio deuda / ingreso</Text>
                      <Text style={[styles.ratioPct, { color }]}>{pct}%</Text>
                    </View>
                    <View style={[styles.ratioTrack, { backgroundColor: colors.inputBorder }]}>
                      <View style={[styles.ratioFill, { width: `${Math.min(100, pct)}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.ratioTexto, { color }]}>{texto}</Text>
                  </View>
                );
              })()}

              {tuvoCredito === true && (
                <>
                  {[
                    { label: 'Días de mora histórico', field: 'dias_mora_historico', ph: '0' },
                    { label: 'Años de historial crediticio', field: 'anios_historial_crediticio', ph: 'Ej: 3' },
                  ].map(({ label, field, ph }) => (
                    <View key={field}>
                      <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                        placeholder={ph} placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                        value={(datos2 as any)[field]}
                        onChangeText={v => update2(field, v)}
                      />
                    </View>
                  ))}
                </>
              )}

              {tuvoCredito === false && (
                <View style={[styles.infoBox, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
                  <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                    Como no has tenido créditos antes, mora e historial quedan en 0 automáticamente.
                  </Text>
                </View>
              )}

              <View style={styles.rowBtns}>
                <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.primary }]} onPress={() => setPaso(1)}>
                  <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>← Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimary, { flex: 1, backgroundColor: colors.primary, opacity: tuvoCredito === null ? 0.5 : 1 }]}
                  onPress={handleAnalizar}
                  disabled={loading || tuvoCredito === null}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Analizar mi perfil</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 480, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: 'transparent', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0, shadowRadius: 24, elevation: 0, marginVertical: 24 },
  headerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 20 },
  stepWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 13, fontWeight: '700' },
  stepLine: { flex: 1, height: 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  optionText: { fontSize: 13 },
  infoBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 16 },
  infoBoxText: { fontSize: 12, lineHeight: 18 },
  ratioBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 16 },
  ratioLabel: { fontSize: 12, fontWeight: '600' },
  ratioPct: { fontSize: 15, fontWeight: '800' },
  ratioTrack: { height: 7, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  ratioFill: { height: 7, borderRadius: 4 },
  ratioTexto: { fontSize: 11, fontWeight: '600' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: { borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});
