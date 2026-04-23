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

function Examenes() {
  const [examenes, setExamenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    unidad: '',
    floor: '',
    ceiling: ''
  })

  useEffect(() => {
    cargarExamenes()
  }, [])

  const cargarExamenes = async () => {
    setCargando(true)
    const snapshot = await getDocs(collection(db, 'examenes'))
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    setExamenes(data)
    setCargando(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      unidad: form.unidad,
      floor: parseFloat(form.floor),
      ceiling: parseFloat(form.ceiling)
    }

    if (editando) {
      await updateDoc(doc(db, 'examenes', editando), data)
    } else {
      await addDoc(collection(db, 'examenes'), data)
    }

    setForm({ nombre: '', descripcion: '', unidad: '', floor: '', ceiling: '' })
    setEditando(null)
    setMostrarForm(false)
    cargarExamenes()
  }

  const handleEditar = (examen) => {
    setEditando(examen.id)
    setForm({
      nombre: examen.nombre,
      descripcion: examen.descripcion,
      unidad: examen.unidad,
      floor: examen.floor.toString(),
      ceiling: examen.ceiling.toString()
    })
    setMostrarForm(true)
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este examen?')) {
      await deleteDoc(doc(db, 'examenes', id))
      cargarExamenes()
    }
  }

  const handleCancelar = () => {
    setForm({ nombre: '', descripcion: '', unidad: '', floor: '', ceiling: '' })
    setEditando(null)
    setMostrarForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Exámenes</h2>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Agregar examen
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editando ? 'Editar examen' : 'Nuevo examen'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nombre (ej: Hemoglobina)"
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
            <input
              type="text"
              placeholder="Unidad (ej: g/dL)"
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Valor mínimo (floor)"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 flex-1"
                step="0.1"
                required
              />
              <input
                type="number"
                placeholder="Valor máximo (ceiling)"
                value={form.ceiling}
                onChange={(e) => setForm({ ...form, ceiling: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 flex-1"
                step="0.1"
                required
              />
            </div>
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
      ) : examenes.length === 0 ? (
        <p className="text-gray-400">No hay exámenes registrados.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-left">Unidad</th>
                <th className="px-6 py-3 text-left">Rango normal</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {examenes.map(examen => (
                <tr key={examen.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{examen.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs">{examen.descripcion}</td>
                  <td className="px-6 py-4 text-gray-500">{examen.unidad}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {examen.floor} - {examen.ceiling} {examen.unidad}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(examen)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(examen.id)}
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

export default Examenes