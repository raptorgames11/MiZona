import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking
} from 'react-native';

const PROJECT_ID = "MiZona-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function MapaScreen({ busqueda = '' }) {
  const [tiendas, setTiendas] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const resTiendas = await fetch(`${BASE_URL}/tiendas?key=${API_KEY}`);
      const dataTiendas = await resTiendas.json();
      if (dataTiendas.documents) {
        const lista = dataTiendas.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          nombre: doc.fields.nombre.stringValue,
          whatsapp: doc.fields.whatsapp.stringValue,
          lat: doc.fields.lat?.doubleValue || 0,
          lng: doc.fields.lng?.doubleValue || 0,
        }));
        setTiendas(lista);
      }
      const resProductos = await fetch(`${BASE_URL}/productos?key=${API_KEY}`);
      const dataProductos = await resProductos.json();
      if (dataProductos.documents) {
        const lista = dataProductos.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          nombre: doc.fields.nombre.stringValue,
          tienda: doc.fields.tienda.stringValue,
        }));
        setProductos(lista);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const tiendasFiltradas = busqueda
    ? tiendas.filter(t =>
        productos.some(p =>
          p.tienda === t.nombre &&
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
      )
    : tiendas;

  const abrirWhatsApp = (numero) => {
    Linking.openURL(`https://wa.me/${numero}`);
  };

  const abrirEnMapa = (lat, lng) => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>Tiendas cercanas</Text>
        <Text style={s.subtitulo}>{busqueda ? `Buscando: "${busqueda}"` : 'Todas las tiendas'}</Text>
      </View>

      <ScrollView style={s.scroll}>
        <Text style={s.seccion}>{tiendasFiltradas.length} tienda(s) registradas</Text>

        {tiendasFiltradas.length === 0 && (
          <View style={s.centro}>
            <Text style={s.vacio}>No hay tiendas registradas aún</Text>
          </View>
        )}

        {tiendasFiltradas.map(t => (
          <View key={t.id} style={s.tiendaCard}>
            <View style={s.tiendaAvatar}>
              <Text style={s.tiendaAvatarTexto}>{t.nombre.charAt(0)}</Text>
            </View>
            <View style={s.tiendaInfo}>
              <Text style={s.tiendaNombre}>{t.nombre}</Text>
              <Text style={s.tiendaDist}>
                {productos.filter(p => p.tienda === t.nombre).length} productos
              </Text>
            </View>
            <View style={s.botones}>
              <TouchableOpacity style={s.waBtn} onPress={() => abrirWhatsApp(t.whatsapp)}>
                <Text style={s.waBtnTexto}>WA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.mapaBtn} onPress={() => abrirEnMapa(t.lat, t.lng)}>
                <Text style={s.mapaBtnTexto}>Ver mapa</Text>
              </TouchableOpacity>
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
  vacio: { fontSize: 14, color: '#888' },
  seccion: { fontSize: 12, fontWeight: '600', color: '#888', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  tiendaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e0e0e0' },
  tiendaAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#5DCAA5', alignItems: 'center', justifyContent: 'center' },
  tiendaAvatarTexto: { fontSize: 16, fontWeight: '600', color: '#04342C' },
  tiendaInfo: { flex: 1, marginLeft: 10 },
  tiendaNombre: { fontSize: 14, fontWeight: '500', color: '#222' },
  tiendaDist: { fontSize: 12, color: '#888', marginTop: 2 },
  botones: { flexDirection: 'row', gap: 6 },
  waBtn: { backgroundColor: '#1D9E75', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  waBtnTexto: { color: 'white', fontSize: 11, fontWeight: '500' },
  mapaBtn: { backgroundColor: '#E1F5EE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5, borderColor: '#5DCAA5' },
  mapaBtnTexto: { color: '#0F6E56', fontSize: 11, fontWeight: '500' },
});