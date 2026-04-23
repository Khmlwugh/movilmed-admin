import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    efectosSecundarios: '',
    presentaciones: ''
  })

  useEffect(() => {
    cargarMedicamentos()
  }, [])

  const cargarMedicamentos = async () => {
    setCargando(true)
    const snapshot = await getDocs(collection(db, 'medicamentos'))
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    setMedicamentos(data)
    setCargando(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      efectosSecundarios: form.efectosSecundarios,
      presentaciones: form.presentaciones.split(',').map(p => p.trim())
    }

    if (editando) {
      await updateDoc(doc(db, 'medicamentos', editando), data)
    } else {
      await addDoc(collection(db, 'medicamentos'), data)
    }

    setForm({ nombre: '', descripcion: '', efectosSecundarios: '', presentaciones: '' })
    setEditando(null)
    setMostrarForm(false)
    cargarMedicamentos()
  }

  const handleEditar = (med) => {
    setEditando(med.id)
    setForm({
      nombre: med.nombre,
      descripcion: med.descripcion,
      efectosSecundarios: med.efectosSecundarios,
      presentaciones: Array.isArray(med.presentaciones)
        ? med.presentaciones.join(', ')
        : med.presentaciones
    })
    setMostrarForm(true)
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este medicamento?')) {
      await deleteDoc(doc(db, 'medicamentos', id))
      cargarMedicamentos()
    }
  }

  const handleCancelar = () => {
    setForm({ nombre: '', descripcion: '', efectosSecundarios: '', presentaciones: '' })
    setEditando(null)
    setMostrarForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Medicamentos</h2>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Agregar medicamento
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editando ? 'Editar medicamento' : 'Nuevo medicamento'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
            <textarea
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 resize-none"
              rows={3}
              required
            />
            <textarea
              placeholder="Efectos secundarios"
              value={form.efectosSecundarios}
              onChange={(e) => setForm({ ...form, efectosSecundarios: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 resize-none"
              rows={2}
              required
            />
            <input
              type="text"
              placeholder="Presentaciones (separadas por coma: 250mg, 500mg, 1000mg)"
              value={form.presentaciones}
              onChange={(e) => setForm({ ...form, presentaciones: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {editando ? 'Guardar cambios' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="border border-gray-300 text-gray-500 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <p className="text-gray-400">Cargando...</p>
      ) : medicamentos.length === 0 ? (
        <p className="text-gray-400">No hay medicamentos registrados.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-left">Efectos secundarios</th>
                <th className="px-6 py-3 text-left">Presentaciones</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicamentos.map(med => (
                <tr key={med.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{med.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs">{med.descripcion}</td>
                  <td className="px-6 py-4 text-gray-500">{med.efectosSecundarios}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {Array.isArray(med.presentaciones)
                      ? med.presentaciones.join(', ')
                      : med.presentaciones}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(med)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(med.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Medicamentos