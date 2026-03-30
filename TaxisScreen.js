import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking
} from 'react-native';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function TaxisScreen() {
  const [taxis, setTaxis] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/taxis?key=${API_KEY}`);
      const data = await res.json();
      if (data.documents) {
        setTaxis(data.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          nombre: doc.fields.nombre?.stringValue || '',
          tipo: doc.fields.tipo?.stringValue || 'Auto',
          whatsapp: doc.fields.whatsapp?.stringValue || '',
          libre: doc.fields.libre?.booleanValue ?? true,
        })));
      } else setTaxis([]);
    } catch (e) { setTaxis([]); }
    setCargando(false);
  };

  const abrirWhatsApp = (numero) => Linking.openURL(`https://wa.me/${numero}`);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>Taxis disponibles</Text>
        <Text style={s.subtitulo}>Transporte local — personas y pedidos</Text>
      </View>
      <ScrollView style={s.scroll}>
        <View style={s.recargarRow}>
          <Text style={s.seccion}>{taxis.filter(t => t.libre).length} taxi(s) libre(s)</Text>
          <TouchableOpacity style={s.recargarBtn} onPress={cargar}>
            <Text style={s.recargarTexto}>Actualizar</Text>
          </TouchableOpacity>
        </View>
        {cargando && <View style={s.centro}><Text style={s.cargandoTexto}>Cargando...</Text></View>}
        {!cargando && taxis.length === 0 && (
          <View style={s.centro}><Text style={s.cargandoTexto}>No hay taxis registrados aún</Text></View>
        )}
        {taxis.map(t => (
          <View key={t.id} style={[s.card, !t.libre && s.cardOcupado]}>
            <View style={s.avatar}>
              <Text style={s.avatarTexto}>{t.tipo === 'Moto' ? '🏍️' : '🚕'}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.nombre}>{t.nombre}</Text>
              <Text style={s.tipo}>{t.tipo}</Text>
            </View>
            <View style={s.derecha}>
              <View style={[s.badge, t.libre ? s.badgeVerde : s.badgeRojo]}>
                <Text style={[s.badgeTexto, t.libre ? s.badgeTextoVerde : s.badgeTextoRojo]}>
                  {t.libre ? 'Libre' : 'Ocupado'}
                </Text>
              </View>
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
  tipo: { fontSize: 12, color: '#888', marginTop: 2 },
  derecha: { alignItems: 'flex-end', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeVerde: { backgroundColor: '#E1F5EE' },
  badgeRojo: { backgroundColor: '#FCEBEB' },
  badgeTexto: { fontSize: 11 },
  badgeTextoVerde: { color: '#085041' },
  badgeTextoRojo: { color: '#A32D2D' },
  waBtn: { backgroundColor: '#1D9E75', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  waBtnTexto: { color: 'white', fontSize: 11, fontWeight: '500' },
});