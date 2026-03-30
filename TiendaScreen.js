import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { guardarProducto, obtenerProductos, eliminarProducto, actualizarStock } from './firebase';

export default function TiendaScreen({ tienda, onCerrar }) {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const datos = await obtenerProductos();
      const misTienda = datos.filter(p => p.tienda === tienda?.nombre);
      setProductos(misTienda);
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar');
    }
    setCargando(false);
  };

  const agregar = async () => {
    if (!nombre || !precio) {
      Alert.alert('Error', 'Completa nombre y precio');
      return;
    }
    try {
      await guardarProducto({ nombre, precio, stock, tienda: tienda?.nombre });
      Alert.alert('Listo', 'Producto publicado');
      setNombre('');
      setPrecio('');
      setStock(true);
      cargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  const toggleStock = async (id, stockActual) => {
    try {
      await actualizarStock(id, !stockActual);
      cargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const borrar = async (id) => {
    try {
      await eliminarProducto(id);
      cargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <View>
          <Text style={s.titulo}>Mi Tienda</Text>
          <Text style={s.subtitulo}>{tienda ? tienda.nombre : 'Panel'}</Text>
        </View>
        <TouchableOpacity style={s.cerrarBtn} onPress={onCerrar}>
          <Text style={s.cerrarTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll}>
        <View style={s.card}>
          <Text style={s.cardTitulo}>Agregar producto nuevo</Text>

          <Text style={s.label}>Nombre del producto</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: Arroz 1kg"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={s.label}>Precio (Bs.)</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: 12.50"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
          />

          <Text style={s.label}>Disponibilidad</Text>
          <View style={s.stockRow}>
            <TouchableOpacity
              style={[s.stockBtn, stock && s.stockBtnActivo]}
              onPress={() => setStock(true)}
            >
              <Text style={[s.stockBtnTexto, stock && s.stockBtnTextoActivo]}>En stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.stockBtn, !stock && s.stockBtnRojo]}
              onPress={() => setStock(false)}
            >
              <Text style={[s.stockBtnTexto, !stock && s.stockBtnTextoRojo]}>Sin stock</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.agregarBtn} onPress={agregar}>
            <Text style={s.agregarBtnTexto}>Publicar producto</Text>
          </TouchableOpacity>
        </View>

        <View style={s.recargarRow}>
          <Text style={s.seccion}>Mis productos ({productos.length})</Text>
          <TouchableOpacity style={s.recargarBtn} onPress={cargar}>
            <Text style={s.recargarTexto}>Recargar</Text>
          </TouchableOpacity>
        </View>

        {cargando && (
          <View style={s.centro}>
            <Text style={s.cargandoTexto}>Cargando...</Text>
          </View>
        )}

        {!cargando && productos.length === 0 && (
          <View style={s.centro}>
            <Text style={s.cargandoTexto}>No hay productos aún</Text>
          </View>
        )}

        {productos.map(p => (
          <View key={p.id} style={s.productoCard}>
            <View style={s.productoInfo}>
              <Text style={s.productoNombre}>{p.nombre}</Text>
              <Text style={s.productoPrecio}>Bs. {p.precio}</Text>
            </View>
            <View style={s.productoAcciones}>
              <TouchableOpacity
                style={[s.badge, p.stock ? s.badgeVerde : s.badgeRojo]}
                onPress={() => toggleStock(p.id, p.stock)}
              >
                <Text style={[s.badgeTexto, p.stock ? s.badgeTextoVerde : s.badgeTextoRojo]}>
                  {p.stock ? 'En stock' : 'Sin stock'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.eliminarBtn} onPress={() => borrar(p.id)}>
                <Text style={s.eliminarTexto}>Eliminar</Text>
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
  topbar: { backgroundColor: '#1D9E75', padding: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 20, fontWeight: '600', color: 'white' },
  subtitulo: { fontSize: 12, color: '#9FE1CB', marginTop: 2 },
  cerrarBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  cerrarTexto: { color: 'white', fontSize: 12 },
  scroll: { flex: 1 },
  centro: { alignItems: 'center', padding: 32 },
  cargandoTexto: { fontSize: 14, color: '#888' },
  card: { backgroundColor: 'white', margin: 12, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#e0e0e0' },
  cardTitulo: { fontSize: 15, fontWeight: '500', color: '#222', marginBottom: 12 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, fontSize: 14, color: '#222', borderWidth: 0.5, borderColor: '#e0e0e0' },
  stockRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  stockBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#f5f5f5', borderWidth: 0.5, borderColor: '#e0e0e0' },
  stockBtnActivo: { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5' },
  stockBtnRojo: { backgroundColor: '#FCEBEB', borderColor: '#F09595' },
  stockBtnTexto: { fontSize: 13, color: '#888' },
  stockBtnTextoActivo: { color: '#085041', fontWeight: '500' },
  stockBtnTextoRojo: { color: '#A32D2D', fontWeight: '500' },
  agregarBtn: { backgroundColor: '#1D9E75', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 16 },
  agregarBtnTexto: { color: 'white', fontSize: 14, fontWeight: '500' },
  recargarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  seccion: { fontSize: 12, fontWeight: '600', color: '#888', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  recargarBtn: { backgroundColor: '#E1F5EE', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  recargarTexto: { fontSize: 12, color: '#0F6E56' },
  productoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e0e0e0' },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 14, fontWeight: '500', color: '#222' },
  productoPrecio: { fontSize: 12, color: '#1D9E75', marginTop: 2 },
  productoAcciones: { alignItems: 'flex-end', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeVerde: { backgroundColor: '#E1F5EE' },
  badgeRojo: { backgroundColor: '#FCEBEB' },
  badgeTexto: { fontSize: 11 },
  badgeTextoVerde: { color: '#085041' },
  badgeTextoRojo: { color: '#A32D2D' },
  eliminarBtn: { paddingHorizontal: 8, paddingVertical: 3 },
  eliminarTexto: { fontSize: 11, color: '#A32D2D' },
});