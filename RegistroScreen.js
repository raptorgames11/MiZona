import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function RegistroScreen({ onVolver }) {
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);

  const detectarUbicacion = async () => {
    setBuscandoUbicacion(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Necesitamos permiso para tu ubicación');
        setBuscandoUbicacion(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUbicacion({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('Listo', 'Ubicación detectada');
    } catch (e) {
      Alert.alert('Error', 'No se pudo detectar la ubicación');
    }
    setBuscandoUbicacion(false);
  };

  const registrar = async () => {
    if (!nombre || !whatsapp || !usuario || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (!ubicacion) {
      Alert.alert('Error', 'Detecta tu ubicación primero');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/tiendas?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            nombre: { stringValue: nombre },
            whatsapp: { stringValue: whatsapp },
            usuario: { stringValue: usuario },
            password: { stringValue: password },
            lat: { doubleValue: ubicacion.lat },
            lng: { doubleValue: ubicacion.lng },
          }
        })
      });
      const data = await res.json();
      if (data.name) {
        Alert.alert('Listo', 'Tienda registrada', [{ text: 'OK', onPress: onVolver }]);
      } else {
        Alert.alert('Error', 'No se pudo registrar');
      }
    } catch (e) {
      Alert.alert('Error', 'Sin conexión');
    }
    setCargando(false);
  };
  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>MiZona</Text>
        <Text style={s.subtitulo}>Registro de tienda</Text>
      </View>
      <ScrollView style={s.scroll}>
        <View style={s.form}>
          <Text style={s.bienvenida}>Registra tu tienda</Text>
          <Text style={s.desc}>Crea tu cuenta para publicar productos</Text>

          <Text style={s.label}>Nombre de tu tienda</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: Tienda Central"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={s.label}>Número de WhatsApp</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: 59171234567"
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="numeric"
          />

          <Text style={s.label}>Usuario</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: mitienda123"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          <Text style={s.label}>Contraseña</Text>
          <TextInput
            style={s.input}
            placeholder="Mínimo 4 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <Text style={s.label}>Ubicación de tu tienda</Text>
          <TouchableOpacity
            style={[s.ubicacionBtn, ubicacion && s.ubicacionBtnActivo]}
            onPress={detectarUbicacion}
            disabled={buscandoUbicacion}
          >
            <Text style={[s.ubicacionTexto, ubicacion && s.ubicacionTextoActivo]}>
              {buscandoUbicacion ? 'Detectando...' : ubicacion ? 'Ubicación detectada ✓' : 'Detectar mi ubicación'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, cargando && s.btnDesactivado]}
            onPress={registrar}
            disabled={cargando}
          >
            <Text style={s.btnTexto}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.volverBtn} onPress={onVolver}>
            <Text style={s.volverTexto}>Ya tengo cuenta — Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topbar: { backgroundColor: '#1D9E75', padding: 16, paddingTop: 40 },
  titulo: { fontSize: 20, fontWeight: '600', color: 'white' },
  subtitulo: { fontSize: 12, color: '#9FE1CB', marginTop: 2 },
  scroll: { flex: 1 },
  form: { padding: 24 },
  bienvenida: { fontSize: 22, fontWeight: '600', color: '#222', marginBottom: 6 },
  desc: { fontSize: 13, color: '#888', marginBottom: 24 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 14, color: '#222', borderWidth: 0.5, borderColor: '#e0e0e0' },
  ubicacionBtn: { backgroundColor: 'white', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#e0e0e0', marginTop: 4 },
  ubicacionBtnActivo: { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5' },
  ubicacionTexto: { fontSize: 14, color: '#888' },
  ubicacionTextoActivo: { color: '#085041', fontWeight: '500' },
  btn: { backgroundColor: '#1D9E75', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnDesactivado: { backgroundColor: '#9FE1CB' },
  btnTexto: { color: 'white', fontSize: 15, fontWeight: '600' },
  volverBtn: { alignItems: 'center', marginTop: 16, padding: 10 },
  volverTexto: { fontSize: 13, color: '#1D9E75' },
});