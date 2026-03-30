const PROJECT_ID = "mialmacen-2d966";
const API_KEY = "AIzaSyDjSJy31lnxTJt9zsyl1IKPrqUQTKJNWU8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export const guardarProducto = async (producto) => {
  const res = await fetch(`${BASE_URL}/productos?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        nombre: { stringValue: producto.nombre },
        precio: { stringValue: producto.precio },
        stock: { booleanValue: producto.stock },
        tienda: { stringValue: producto.tienda },
      }
    })
  });
  return res.json();
};

export const obtenerProductos = async () => {
  const res = await fetch(`${BASE_URL}/productos?key=${API_KEY}`);
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map(doc => ({
    id: doc.name.split('/').pop(),
    nombre: doc.fields.nombre.stringValue,
    precio: doc.fields.precio.stringValue,
    stock: doc.fields.stock.booleanValue,
    tienda: doc.fields.tienda.stringValue,
  }));
};

export const eliminarProducto = async (id) => {
  await fetch(`${BASE_URL}/productos/${id}?key=${API_KEY}`, {
    method: 'DELETE'
  });
};

export const actualizarStock = async (id, stock) => {
  await fetch(`${BASE_URL}/productos/${id}?key=${API_KEY}&updateMask.fieldPaths=stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: { stock: { booleanValue: stock } }
    })
  });
};