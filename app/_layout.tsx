import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/registro" />
        <Stack.Screen name="(auth)/verificar-correo" />
        <Stack.Screen name="(auth)/verificar-sms" />
        <Stack.Screen name="(auth)/olvide-password" />
        <Stack.Screen name="(user)/home" />
        <Stack.Screen name="(user)/formulario" />
        <Stack.Screen name="(user)/resultado" />
        <Stack.Screen name="(user)/perfil" />
        <Stack.Screen name="(user)/comunidad" />
        <Stack.Screen name="(user)/meta" />
        <Stack.Screen name="(admin)/dashboard" />
        <Stack.Screen name="(admin)/casos-fraude" />
        <Stack.Screen name="(admin)/metricas" />
      </Stack>
    </>
  );
}