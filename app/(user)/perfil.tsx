import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { obtenerToken } from '../../storage/secureStorage';

export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<'inicio' | 'nombre' | 'password' | 'telefono'>('inicio');

  // Nombre
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Password
  const [codigoPassword, setCodigoPassword] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [passwordPaso, setPasswordPaso] = useState<1 | 2>(1);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  // Telefono
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [codigoCorreo, setCodigoCorreo] = useState('');
  const [codigoSms, setCodigoSms] = useState('');
  const [telefonoPaso, setTelefonoPaso] = useState<1 | 2 | 3>(1);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => { cargarPerfil(); }, []);

  async function cargarPerfil() {
    try {
      const token = await obtenerToken();
      const res = await apiClient.get('/api/user/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPerfil(res.data);
      setNuevoNombre(res.data.nombre);
    } catch { }
    finally { setLoading(false); }
  }

  function resetMensajes() { setError(''); setExito(''); }

  async function handleGuardarNombre() {
    resetMensajes();
    if (!nuevoNombre.trim()) { setError('El nombre no puede estar vacío'); return; }
    setGuardando(true);
    try {
      const token = await obtenerToken();
      await apiClient.post('/api/user/actualizar-nombre', { nombre: nuevoNombre }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExito('Nombre actualizado correctamente');
      setPerfil((p: any) => ({ ...p, nombre: nuevoNombre }));
      setTimeout(() => setSeccion('inicio'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar nombre');
    } finally { setGuardando(false); }
  }

  async function handleSolicitarCodigoPassword() {
    resetMensajes();
    setGuardando(true);
    try {
      const token = await obtenerToken();
      await apiClient.post('/api/user/solicitar-cambio-password', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = await obtenerToken();
      await apiClient.post('/api/user/confirmar-cambio-password', {
        codigo: codigoPassword,
        nueva_password: nuevaPassword,
        confirmar_password: confirmarPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = await obtenerToken();
      await apiClient.post('/api/user/solicitar-cambio-telefono', {
        nuevo_telefono: nuevoTelefono,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = await obtenerToken();
      await apiClient.post('/api/user/confirmar-cambio-telefono', {
        codigo_correo: codigoCorreo,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = await obtenerToken();
      await apiClient.post('/api/user/verificar-nuevo-telefono', {
        codigo_sms: codigoSms,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setExito('Teléfono actualizado correctamente');
      setPerfil((p: any) => ({ ...p, telefono: nuevoTelefono }));
      setTimeout(() => { setSeccion('inicio'); setTelefonoPaso(1); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código SMS inválido');
    } finally { setGuardando(false); }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mi perfil</Text>
      </View>

      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
      {exito ? <View style={styles.exitoBox}><Text style={styles.exitoText}>{exito}</Text></View> : null}

      {/* ── INICIO ── */}
      {seccion === 'inicio' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información personal</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{perfil?.nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{perfil?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DNI</Text>
              <Text style={styles.infoValue}>{perfil?.dni}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{perfil?.telefono}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Editar información</Text>
            <TouchableOpacity style={styles.opcionBtn} onPress={() => { resetMensajes(); setSeccion('nombre'); }}>
              <Text style={styles.opcionText}>Cambiar nombre</Text>
              <Text style={styles.opcionArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.opcionBtn} onPress={() => { resetMensajes(); setSeccion('password'); setPasswordPaso(1); }}>
              <Text style={styles.opcionText}>Cambiar contraseña</Text>
              <Text style={styles.opcionArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.opcionBtn, { borderBottomWidth: 0 }]} onPress={() => { resetMensajes(); setSeccion('telefono'); setTelefonoPaso(1); }}>
              <Text style={styles.opcionText}>Cambiar teléfono</Text>
              <Text style={styles.opcionArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── NOMBRE ── */}
      {seccion === 'nombre' && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setSeccion('inicio')} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Cambiar nombre</Text>
          <Text style={styles.label}>Nuevo nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholder="Tu nombre completo"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardarNombre} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Guardar nombre</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* ── PASSWORD ── */}
      {seccion === 'password' && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setSeccion('inicio')} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Cambiar contraseña</Text>

          {passwordPaso === 1 && (
            <>
              <Text style={styles.cardSub}>Te enviaremos un código a tu correo para confirmar el cambio.</Text>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSolicitarCodigoPassword} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enviar código al correo</Text>}
              </TouchableOpacity>
            </>
          )}

          {passwordPaso === 2 && (
            <>
              <Text style={styles.label}>Código recibido en tu correo</Text>
              <TextInput
                style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 22 }]}
                placeholder="000000"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={6}
                value={codigoPassword}
                onChangeText={setCodigoPassword}
              />
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
                  <Text>{verPassword ? '🙈' : '👁'}</Text>
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
                  <Text>{verConfirmar ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmarPassword} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Confirmar cambio</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ── TELEFONO ── */}
      {seccion === 'telefono' && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setSeccion('inicio')} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Cambiar teléfono</Text>

          {telefonoPaso === 1 && (
            <>
              <Text style={styles.cardSub}>Ingresa tu nuevo número. Te enviaremos un código al correo para confirmar.</Text>
              <Text style={styles.label}>Nuevo número de teléfono</Text>
              <View style={styles.phoneWrap}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+51</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="999 999 999"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={nuevoTelefono}
                  onChangeText={setNuevoTelefono}
                />
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSolicitarCambioTelefono} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Continuar</Text>}
              </TouchableOpacity>
            </>
          )}

          {telefonoPaso === 2 && (
            <>
              <Text style={styles.cardSub}>Ingresa el código que enviamos a tu correo.</Text>
              <Text style={styles.label}>Código del correo</Text>
              <TextInput
                style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 22 }]}
                placeholder="000000"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={6}
                value={codigoCorreo}
                onChangeText={setCodigoCorreo}
              />
              <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmarCorreoTelefono} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Verificar correo</Text>}
              </TouchableOpacity>
            </>
          )}

          {telefonoPaso === 3 && (
            <>
              <Text style={styles.cardSub}>Ingresa el código SMS enviado al nuevo número.</Text>
              <Text style={styles.label}>Código SMS</Text>
              <TextInput
                style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 22 }]}
                placeholder="000000"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={6}
                value={codigoSms}
                onChangeText={setCodigoSms}
              />
              <TouchableOpacity style={styles.btnPrimary} onPress={handleVerificarSms} disabled={guardando}>
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
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 20 },
  loadingWrap: { flex: 1, backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#6B4EFF', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  exitoBox: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7', borderRadius: 10, padding: 12, marginBottom: 14 },
  exitoText: { color: '#059669', fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
  cardSub: { fontSize: 13, color: '#8892B0', marginBottom: 16, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0EFFF' },
  infoLabel: { fontSize: 13, color: '#8892B0', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1A1A2E', fontWeight: '600' },
  opcionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0EFFF' },
  opcionText: { fontSize: 14, color: '#1A1A2E', fontWeight: '500' },
  opcionArrow: { fontSize: 16, color: '#6B4EFF' },
  label: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  input: { backgroundColor: '#F7F8FC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 13, fontSize: 14, color: '#1A1A2E', marginBottom: 16 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  phoneWrap: { flexDirection: 'row', marginBottom: 16, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F7F8FC' },
  phonePrefix: { paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#EDE9FF', borderRightWidth: 1.5, borderRightColor: '#E2E8F0', justifyContent: 'center' },
  phonePrefixText: { fontSize: 14, fontWeight: '700', color: '#6B4EFF' },
  phoneInput: { flex: 1, padding: 13, fontSize: 14, color: '#1A1A2E' },
  btnPrimary: { backgroundColor: '#6B4EFF', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});