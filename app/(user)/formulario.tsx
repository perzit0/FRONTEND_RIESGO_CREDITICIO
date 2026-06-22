import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';

export default function FormularioScreen() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);

  const [datos1, setDatos1] = useState({
    edad: '',
    tipo_empleo: 'dependiente',
    antiguedad_laboral_meses: '',
    nivel_educativo: 'universitario',
    estado_civil: 'soltero',
    tipo_vivienda: 'propia',
    num_dependientes_hogar: '0',
  });

  const [datos2, setDatos2] = useState({
    ingreso_mensual: '',
    monto_en_bancos: '',
    num_cuentas_bancarias: '',
    num_creditos_previos: '0',
    dias_mora_historico: '0',
    ratio_deuda_ingreso: '0',
    num_lineas_credito_abiertas: '0',
    num_dependientes_economicos: '0',
  });

  function update1(field: string, value: string) {
    setDatos1(prev => ({ ...prev, [field]: value }));
  }

  function update2(field: string, value: string) {
    setDatos2(prev => ({ ...prev, [field]: value }));
  }

  // CORRECCIÓN: validar edad antes de avanzar al paso 2
  function handleSiguiente() {
    const edadNum = Number(datos1.edad);
    if (!datos1.edad || isNaN(edadNum) || edadNum < 18 || edadNum > 100) {
      Alert.alert('Error', 'Ingresa una edad válida (entre 18 y 100 años)');
      return;
    }
    if (!datos1.antiguedad_laboral_meses) {
      Alert.alert('Error', 'Ingresa tu antigüedad laboral en meses (puede ser 0)');
      return;
    }
    setPaso(2);
  }

  async function handleAnalizar() {
    if (!datos2.ingreso_mensual || !datos2.monto_en_bancos || !datos2.num_cuentas_bancarias) {
      Alert.alert('Error', 'Completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...datos1,
        ...datos2,
        edad: Number(datos1.edad),
        antiguedad_laboral_meses: Number(datos1.antiguedad_laboral_meses),
        num_dependientes_hogar: Number(datos1.num_dependientes_hogar),
        ingreso_mensual: Number(datos2.ingreso_mensual),
        monto_en_bancos: Number(datos2.monto_en_bancos),
        num_cuentas_bancarias: Number(datos2.num_cuentas_bancarias),
        num_creditos_previos: Number(datos2.num_creditos_previos),
        dias_mora_historico: Number(datos2.dias_mora_historico),
        ratio_deuda_ingreso: Number(datos2.ratio_deuda_ingreso),
        num_lineas_credito_abiertas: Number(datos2.num_lineas_credito_abiertas),
        num_dependientes_economicos: Number(datos2.num_dependientes_economicos),
      };
      // El interceptor de client.ts agrega el token automáticamente
      const res = await apiClient.post('/api/user/evaluar-riesgo', payload);
      router.push({ pathname: '/(user)/resultado', params: { data: JSON.stringify(res.data) } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo evaluar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>

          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>UNFV — Riesgo Crediticio</Text>
          </View>

          <View style={styles.stepWrap}>
            <View style={[styles.stepDot, paso >= 1 ? styles.stepActive : styles.stepPending]}>
              <Text style={styles.stepNum}>{paso > 1 ? '✓' : '1'}</Text>
            </View>
            <View style={[styles.stepLine, paso > 1 && styles.stepLineDone]} />
            <View style={[styles.stepDot, paso === 2 ? styles.stepActive : styles.stepPending]}>
              <Text style={[styles.stepNum, paso < 2 && styles.stepNumPending]}>2</Text>
            </View>
          </View>

          {/* PASO 1 */}
          {paso === 1 && (
            <View>
              <Text style={styles.title}>Datos demográficos</Text>
              <Text style={styles.sub}>Información personal para el análisis</Text>

              <Text style={styles.label}>Edad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 32"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={datos1.edad}
                onChangeText={v => update1('edad', v)}
              />

              <Text style={styles.label}>Antigüedad laboral (meses) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 36"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={datos1.antiguedad_laboral_meses}
                onChangeText={v => update1('antiguedad_laboral_meses', v)}
              />

              <Text style={styles.label}>Número de dependientes en el hogar</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={datos1.num_dependientes_hogar}
                onChangeText={v => update1('num_dependientes_hogar', v)}
              />

              <Text style={styles.label}>Tipo de empleo</Text>
              <View style={styles.optionGroup}>
                {['dependiente', 'independiente', 'desempleado'].map(op => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.optionBtn, datos1.tipo_empleo === op && styles.optionSelected]}
                    onPress={() => update1('tipo_empleo', op)}
                  >
                    <Text style={[styles.optionText, datos1.tipo_empleo === op && styles.optionTextSelected]}>
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Nivel educativo</Text>
              <View style={styles.optionGroup}>
                {['secundaria', 'tecnico', 'universitario', 'posgrado'].map(op => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.optionBtn, datos1.nivel_educativo === op && styles.optionSelected]}
                    onPress={() => update1('nivel_educativo', op)}
                  >
                    <Text style={[styles.optionText, datos1.nivel_educativo === op && styles.optionTextSelected]}>
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Estado civil</Text>
              <View style={styles.optionGroup}>
                {['soltero', 'casado', 'conviviente', 'otro'].map(op => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.optionBtn, datos1.estado_civil === op && styles.optionSelected]}
                    onPress={() => update1('estado_civil', op)}
                  >
                    <Text style={[styles.optionText, datos1.estado_civil === op && styles.optionTextSelected]}>
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Tipo de vivienda</Text>
              <View style={styles.optionGroup}>
                {['propia', 'alquilada', 'familiar'].map(op => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.optionBtn, datos1.tipo_vivienda === op && styles.optionSelected]}
                    onPress={() => update1('tipo_vivienda', op)}
                  >
                    <Text style={[styles.optionText, datos1.tipo_vivienda === op && styles.optionTextSelected]}>
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* CORRECCIÓN: handleSiguiente con validación en vez de setPaso(2) directamente */}
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSiguiente}>
                <Text style={styles.btnPrimaryText}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PASO 2 */}
          {paso === 2 && (
            <View>
              <Text style={styles.title}>Datos financieros</Text>
              <Text style={styles.sub}>Información bancaria y crediticia</Text>

              <Text style={styles.label}>Ingresos mensuales (S/.) *</Text>
              <TextInput style={styles.input} placeholder="Ej: 3500" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={datos2.ingreso_mensual} onChangeText={v => update2('ingreso_mensual', v)} />

              <Text style={styles.label}>Monto total en cuentas bancarias (S/.) *</Text>
              <TextInput style={styles.input} placeholder="Ej: 8000" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={datos2.monto_en_bancos} onChangeText={v => update2('monto_en_bancos', v)} />

              <Text style={styles.label}>Número de cuentas bancarias *</Text>
              <TextInput style={styles.input} placeholder="Ej: 2" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={datos2.num_cuentas_bancarias} onChangeText={v => update2('num_cuentas_bancarias', v)} />

              <Text style={styles.label}>Créditos previos</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={datos2.num_creditos_previos} onChangeText={v => update2('num_creditos_previos', v)} />

              <Text style={styles.label}>Días de mora histórico</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={datos2.dias_mora_historico} onChangeText={v => update2('dias_mora_historico', v)} />

              <View style={styles.rowBtns}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setPaso(1)}>
                  <Text style={styles.btnSecondaryText}>← Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimary, { flex: 1 }]}
                  onPress={handleAnalizar}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>Analizar mi perfil</Text>
                  }
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
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 480, backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, marginVertical: 24,
  },
  headerRow: { marginBottom: 20 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#6B4EFF' },
  stepWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: '#6B4EFF' },
  stepPending: { backgroundColor: '#EDE9FF' },
  stepNum: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepNumPending: { color: '#6B4EFF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#EDE9FF' },
  stepLineDone: { backgroundColor: '#6B4EFF' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  sub: { fontSize: 13, color: '#8892B0', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  input: {
    backgroundColor: '#F7F8FC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13, fontSize: 14, color: '#1A1A2E', marginBottom: 16,
  },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F7F8FC',
  },
  optionSelected: { backgroundColor: '#EDE9FF', borderColor: '#6B4EFF' },
  optionText: { fontSize: 13, color: '#8892B0' },
  optionTextSelected: { color: '#6B4EFF', fontWeight: '600' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnPrimary: { backgroundColor: '#6B4EFF', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#6B4EFF', borderRadius: 12,
    padding: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  btnSecondaryText: { color: '#6B4EFF', fontSize: 14, fontWeight: '600' },
});
