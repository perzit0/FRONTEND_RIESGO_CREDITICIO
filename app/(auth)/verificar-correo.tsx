import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '../../data/api/client';

export default function VerificarCorreoScreen() {
  const router = useRouter();
  const { usuario_id, email } = useLocalSearchParams();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [segundos, setSegundos] = useState(30);

  useEffect(() => {
    if (segundos <= 0) return;
    const timer = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [segundos]);

  async function handleReenviar() {
    if (segundos > 0) return;
    try {
      await apiClient.post('/api/auth/reenviar-codigo-correo', {
        usuario_id: Number(usuario_id),
      });
      setSegundos(30);
    } catch { }
  }

  async function handleVerificar() {
    if (codigo.length < 6) return;
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verificar-correo', {
        usuario_id: Number(usuario_id), codigo,
      });
      router.push({ pathname: '/(auth)/verificar-sms', params: { usuario_id } });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✉</Text>
        </View>
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.sub}>Enviamos un código de 6 dígitos a</Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.label}>Código de verificación</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor="#A0AEC0"
          keyboardType="numeric"
          maxLength={6}
          value={codigo}
          onChangeText={setCodigo}
          textAlign="center"
        />

        <TouchableOpacity onPress={handleReenviar} disabled={segundos > 0}>
          <Text style={[styles.reenviarText, segundos > 0 && styles.reenviarDisabled]}>
            {segundos > 0
              ? `Reenviar código en ${segundos}s`
              : '¿No lo recibiste? Reenviar código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleVerificar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>Verificar código</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, backgroundColor: '#F0EFFF',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, alignItems: 'center',
  },
  iconWrap: {
    width: 64, height: 64, backgroundColor: '#EDE9FF',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  icon: { fontSize: 28, color: '#6B4EFF' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#8892B0', textAlign: 'center' },
  email: {
    fontSize: 14, fontWeight: '700', color: '#6B4EFF',
    textAlign: 'center', marginBottom: 24, marginTop: 4,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: '#2D3748',
    marginBottom: 6, alignSelf: 'flex-start',
  },
  input: {
    width: '100%', backgroundColor: '#F7F8FC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14,
    fontSize: 28, fontWeight: '700', color: '#1A1A2E',
    marginBottom: 20, letterSpacing: 12,
  },
  reenviarText: {
    fontSize: 13, color: '#6B4EFF', fontWeight: '600',
    textAlign: 'center', marginBottom: 24,
  },
  reenviarDisabled: {
    color: '#A0AEC0', fontWeight: '400',
  },
  btnPrimary: {
    width: '100%', backgroundColor: '#6B4EFF',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});