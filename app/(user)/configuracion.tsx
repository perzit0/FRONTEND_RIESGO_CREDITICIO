import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [seccion, setSeccion] = useState<'inicio' | 'password' | 'telefono'>('inicio');

  const [codigoPassword, setCodigoPassword] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [passwordPaso, setPasswordPaso] = useState<1 | 2>(1);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [codigoCorreo, setCodigoCorreo] = useState('');
  const [codigoSms, setCodigoSms] = useState('');
  const [telefonoPaso, setTelefonoPaso] = useState<1 | 2 | 3>(1);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function resetMensajes() { setError(''); setExito(''); }

  async function handleSolicitarCodigoPassword() {
    resetMensajes();
    setGuardando(true);
    try {
      await apiClient.post('/api/user/solicitar-cambio-password', {});
      setPasswordPaso(2);
      setExito('Te enviamos un código a tu correo');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar código');
    } finally { setGuardando(false); }
  }

  async function handleConfirmarPassword() {
    resetMensajes();
    if (nuevaPassword !== confirmarPassword) { setError('Las contraseñas no coinciden'); return; }
    if (nuevaPassword.length < 8) { setError('Mínimo 8 caracteres'); return; }
    setGuardando(true);
    try {
      await apiClient.post('/api/user/confirmar-cambio-password', {
        codigo: codigoPassword,
        nueva_password: nuevaPassword,
        confirmar_password: confirmarPassword,
      });
      setExito('Contraseña actualizada correctamente');
      setTimeout(() => { setSeccion('inicio'); setPasswordPaso(1); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido o expirado');
    } finally { setGuardando(false); }
  }

  async function handleSolicitarCambioTelefono() {
    resetMensajes();
    if (!nuevoTelefono) { setError('Ingresa el nuevo número'); return; }
    setGuardando(true);
    try {
      await apiClient.post('/api/user/solicitar-cambio-telefono', { nuevo_telefono: `+51${nuevoTelefono}` });
      setTelefonoPaso(2);
      setExito('Te enviamos un código a tu correo');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al solicitar cambio');
    } finally { setGuardando(false); }
  }

  async function handleConfirmarCorreoTelefono() {
    resetMensajes();
    setGuardando(true);
    try {
      await apiClient.post('/api/user/confirmar-cambio-telefono', { codigo_correo: codigoCorreo });
      setTelefonoPaso(3);
      setExito('Correo confirmado. Te enviamos un SMS al nuevo número');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido');
    } finally { setGuardando(false); }
  }

  async function handleVerificarSms() {
    resetMensajes();
    setGuardando(true);
    try {
      await apiClient.post('/api/user/verificar-nuevo-telefono', { codigo_sms: codigoSms });
      setExito('Teléfono actualizado correctamente');
      setTimeout(() => { setSeccion('inicio'); setTelefonoPaso(1); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código SMS inválido');
    } finally { setGuardando(false); }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => seccion === 'inicio' ? router.back() : setSeccion('inicio')}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Configuración</Text>
      </View>

      {error ? <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}><Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text></View> : null}
      {exito ? <View style={[styles.exitoBox, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}><Text style={[styles.exitoText, { color: colors.success }]}>{exito}</Text></View> : null}

      {seccion === 'inicio' && (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Apariencia</Text>
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {isDark ? 'Modo oscuro' : 'Modo claro'}
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor={'#fff'}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Seguridad</Text>
            {[
              { label: 'Cambiar contraseña', seccion: 'password' },
              { label: 'Cambiar teléfono', seccion: 'telefono' },
            ].map(({ label, seccion: s }, i, arr) => (
              <TouchableOpacity
                key={s}
                style={[styles.opcionBtn, { borderBottomColor: colors.divider, borderBottomWidth: i === arr.length - 1 ? 0 : 1 }]}
                onPress={() => { resetMensajes(); setSeccion(s as any); if (s === 'password') setPasswordPaso(1); if (s === 'telefono') setTelefonoPaso(1); }}
              >
                <Text style={[styles.opcionText, { color: colors.textPrimary }]}>{label}</Text>
                <Text style={[styles.opcionArrow, { color: colors.primary }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {seccion === 'password' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cambiar contraseña</Text>
          {passwordPaso === 1 && (
            <>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Te enviaremos un código a tu correo para confirmar el cambio.</Text>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleSolicitarCodigoPassword} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enviar código al correo</Text>}
              </TouchableOpacity>
            </>
          )}
          {passwordPaso === 2 && (
            <>
              <Text style={[styles.label, { color: colors.textLabel }]}>Código recibido en tu correo</Text>
              <TextInput style={[styles.input, styles.inputCodigo, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="000000" placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={6} value={codigoPassword} onChangeText={setCodigoPassword} />
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
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleConfirmarPassword} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Confirmar cambio</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {seccion === 'telefono' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cambiar teléfono</Text>
          {telefonoPaso === 1 && (
            <>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Ingresa tu nuevo número. Te enviaremos un código al correo para confirmar.</Text>
              <Text style={[styles.label, { color: colors.textLabel }]}>Nuevo número de teléfono</Text>
              <View style={[styles.phoneWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
                <View style={[styles.phonePrefix, { backgroundColor: colors.primaryLight, borderRightColor: colors.inputBorder }]}>
                  <Text style={[styles.phonePrefixText, { color: colors.primary }]}>+51</Text>
                </View>
                <TextInput style={[styles.phoneInput, { color: colors.textPrimary }]} placeholder="999 999 999" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" maxLength={9} value={nuevoTelefono} onChangeText={setNuevoTelefono} />
              </View>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleSolicitarCambioTelefono} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Continuar</Text>}
              </TouchableOpacity>
            </>
          )}
          {telefonoPaso === 2 && (
            <>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Ingresa el código que enviamos a tu correo.</Text>
              <Text style={[styles.label, { color: colors.textLabel }]}>Código del correo</Text>
              <TextInput style={[styles.input, styles.inputCodigo, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="000000" placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={6} value={codigoCorreo} onChangeText={setCodigoCorreo} />
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleConfirmarCorreoTelefono} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Verificar correo</Text>}
              </TouchableOpacity>
            </>
          )}
          {telefonoPaso === 3 && (
            <>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Ingresa el código SMS enviado al nuevo número.</Text>
              <Text style={[styles.label, { color: colors.textLabel }]}>Código SMS</Text>
              <TextInput style={[styles.input, styles.inputCodigo, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="000000" placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={6} value={codigoSms} onChangeText={setCodigoSms} />
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleVerificarSms} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Confirmar nuevo teléfono</Text>}
              </TouchableOpacity>
            </>
          )}
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
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { fontSize: 13, textAlign: 'center' },
  exitoBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  exitoText: { fontSize: 13, textAlign: 'center' },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  cardSub: { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  opcionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  opcionText: { fontSize: 14, fontWeight: '500' },
  opcionArrow: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  inputCodigo: { fontSize: 22, fontWeight: '700', letterSpacing: 10, textAlign: 'center' },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 13, fontSize: 14 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 12, fontWeight: '600' },
  phoneWrap: { flexDirection: 'row', marginBottom: 16, borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
  phonePrefix: { paddingHorizontal: 14, paddingVertical: 13, borderRightWidth: 1.5, justifyContent: 'center' },
  phonePrefixText: { fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, padding: 13, fontSize: 14 },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});