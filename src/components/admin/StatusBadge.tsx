const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  published: 'bg-green-100 text-green-700',
  entregue: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
  enviada: 'bg-blue-100 text-blue-700',
  confirmada: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  published: 'Publicado',
  draft: 'Rascunho',
  archived: 'Arquivado',
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  enviada: 'Enviada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-500';
  const label = statusLabels[status] || status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
