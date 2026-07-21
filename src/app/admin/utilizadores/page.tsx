'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Key, UserX, Eye, EyeOff } from 'lucide-react';
import { DataTable, Pagination } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { FormField } from '@/components/admin/FormField';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'admin' | 'distributor';
  isActive: boolean;
  createdAt: string;
}

interface UserForm {
  name: string;
  email: string;
  company: string;
  role: string;
  password: string;
  isActive: boolean;
}

const emptyForm: UserForm = {
  name: '',
  email: '',
  company: '',
  role: '',
  password: '',
  isActive: true,
};

const PER_PAGE = 10;

export default function UtilizadoresPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(Array.isArray(json) ? json : json.data ?? []);
      }
    } catch {
      toast('error', 'Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function updateField(field: keyof UserForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setShowPassword(false);
    setShowCreate(true);
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      password: '',
      isActive: user.isActive,
    });
    setEditUser(user);
  }

  function openPasswordModal(user: User) {
    setNewPassword('');
    setShowPassword(false);
    setPasswordUser(user);
  }

  async function handleCreate() {
    if (!form.name || !form.email || !form.role || form.password.length < 8) {
      toast('error', 'Preencha todos os campos. A password deve ter pelo menos 8 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast('success', 'Utilizador criado com sucesso');
        setShowCreate(false);
        fetchUsers();
      } else {
        const err = await res.json().catch(() => null);
        toast('error', err?.message ?? 'Erro ao criar utilizador');
      }
    } catch {
      toast('error', 'Erro ao criar utilizador');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          role: form.role,
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        toast('success', 'Utilizador actualizado com sucesso');
        setEditUser(null);
        fetchUsers();
      } else {
        toast('error', 'Erro ao actualizar utilizador');
      }
    } catch {
      toast('error', 'Erro ao actualizar utilizador');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!passwordUser || newPassword.length < 8) {
      toast('error', 'A password deve ter pelo menos 8 caracteres');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${passwordUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        toast('success', 'Password alterada com sucesso');
        setPasswordUser(null);
      } else {
        toast('error', 'Erro ao alterar password');
      }
    } catch {
      toast('error', 'Erro ao alterar password');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deactivateUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (res.ok) {
        toast('success', 'Utilizador desactivado');
        setDeactivateUser(null);
        fetchUsers();
      } else {
        toast('error', 'Erro ao desactivar utilizador');
      }
    } catch {
      toast('error', 'Erro ao desactivar utilizador');
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(users.length / PER_PAGE);
  const paginatedUsers = users.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const columns: Column<User>[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'company', label: 'Empresa' },
    {
      key: 'role',
      label: 'Papel',
      render: (u) => (
        <StatusBadge status={u.role === 'admin' ? 'active' : 'pendente'} />
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (u) => (
        <span className="flex items-center gap-2 text-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {u.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: (u) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => openPasswordModal(u)}
            className="p-1.5 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
            title="Alterar password"
          >
            <Key className="h-4 w-4" />
          </button>
          {u.isActive && (
            <button
              onClick={() => setDeactivateUser(u)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
              title="Desactivar"
            >
              <UserX className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Utilizadores</h1>
          <p className="text-sm text-teka-gray mt-1">Gestao de utilizadores e acessos</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={paginatedUsers} loading={loading} />
      <Pagination page={page} totalPages={totalPages} total={users.length} onPageChange={setPage} />

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Novo Utilizador" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <FormField label="Nome" name="name" value={form.name} onChange={(v) => updateField('name', v)} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={(v) => updateField('email', v)} required />
            <FormField label="Empresa" name="company" value={form.company} onChange={(v) => updateField('company', v)} />
            <FormField
              label="Papel"
              name="role"
              type="select"
              value={form.role}
              onChange={(v) => updateField('role', v)}
              options={[
                { value: 'admin', label: 'Administrador' },
                { value: 'distributor', label: 'Distribuidor' },
              ]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-teka-dark mb-1">
                Password <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
                  placeholder="Minimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Minimo 8 caracteres</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-active"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="create-active" className="text-sm text-teka-dark">Utilizador activo</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Criar Utilizador'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Editar Utilizador" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <FormField label="Nome" name="edit-name" value={form.name} onChange={(v) => updateField('name', v)} required />
            <FormField label="Email" name="edit-email" type="email" value={form.email} onChange={(v) => updateField('email', v)} required />
            <FormField label="Empresa" name="edit-company" value={form.company} onChange={(v) => updateField('company', v)} />
            <FormField
              label="Papel"
              name="edit-role"
              type="select"
              value={form.role}
              onChange={(v) => updateField('role', v)}
              options={[
                { value: 'admin', label: 'Administrador' },
                { value: 'distributor', label: 'Distribuidor' },
              ]}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="edit-active" className="text-sm text-teka-dark">Utilizador activo</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">
              Cancelar
            </button>
            <button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {passwordUser && (
        <Modal title={`Alterar Password - ${passwordUser.name}`} onClose={() => setPasswordUser(null)}>
          <div>
            <label className="block text-sm font-medium text-teka-dark mb-1">Nova Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
                placeholder="Minimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Minimo 8 caracteres</p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setPasswordUser(null)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">
              Cancelar
            </button>
            <button onClick={handleChangePassword} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Alterar Password'}
            </button>
          </div>
        </Modal>
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        open={!!deactivateUser}
        title="Desactivar Utilizador"
        message={`Tem a certeza que deseja desactivar o utilizador "${deactivateUser?.name}"? O utilizador deixara de ter acesso ao sistema.`}
        confirmText="Desactivar"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateUser(null)}
      />
    </div>
  );
}

/* ---- Inline Modal ---- */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-heading font-semibold text-teka-dark mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
