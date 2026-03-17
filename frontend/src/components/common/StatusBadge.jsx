export default function StatusBadge({ status }) {
  const map = {
    ACTIVE:       'badge-active',
    INACTIVE:     'badge-inactive',
    WAITING:      'badge-waiting',
    WITH_DOCTOR:  'badge-with_doctor',
    COMPLETED:    'badge-completed',
    CANCELLED:    'badge-cancelled',
    SKIPPED:      'bg-purple-50 text-purple-600',
  }
  const label = {
    WITH_DOCTOR: 'With Doctor',
    SKIPPED:     'Skipped',
  }
  return (
    <span className={`badge ${map[status] || 'badge-inactive'}`}>
      {label[status] || status}
    </span>
  )
}