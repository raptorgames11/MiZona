import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert
} from 'react-native';
import RegistroScreen from './RegistroScreen';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [registro, setRegistro] = useState(false);

  if (registro) {
    return <RegistroScreen onVolver={() => setRegistro(false)} />;
  }

  const entrar = async () => {
    if (!usuario || !password) {
      Alert.alert('Error', 'Completa usuario y contraseña');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/tiendas?key=${API_KEY}`);
      const data = await res.json();
      if (!data.documents) {
        Alert.alert('Error', 'No hay tiendas registradas');
        return;
      }
      const tienda = data.documents.find(doc =>
        doc.fields.usuario.stringValue === usuario &&
        doc.fields.password.stringValue === password
      );
      if (tienda) {
        onLogin({
          nombre: tienda.fields.nombre.stringValue,
          whatsapp: tienda.fields.whatsapp.stringValue,
          usuario: tienda.fields.usuario.stringValue,
        });
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
      }
    } catch (e) {
      Alert.alert('Error', 'Sin conexión');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>MiZona</Text>
        <Text style={s.subtitulo}>Panel de tienda</Text>
      </View>
      <View style={s.form}>
        <Text style={s.bienvenida}>Bienvenido</Text>
        <Text style={s.desc}>Inicia sesión para administrar tu tienda</Text>
        <Text style={s.label}>Usuario</Text>
        <TextInput
          style={s.input}
          placeholder="Tu usuario"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />
        <Text style={s.label}>Contraseña</Text>
        <TextInput
          style={s.input}
          placeholder="Tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity style={s.btn} onPress={entrar}>
          <Text style={s.btnTexto}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.registroBtn} onPress={() => setRegistro(true)}>
          <Text style={s.registroTexto}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topbar: { backgroundColor: '#1D9E75', padding: 16, paddingTop: 40 },
  titulo: { fontSize: 20, fontWeight: '600', color: 'white' },
  subtitulo: { fontSize: 12, color: '#9FE1CB', marginTop: 2 },
  form: { padding: 24 },
  bienvenida: { fontSize: 22, fontWeight: '600', color: '#222', marginBottom: 6 },
  desc: { fontSize: 13, color: '#888', marginBottom: 24 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 14, color: '#222', borderWidth: 0.5, borderColor: '#e0e0e0' },
  btn: { backgroundColor: '#1D9E75', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnTexto: { color: 'white', fontSize: 15, fontWeight: '600' },
  registroBtn: { alignItems: 'center', marginTop: 16, padding: 10 },
  registroTexto: { fontSize: 13, color: '#1D9E75' },
});