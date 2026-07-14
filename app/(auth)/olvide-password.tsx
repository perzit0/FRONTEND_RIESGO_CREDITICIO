import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function OlvidePasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
    } catch { setError('No se pudo enviar el código. Intenta de nuevo.'); }
    finally { setLoading(false); }
  }

  async function handleVerificarCodigo() {
    setError('');
    if (codigo.length < 6) { setError('Ingresa el código de 6 dígitos'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verificar-codigo-recuperacion', { email, codigo });
      setPaso(3);
    } catch (err: any) { setError(err.response?.data?.error || 'Código inválido o expirado'); }
    finally { setLoading(false); }
  }

  async function handleCambiarPassword() {
    setError('');
    if (!nuevaPassword || !confirmarPassword) { setError('Completa todos los campos'); return; }
    if (nuevaPassword !== confirmarPassword) { setError('Las contraseñas no coinciden'); return; }
    if (nuevaPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/nueva-password', { email, codigo, nueva_password: nuevaPassword });
      router.replace('/(auth)/login');
    } catch (err: any) { setError(err.response?.data?.error || 'No se pudo cambiar la contraseña'); }
    finally { setLoading(false); }
  }

  const errorBox = error ? (
    <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
      <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
    </View>
  ) : null;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>

        {paso === 1 && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}><Text style={styles.icon}>🔑</Text></View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>¿Olvidaste tu contraseña?</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Ingresa tu correo y te enviaremos un código para restablecerla.</Text>
            {errorBox}
            <Text style={[styles.label, { color: colors.textLabel }]}>Correo electrónico</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="tucorreo@email.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleEnviarCodigo} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enviar código</Text>}
            </TouchableOpacity>
          </>
        )}

        {paso === 2 && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}><Text style={styles.icon}>✉️</Text></View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Revisa tu correo</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Si ese correo está registrado, recibirás un código de 6 dígitos.</Text>
            <Text style={[styles.emailLabel, { color: colors.primary }]}>{email}</Text>
            {errorBox}
            <Text style={[styles.label, { color: colors.textLabel }]}>Código de verificación</Text>
            <TextInput style={[styles.input, styles.inputCodigo, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="000000" placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={6} value={codigo} onChangeText={setCodigo} textAlign="center" />
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleVerificarCodigo} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Verificar código</Text>}
            </TouchableOpacity>
          </>
        )}

        {paso === 3 && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}><Text style={styles.icon}>🔒</Text></View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Nueva contraseña</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Elige una contraseña segura de al menos 8 caracteres.</Text>
            {errorBox}
            {[
              { label: 'Nueva contraseña', val: nuevaPassword, setVal: setNuevaPassword, ver: verPassword, setVer: setVerPassword, ph: 'Mínimo 8 caracteres' },
              { label: 'Confirmar contraseña', val: confirmarPassword, setVal: setConfirmarPassword, ver: verConfirmar, setVer: setVerConfirmar, ph: 'Repite tu contraseña' },
            ].map(({ label, val, setVal, ver, setVer, ph }) => (
              <View key={label}>
                <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
                <View style={[styles.passwordWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
                  <TextInput style={[styles.passwordInput, { color: colors.textPrimary }]} placeholder={ph} placeholderTextColor={colors.textMuted} secureTextEntry={!ver} value={val} onChangeText={setVal} />
                  <TouchableOpacity onPress={() => setVer(!ver)} style={styles.eyeBtn}>
                    <Text style={[styles.eyeText, { color: colors.primary }]}>{ver ? 'Ocultar' : 'Ver'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleCambiarPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Cambiar contraseña</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: 'transparent', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0, shadowRadius: 24, elevation: 0 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 14, fontWeight: '500' },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' },
  icon: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emailLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  inputCodigo: { fontSize: 28, fontWeight: '700', letterSpacing: 12 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 13, fontSize: 14 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 12, fontWeight: '600' },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});