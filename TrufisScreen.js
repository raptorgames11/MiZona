import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, Alert
} from 'react-native';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function TrufisScreen() {
  const [trufis, setTrufis] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/trufis?key=${API_KEY}`);
      const data = await res.json();
      if (data.documents) {
        setTrufis(data.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          chofer: doc.fields.chofer?.stringValue || doc.fields.nombre?.stringValue || '',
          ruta: doc.fields.ruta?.stringValue || '',
          whatsapp: doc.fields.whatsapp?.stringValue || '',
          libre: doc.fields.libre?.booleanValue ?? true,
          cupos: parseInt(doc.fields.cupos?.integerValue) || 0,
        })));
      } else setTrufis([]);
    } catch (e) { setTrufis([]); }
    setCargando(false);
  };

  const abrirWhatsApp = (numero) => Linking.openURL(`https://wa.me/${numero}`);

  const reservarCupo = async (trufi) => {
    if (trufi.cupos <= 0) {
      Alert.alert('Sin cupos', 'Este trufi ya está lleno');
      return;
    }
    Alert.alert(
      'Reservar cupo',
      `¿Confirmas tu cupo en ${trufi.chofer}?\nRuta: ${trufi.ruta}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar', onPress: async () => {
            try {
              const nuevosCupos = trufi.cupos - 1;
              const nuevoLibre = nuevosCupos > 0;
              await fetch(`${BASE_URL}/trufis/${trufi.id}?key=${API_KEY}&updateMask.fieldPaths=cupos&updateMask.fieldPaths=libre`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fields: {
                    cupos: { integerValue: nuevosCupos },
                    libre: { booleanValue: nuevoLibre }
                  }
                })
              });
              Alert.alert('Listo', `Cupo reservado. Contacta al chofer por WhatsApp.`);
              cargar();
            } catch (e) {
              Alert.alert('Error', 'No se pudo reservar');
            }
          }
        }
      ]
    );
  };
  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>Trufis disponibles</Text>
        <Text style={s.subtitulo}>Rutas interurbanas — Cuevo · Camiri y más</Text>
      </View>
      <ScrollView style={s.scroll}>
        <View style={s.recargarRow}>
          <Text style={s.seccion}>{trufis.filter(t => t.libre).length} trufi(s) disponible(s)</Text>
          <TouchableOpacity style={s.recargarBtn} onPress={cargar}>
            <Text style={s.recargarTexto}>Actualizar</Text>
          </TouchableOpacity>
        </View>
        {cargando && <View style={s.centro}><Text style={s.cargandoTexto}>Cargando...</Text></View>}
        {!cargando && trufis.length === 0 && (
          <View style={s.centro}><Text style={s.cargandoTexto}>No hay trufis registrados aún</Text></View>
        )}
        {trufis.map(t => (
          <View key={t.id} style={[s.card, !t.libre && s.cardOcupado]}>
            <View style={s.avatar}>
              <Text style={s.avatarTexto}>🚗</Text>
            </View>
            <View style={s.info}>
              <Text style={s.nombre}>{t.chofer}</Text>
              <Text style={s.ruta}>📍 {t.ruta}</Text>
              <View style={s.cuposRow}>
                <Text style={s.cuposTexto}>Cupos: </Text>
                <Text style={[s.cuposNum, t.cupos === 0 && s.cuposAgotados]}>{t.cupos}</Text>
              </View>
            </View>
            <View style={s.derecha}>
              <View style={[s.badge, t.libre ? s.badgeVerde : s.badgeRojo]}>
                <Text style={[s.badgeTexto, t.libre ? s.badgeTextoVerde : s.badgeTextoRojo]}>
                  {t.libre ? 'Disponible' : 'En ruta'}
                </Text>
              </View>
              {t.libre && t.cupos > 0 && (
                <TouchableOpacity style={s.reservarBtn} onPress={() => reservarCupo(t)}>
                  <Text style={s.reservarTexto}>Reservar</Text>
                </TouchableOpacity>
              )}
              {t.libre && (
                <TouchableOpacity style={s.waBtn} onPress={() => abrirWhatsApp(t.whatsapp)}>
                  <Text style={s.waBtnTexto}>WA</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
  centro: { alignItems: 'center', padding: 32 },
  cargandoTexto: { fontSize: 14, color: '#888' },
  recargarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  seccion: { fontSize: 12, fontWeight: '600', color: '#888', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  recargarBtn: { backgroundColor: '#E1F5EE', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  recargarTexto: { fontSize: 12, color: '#0F6E56' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e0e0e0' },
  cardOcupado: { opacity: 0.6 },
  avatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 20 },
  info: { flex: 1, marginLeft: 10 },
  nombre: { fontSize: 14, fontWeight: '500', color: '#222' },
  ruta: { fontSize: 12, color: '#1D9E75', marginTop: 2 },
  cuposRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cuposTexto: { fontSize: 12, color: '#888' },
  cuposNum: { fontSize: 12, fontWeight: '600', color: '#1D9E75' },
  cuposAgotados: { color: '#A32D2D' },
  derecha: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeVerde: { backgroundColor: '#E1F5EE' },
  badgeRojo: { backgroundColor: '#FCEBEB' },
  badgeTexto: { fontSize: 11 },
  badgeTextoVerde: { color: '#085041' },
  badgeTextoRojo: { color: '#A32D2D' },
  reservarBtn: { backgroundColor: '#1D9E75', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  reservarTexto: { color: 'white', fontSize: 11, fontWeight: '500' },
  waBtn: { backgroundColor: '#E1F5EE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5, borderColor: '#5DCAA5' },
  waBtnTexto: { color: '#0F6E56', fontSize: 11, fontWeight: '500' },
});