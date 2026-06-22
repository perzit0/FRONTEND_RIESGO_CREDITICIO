import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';

export default function OlvidePasswordScreen() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  async function handleEnviarCodigo() {
    setError('');
    if (!email) { setError('Ingresa tu correo'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/olvide-password', { email });
      setPaso(2);
    } catch {
      setError('No se pudo enviar el codigo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificarCodigo() {
    setError('');
    if (codigo.length < 6) { setError('Ingresa el codigo de 6 digitos'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verificar-codigo-recuperacion', { email, codigo });
      setPaso(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Codigo invalido o expirado');
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarPassword() {
    setError('');
    if (!nuevaPassword || !confirmarPassword) {
      setError('Completa todos los campos'); return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden'); return;
    }
    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres'); return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/nueva-password', {
        email, codigo, nueva_password: nuevaPassword,
      });
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* PASO 1 — Ingresar correo */}
        {paso === 1 && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🔑</Text>
            </View>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.sub}>
              Ingresa tu correo y te enviaremos un codigo para restablecerla.
            </Text>
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tucorreo@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleEnviarCodigo} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enviar codigo</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* PASO 2 — Ingresar codigo */}
        {paso === 2 && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <Text style={styles.title}>Revisa tu correo</Text>
            <Text style={styles.sub}>
              Si ese correo está registrado, recibiras un codigo de 6 digitos.
            </Text>
            <Text style={[styles.emailLabel]}>{email}</Text>
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <Text style={styles.label}>Codigo de verificacion</Text>
            <TextInput
              style={[styles.input, styles.inputCodigo]}
              placeholder="000000"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              maxLength={6}
              value={codigo}
              onChangeText={setCodigo}
              textAlign="center"
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleVerificarCodigo} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Verificar codigo</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* PASO 3 — Nueva contraseña */}
        {paso === 3 && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🔒</Text>
            </View>
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.sub}>Elige una contraseña segura de al menos 8 caracteres.</Text>
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!verPassword}
                value={nuevaPassword}
                onChangeText={setNuevaPassword}
              />
              <TouchableOpacity onPress={() => setVerPassword(!verPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{verPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!verConfirmar}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
              />
              <TouchableOpacity onPress={() => setVerConfirmar(!verConfirmar)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{verConfirmar ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleCambiarPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Cambiar contraseña</Text>}
            </TouchableOpacity>
          </>
        )}
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
    width: '100%', maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: '#6B4EFF', fontSize: 14, fontWeight: '500' },
  iconWrap: {
    width: 64, height: 64, backgroundColor: '#EDE9FF',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, alignSelf: 'center',
  },
  icon: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: '#8892B0', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emailLabel: { fontSize: 14, fontWeight: '700', color: '#6B4EFF', textAlign: 'center', marginBottom: 16 },
  errorBox: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  input: {
    backgroundColor: '#F7F8FC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13, fontSize: 14, color: '#1A1A2E', marginBottom: 16,
  },
  inputCodigo: { fontSize: 28, fontWeight: '700', letterSpacing: 12 },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F8FC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, marginBottom: 16,
  },
  passwordInput: { flex: 1, padding: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 16 },
  btnPrimary: {
    backgroundColor: '#6B4EFF', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});