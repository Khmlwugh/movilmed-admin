import { useState } from 'react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import Medicamentos from '../components/Medicamentos'
import Examenes from '../components/Examenes'

function Dashboard() {
  const [seccionActiva, setSeccionActiva] = useState('medicamentos')

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-56 bg-white shadow-md flex flex-col p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-1">MedAlert</h2>
        <p className="text-xs text-gray-400 mb-8">Panel de Administración</p>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setSeccionActiva('medicamentos')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
              seccionActiva === 'medicamentos'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💊 Medicamentos
          </button>
          <button
            onClick={() => setSeccionActiva('examenes')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
              seccionActiva === 'examenes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🧪 Exámenes
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="border border-gray-300 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-50 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {seccionActiva === 'medicamentos' ? <Medicamentos /> : <Examenes />}
      </div>
    </div>
  )
}

export default Dashboard