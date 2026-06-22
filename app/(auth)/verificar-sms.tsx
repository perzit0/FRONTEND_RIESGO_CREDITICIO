import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function VerificarSmsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { usuario_id } = useLocalSearchParams();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    iniciarCountdown();
    return () => clearInterval(intervalRef.current);
  }, []);

  function iniciarCountdown() {
    setCountdown(30); setPuedeReenviar(false);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); setPuedeReenviar(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleReenviar() {
    if (!puedeReenviar) return;
    try {
      await apiClient.post('/api/auth/reenviar-codigo-sms', { usuario_id: Number(usuario_id) });
      iniciarCountdown();
    } catch { }
  }

  async function handleVerificar() {
    if (codigo.length < 6) return;
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verificar-sms', { usuario_id: Number(usuario_id), codigo });
      router.replace('/(auth)/login');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.badge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
          <Text style={[styles.badgeText, { color: colors.success }]}>✓ Correo verificado</Text>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.icon}>📱</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Verifica tu teléfono</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Enviamos un SMS con el código a tu número registrado</Text>

        <Text style={[styles.label, { color: colors.textLabel, alignSelf: 'flex-start' }]}>Código SMS</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="000000" placeholderTextColor={colors.textMuted}
          keyboardType="numeric" maxLength={6}
          value={codigo} onChangeText={setCodigo} textAlign="center"
        />

        <TouchableOpacity onPress={handleReenviar} disabled={!puedeReenviar}>
          <Text style={[styles.reenviarText, { color: puedeReenviar ? colors.primary : colors.textMuted, fontWeight: puedeReenviar ? '600' : '400' }]}>
            {puedeReenviar ? '¿No lo recibiste? Reenviar código' : `Puedes reenviar en ${countdown}s`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleVerificar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Confirmar y continuar</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, alignItems: 'center' },
  badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, marginBottom: 16 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 28, fontWeight: '700', marginBottom: 20, letterSpacing: 12 },
  reenviarText: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  btnPrimary: { width: '100%', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});