import TiendaScreen from './TiendaScreen';
import MapaScreen from './MapaScreen';
import LoginScreen from './LoginScreen';
import TaxisScreen from './TaxisScreen';
import TrufisScreen from './TrufisScreen';
import ChoferScreen from './ChoferScreen';
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Linking, SafeAreaView
} from 'react-native';

const PROJECT_ID = "mialmacen-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [pantalla, setPantalla] = useState('inicio');
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [tiendaActual, setTiendaActual] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const resTiendas = await fetch(`${BASE_URL}/tiendas?key=${API_KEY}`);
      const dataTiendas = await resTiendas.json();
      let tiendasLista = [];
      if (dataTiendas.documents) {
        tiendasLista = dataTiendas.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          nombre: doc.fields.nombre?.stringValue || '',
          whatsapp: doc.fields.whatsapp?.stringValue || '',
          membresia: doc.fields.membresia?.stringValue || 'ninguna',
        }));
        tiendasLista.sort((a, b) => {
          const orden = { premium: 0, basica: 1, ninguna: 2 };
          return (orden[a.membresia] ?? 2) - (orden[b.membresia] ?? 2);
        });
        setTiendas(tiendasLista);
      }
      const resProductos = await fetch(`${BASE_URL}/productos?key=${API_KEY}`);
      const dataProductos = await resProductos.json();
      if (dataProductos.documents) {
        const lista = dataProductos.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          nombre: doc.fields.nombre?.stringValue || '',
          precio: doc.fields.precio?.stringValue || '',
          stock: doc.fields.stock?.booleanValue ?? true,
          tienda: doc.fields.tienda?.stringValue || '',
          membresia: tiendasLista.find(t => t.nombre === doc.fields.tienda?.stringValue)?.membresia || 'ninguna',
        }));
        lista.sort((a, b) => {
          const orden = { premium: 0, basica: 1, ninguna: 2 };
          return (orden[a.membresia] ?? 2) - (orden[b.membresia] ?? 2);
        });
        setProductos(lista);
      }
    } catch (e) {}
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirWhatsApp = (numero) => Linking.openURL(`https://wa.me/${numero}`);

  const getBadgeProducto = (membresia) => {
    if (membresia === 'premium') return { texto: '🌟 Premium', bg: '#EF9F27', color: '#412402' };
    if (membresia === 'basica') return { texto: '⭐ Destacado', bg: '#5DCAA5', color: '#04342C' };
    return null;
  };

  const Navbar = ({ actual }) => (
    <View style={s.navbar}>
      <TouchableOpacity style={s.navItem} onPress={() => { setPantalla('inicio'); cargarDatos(); }}>
        <Text style={s.navIcon}>🏠</Text>
        <Text style={[s.navLabel, actual === 'inicio' && s.navActivo]}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => setPantalla('mapa')}>
        <Text style={s.navIcon}>🗺️</Text>
        <Text style={[s.navLabel, actual === 'mapa' && s.navActivo]}>Mapa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => setPantalla('taxis')}>
        <Text style={s.navIcon}>🚕</Text>
        <Text style={[s.navLabel, actual === 'taxis' && s.navActivo]}>Taxis</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => setPantalla('trufis')}>
        <Text style={s.navIcon}>🚗</Text>
        <Text style={[s.navLabel, actual === 'trufis' && s.navActivo]}>Trufis</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => setPantalla('chofer')}>
        <Text style={s.navIcon}>🚖</Text>
        <Text style={[s.navLabel, actual === 'chofer' && s.navActivo]}>Chofer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => setPantalla('tienda')}>
        <Text style={s.navIcon}>🏪</Text>
        <Text style={[s.navLabel, actual === 'tienda' && s.navActivo]}>Tienda</Text>
      </TouchableOpacity>
    </View>
  );

  if (pantalla === 'mapa') return <View style={{ flex: 1 }}><MapaScreen busqueda={busqueda} /><Navbar actual="mapa" /></View>;
  if (pantalla === 'taxis') return <View style={{ flex: 1 }}><TaxisScreen /><Navbar actual="taxis" /></View>;
  if (pantalla === 'trufis') return <View style={{ flex: 1 }}><TrufisScreen /><Navbar actual="trufis" /></View>;
  if (pantalla === 'chofer') return <View style={{ flex: 1 }}><ChoferScreen /><Navbar actual="chofer" /></View>;
  if (pantalla === 'tienda') {
    return (
      <View style={{ flex: 1 }}>
        {tiendaActual ? (
          <TiendaScreen tienda={tiendaActual} onCerrar={() => setTiendaActual(null)} />
        ) : (
          <LoginScreen onLogin={(t) => setTiendaActual(t)} />
        )}
        <Navbar actual="tienda" />
      </View>
    );
  }
  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <Text style={s.titulo}>MiZona</Text>
        <Text style={s.subtitulo}>Encuentra productos cerca de ti</Text>
        <TextInput
          style={s.buscador}
          placeholder="Buscar producto..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView style={s.scroll}>
        <Text style={s.seccion}>Productos ({productosFiltrados.length})</Text>
        {productosFiltrados.length === 0 && <View style={s.centro}><Text style={s.vacio}>No hay productos aún</Text></View>}
        {productosFiltrados.map(p => {
          const badge = getBadgeProducto(p.membresia);
          return (
            <View key={p.id} style={[s.productoCard, p.membresia === 'premium' && s.productoCardPremium, p.membresia === 'basica' && s.productoCardBasica]}>
              {badge && (
                <View style={[s.badgeDestacado, { backgroundColor: badge.bg }]}>
                  <Text style={[s.badgeDestacadoTexto, { color: badge.color }]}>{badge.texto}</Text>
                </View>
              )}
              <View style={s.productoInfo}>
                <Text style={s.productoNombre}>{p.nombre}</Text>
                <Text style={s.productoTienda}>{p.tienda}</Text>
              </View>
              <View style={s.productoDerecha}>
                <Text style={s.productoPrecio}>Bs. {p.precio}</Text>
                <View style={[s.badge, p.stock ? s.badgeVerde : s.badgeRojo]}>
                  <Text style={[s.badgeTexto, p.stock ? s.badgeTextoVerde : s.badgeTextoRojo]}>
                    {p.stock ? 'En stock' : 'Sin stock'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={s.seccion}>Tiendas ({tiendas.length})</Text>
        {tiendas.map(t => (
          <View key={t.id} style={[s.tiendaCard, t.membresia === 'premium' && s.tiendaCardPremium, t.membresia === 'basica' && s.tiendaCardBasica]}>
            <View style={s.tiendaAvatar}>
              <Text style={s.tiendaAvatarTexto}>{t.nombre.charAt(0)}</Text>
            </View>
            <View style={s.tiendaInfo}>
              <Text style={s.tiendaNombre}>
                {t.nombre} {t.membresia === 'premium' ? '🌟' : t.membresia === 'basica' ? '⭐' : ''}
              </Text>
              <Text style={s.tiendaDist}>
                {productos.filter(p => p.tienda === t.nombre).length} productos
              </Text>
            </View>
            <TouchableOpacity style={s.waBtn} onPress={() => abrirWhatsApp(t.whatsapp)}>
              <Text style={s.waBtnTexto}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Navbar actual="inicio" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topbar: { backgroundColor: '#1D9E75', padding: 16, paddingTop: 40 },
  titulo: { fontSize: 20, fontWeight: '600', color: 'white' },
  subtitulo: { fontSize: 12, color: '#9FE1CB', marginTop: 2 },
  buscador: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 10, marginTop: 10, color: 'white', fontSize: 14 },
  scroll: { flex: 1 },
  centro: { alignItems: 'center', padding: 32 },
  vacio: { fontSize: 14, color: '#888' },
  seccion: { fontSize: 12, fontWeight: '600', color: '#888', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  productoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e0e0e0' },
  productoCardPremium: { borderColor: '#EF9F27', borderWidth: 1.5, backgroundColor: '#FAEEDA' },
  productoCardBasica: { borderColor: '#5DCAA5', borderWidth: 1.5, backgroundColor: '#E1F5EE' },
  badgeDestacado: { position: 'absolute', top: -8, left: 12, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeDestacadoTexto: { fontSize: 10, fontWeight: '600' },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 14, fontWeight: '500', color: '#222' },
  productoTienda: { fontSize: 12, color: '#888', marginTop: 2 },
  productoDerecha: { alignItems: 'flex-end' },
  productoPrecio: { fontSize: 14, fontWeight: '600', color: '#1D9E75' },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeVerde: { backgroundColor: '#E1F5EE' },
  badgeRojo: { backgroundColor: '#FCEBEB' },
  badgeTexto: { fontSize: 11 },
  badgeTextoVerde: { color: '#085041' },
  badgeTextoRojo: { color: '#A32D2D' },
  tiendaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e0e0e0' },
  tiendaCardPremium: { borderColor: '#EF9F27', borderWidth: 1.5, backgroundColor: '#FAEEDA' },
  tiendaCardBasica: { borderColor: '#5DCAA5', borderWidth: 1.5, backgroundColor: '#E1F5EE' },
  tiendaAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#5DCAA5', alignItems: 'center', justifyContent: 'center' },
  tiendaAvatarTexto: { fontSize: 16, fontWeight: '600', color: '#04342C' },
  tiendaInfo: { flex: 1, marginLeft: 10 },
  tiendaNombre: { fontSize: 14, fontWeight: '500', color: '#222' },
  tiendaDist: { fontSize: 12, color: '#888', marginTop: 2 },
  waBtn: { backgroundColor: '#1D9E75', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  waBtnTexto: { color: 'white', fontSize: 12, fontWeight: '500' },
  navbar: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: '#e0e0e0', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 16 },
  navLabel: { fontSize: 9, color: '#888', marginTop: 2 },
  navActivo: { color: '#1D9E75', fontWeight: '500' },
});