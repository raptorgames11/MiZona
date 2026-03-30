import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView
} from 'react-native';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function ChoferScreen() {
  const [vista, setVista] = useState('login');
  const [choferActual, setChoferActual] = useState(null);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tipo, setTipo] = useState('taxi');
  const [ruta, setRuta] = useState('');
  const [cuposMax, setCuposMax] = useState('4');
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    if (!nombre || !whatsapp || !usuario || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const coleccion = tipo === 'taxi' ? 'taxis' : 'trufis';
      const campos = {
        nombre: { stringValue: nombre },
        whatsapp: { stringValue: whatsapp },
        usuario: { stringValue: usuario },
        password: { stringValue: password },
        tipo: { stringValue: tipo === 'taxi' ? 'Auto' : 'Trufi' },
        libre: { booleanValue: true },
      };
      if (tipo === 'trufi') {
        campos.chofer = { stringValue: nombre };
        campos.ruta = { stringValue: ruta };
        campos.cupos = { integerValue: parseInt(cuposMax) || 4 };
        campos.cuposMax = { integerValue: parseInt(cuposMax) || 4 };
      }
      const res = await fetch(`${BASE_URL}/${coleccion}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: campos })
      });
      const data = await res.json();
      if (data.name) {
        Alert.alert('Listo', 'Registrado correctamente');
        setVista('login');
      } else {
        Alert.alert('Error', 'No se pudo registrar');
      }
    } catch (e) {
      Alert.alert('Error', 'Sin conexión');
    }
    setCargando(false);
  };

  const entrar = async () => {
    if (!usuario || !password) {
      Alert.alert('Error', 'Completa usuario y contraseña');
      return;
    }
    setCargando(true);
    try {
      for (const col of ['taxis', 'trufis']) {
        const res = await fetch(`${BASE_URL}/${col}?key=${API_KEY}`);
        const data = await res.json();
        if (data.documents) {
          const doc = data.documents.find(d =>
            d.fields.usuario?.stringValue === usuario &&
            d.fields.password?.stringValue === password
          );
          if (doc) {
            setChoferActual({
              id: doc.name.split('/').pop(),
              nombre: doc.fields.nombre?.stringValue || doc.fields.chofer?.stringValue || '',
              tipo: col,
              libre: doc.fields.libre?.booleanValue ?? true,
              ruta: doc.fields.ruta?.stringValue || '',
              cupos: parseInt(doc.fields.cupos?.integerValue) || 0,
              cuposMax: parseInt(doc.fields.cuposMax?.integerValue) || 4,
            });
            setVista('panel');
            setCargando(false);
            return;
          }
        }
      }
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    } catch (e) {
      Alert.alert('Error', 'Sin conexión');
    }
    setCargando(false);
  };

  const cambiarEstado = async () => {
    setCargando(true);
    try {
      const nuevoEstado = !choferActual.libre;
      await fetch(`${BASE_URL}/${choferActual.tipo}/${choferActual.id}?key=${API_KEY}&updateMask.fieldPaths=libre`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { libre: { booleanValue: nuevoEstado } } })
      });
      setChoferActual({ ...choferActual, libre: nuevoEstado });
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
    setCargando(false);
  };

  const liberarCupo = async () => {
    if (choferActual.cupos >= choferActual.cuposMax) {
      Alert.alert('Aviso', 'Ya tienes todos los cupos disponibles');
      return;
    }
    setCargando(true);
    try {
      const nuevosCupos = choferActual.cupos + 1;
      await fetch(`${BASE_URL}/trufis/${choferActual.id}?key=${API_KEY}&updateMask.fieldPaths=cupos&updateMask.fieldPaths=libre`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            cupos: { integerValue: nuevosCupos },
            libre: { booleanValue: true }
          }
        })
      });
      setChoferActual({ ...choferActual, cupos: nuevosCupos, libre: true });
      Alert.alert('Listo', 'Cupo liberado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo liberar');
    }
    setCargando(false);
  };

  const resetearViaje = async () => {
    Alert.alert('Nuevo viaje', '¿Resetear todos los cupos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        setCargando(true);
        try {
          await fetch(`${BASE_URL}/trufis/${choferActual.id}?key=${API_KEY}&updateMask.fieldPaths=cupos&updateMask.fieldPaths=libre`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                cupos: { integerValue: choferActual.cuposMax },
                libre: { booleanValue: true }
              }
            })
          });
          setChoferActual({ ...choferActual, cupos: choferActual.cuposMax, libre: true });
          Alert.alert('Listo', `${choferActual.cuposMax} cupos disponibles`);
        } catch (e) {
          Alert.alert('Error', 'No se pudo resetear');
        }
        setCargando(false);
      }}
    ]);
  };
  if (vista === 'panel' && choferActual) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topbar}>
          <View>
            <Text style={s.titulo}>Panel Chofer</Text>
            <Text style={s.subtitulo}>{choferActual.nombre}</Text>
          </View>
          <TouchableOpacity style={s.cerrarBtn} onPress={() => { setVista('login'); setChoferActual(null); }}>
            <Text style={s.cerrarTexto}>Salir</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.scroll}>
          <View style={s.panelCentro}>
            <Text style={s.estadoLabel}>Tu estado actual</Text>
            <View style={[s.estadoBadge, choferActual.libre ? s.badgeVerde : s.badgeRojo]}>
              <Text style={[s.estadoTexto, choferActual.libre ? s.badgeTextoVerde : s.badgeTextoRojo]}>
                {choferActual.libre ? 'LIBRE' : 'OCUPADO'}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.cambiarBtn, choferActual.libre ? s.cambiarBtnRojo : s.cambiarBtnVerde]}
              onPress={cambiarEstado}
              disabled={cargando}
            >
              <Text style={s.cambiarBtnTexto}>
                {choferActual.libre ? 'Marcar como Ocupado' : 'Marcar como Libre'}
              </Text>
            </TouchableOpacity>
            {choferActual.tipo === 'trufis' && (
              <View style={s.trufisPanel}>
                <Text style={s.trufisTitulo}>Gestión de cupos</Text>
                <Text style={s.rutaTexto}>📍 {choferActual.ruta}</Text>
                <View style={s.cuposDisplay}>
                  <Text style={s.cuposLabel}>Cupos disponibles</Text>
                  <Text style={[s.cuposNum, choferActual.cupos === 0 && s.cuposAgotados]}>
                    {choferActual.cupos} / {choferActual.cuposMax}
                  </Text>
                </View>
                <TouchableOpacity style={s.liberarBtn} onPress={liberarCupo} disabled={cargando}>
                  <Text style={s.liberarTexto}>Pasajero canceló — Liberar 1 cupo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.resetBtn} onPress={resetearViaje} disabled={cargando}>
                  <Text style={s.resetTexto}>Nuevo viaje — Resetear todos los cupos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (vista === 'registro') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topbar}>
          <Text style={s.titulo}>Registro Chofer</Text>
          <Text style={s.subtitulo}>Crea tu cuenta</Text>
        </View>
        <ScrollView style={s.scroll}>
          <View style={s.form}>
            <Text style={s.label}>Tipo de vehículo</Text>
            <View style={s.tipoRow}>
              <TouchableOpacity style={[s.tipoBtn, tipo === 'taxi' && s.tipoBtnActivo]} onPress={() => setTipo('taxi')}>
                <Text style={[s.tipoBtnTexto, tipo === 'taxi' && s.tipoBtnTextoActivo]}>🚕 Taxi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.tipoBtn, tipo === 'trufi' && s.tipoBtnActivo]} onPress={() => setTipo('trufi')}>
                <Text style={[s.tipoBtnTexto, tipo === 'trufi' && s.tipoBtnTextoActivo]}>🚗 Trufi</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.label}>Tu nombre</Text>
            <TextInput style={s.input} placeholder="Ej: Juan Pérez" value={nombre} onChangeText={setNombre} />
            <Text style={s.label}>WhatsApp</Text>
            <TextInput style={s.input} placeholder="Ej: 59171234567" value={whatsapp} onChangeText={setWhatsapp} keyboardType="numeric" />
            {tipo === 'trufi' && (
              <>
                <Text style={s.label}>Ruta</Text>
                <TextInput style={s.input} placeholder="Ej: Cuevo → Camiri" value={ruta} onChangeText={setRuta} />
                <Text style={s.label}>Cupos máximos</Text>
                <TextInput style={s.input} placeholder="Ej: 4" value={cuposMax} onChangeText={setCuposMax} keyboardType="numeric" />
              </>
            )}
            <Text style={s.label}>Usuario</Text>
            <TextInput style={s.input} placeholder="Ej: juanchofer" value={usuario} onChangeText={setUsuario} autoCapitalize="none" />
            <Text style={s.label}>Contraseña</Text>
            <TextInput style={s.input} placeholder="Mínimo 4 caracteres" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={[s.btn, cargando && s.btnDesactivado]} onPress={registrar} disabled={cargando}>
              <Text style={s.btnTexto}>{cargando ? 'Registrando...' : 'Crear cuenta'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.volverBtn} onPress={() => setVista('login')}>
              <Text style={s.volverTexto}>Ya tengo cuenta — Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>Soy Chofer</Text>
        <Text style={s.subtitulo}>Inicia sesión para marcar tu estado</Text>
      </View>
      <View style={s.form}>
        <Text style={s.label}>Usuario</Text>
        <TextInput style={s.input} placeholder="Tu usuario" value={usuario} onChangeText={setUsuario} autoCapitalize="none" />
        <Text style={s.label}>Contraseña</Text>
        <TextInput style={s.input} placeholder="Tu contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[s.btn, cargando && s.btnDesactivado]} onPress={entrar} disabled={cargando}>
          <Text style={s.btnTexto}>{cargando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.volverBtn} onPress={() => setVista('registro')}>
          <Text style={s.volverTexto}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topbar: { backgroundColor: '#1D9E75', padding: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 20, fontWeight: '600', color: 'white' },
  subtitulo: { fontSize: 12, color: '#9FE1CB', marginTop: 2 },
  cerrarBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  cerrarTexto: { color: 'white', fontSize: 12 },
  scroll: { flex: 1 },
  form: { padding: 24 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 14, color: '#222', borderWidth: 0.5, borderColor: '#e0e0e0' },
  tipoRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  tipoBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: 'white', borderWidth: 0.5, borderColor: '#e0e0e0' },
  tipoBtnActivo: { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5' },
  tipoBtnTexto: { fontSize: 13, color: '#888' },
  tipoBtnTextoActivo: { color: '#085041', fontWeight: '500' },
  btn: { backgroundColor: '#1D9E75', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnDesactivado: { backgroundColor: '#9FE1CB' },
  btnTexto: { color: 'white', fontSize: 15, fontWeight: '600' },
  volverBtn: { alignItems: 'center', marginTop: 16, padding: 10 },
  volverTexto: { fontSize: 13, color: '#1D9E75' },
  panelCentro: { alignItems: 'center', padding: 24 },
  estadoLabel: { fontSize: 16, color: '#888', marginBottom: 16 },
  estadoBadge: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, marginBottom: 24 },
  estadoTexto: { fontSize: 24, fontWeight: '600' },
  badgeVerde: { backgroundColor: '#E1F5EE' },
  badgeRojo: { backgroundColor: '#FCEBEB' },
  badgeTextoVerde: { color: '#085041' },
  badgeTextoRojo: { color: '#A32D2D' },
  cambiarBtn: { borderRadius: 8, padding: 14, alignItems: 'center', width: '100%', marginBottom: 24 },
  cambiarBtnVerde: { backgroundColor: '#1D9E75' },
  cambiarBtnRojo: { backgroundColor: '#E24B4A' },
  cambiarBtnTexto: { color: 'white', fontSize: 15, fontWeight: '600' },
  trufisPanel: { width: '100%', backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#e0e0e0' },
  trufisTitulo: { fontSize: 15, fontWeight: '500', color: '#222', marginBottom: 8 },
  rutaTexto: { fontSize: 13, color: '#1D9E75', marginBottom: 16 },
  cuposDisplay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cuposLabel: { fontSize: 14, color: '#888' },
  cuposNum: { fontSize: 24, fontWeight: '600', color: '#1D9E75' },
  cuposAgotados: { color: '#A32D2D' },
  liberarBtn: { backgroundColor: '#E1F5EE', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8, borderWidth: 0.5, borderColor: '#5DCAA5' },
  liberarTexto: { color: '#085041', fontSize: 13, fontWeight: '500' },
  resetBtn: { backgroundColor: '#1D9E75', borderRadius: 8, padding: 12, alignItems: 'center' },
  resetTexto: { color: 'white', fontSize: 13, fontWeight: '500' },
});