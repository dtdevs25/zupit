import React from 'react';
import { Users, ShieldAlert, Trash2, Edit } from 'lucide-react';

export function UsersManagement() {
  // Mock data for initial layout
  const users = [
    { id: '1', name: 'Daniel Silva', email: 'daniel@example.com', plan: 'Master', status: 'Ativo' },
    { id: '2', name: 'Maria Souza', email: 'maria@example.com', plan: 'Básico', status: 'Ativo' },
    { id: '3', name: 'João Pedro', email: 'joao@example.com', plan: 'Free', status: 'Bloqueado' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Gestão de Usuários</h1>
          <p className="text-purple-300 mt-1">Gerencie cadastros, acessos e bloqueios.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-colors">
          + Adicionar Usuário
        </button>
      </header>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-900/30 text-purple-300 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Plano</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-purple-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-white">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-purple-300">{user.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.plan === 'Master' ? 'bg-yellow-400/20 text-yellow-400' :
                    user.plan === 'Básico' ? 'bg-blue-400/20 text-blue-400' :
                    'bg-gray-400/20 text-gray-400'
                  }`}>
                    {user.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-1 text-sm font-semibold ${
                    user.status === 'Ativo' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${user.status === 'Ativo' ? 'bg-green-400' : 'bg-red-400'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors" title="Bloquear">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
