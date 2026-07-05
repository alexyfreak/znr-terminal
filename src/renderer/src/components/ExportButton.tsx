import React, { useState } from 'react';

interface ExportButtonProps {
  onExport: () => Promise<void>;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await onExport();
      setSuccess('Hujjat muvaffaqiyatli saqlandi!');
    } catch (err) {
      setError((err as Error).message || 'Hujjatni saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%', padding: '12px 24px',
          background: loading ? '#94a3b8' : '#22c55e',
          color: '#fff', border: 'none', borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '16px',
        }}
      >
        {loading ? 'Yaratilmoqda...' : 'Hujjatni yaratish va saqlash'}
      </button>
      {success && (
        <p style={{ color: '#16a34a', marginTop: '8px', fontSize: '14px' }}>{success}</p>
      )}
      {error && (
        <p style={{ color: '#dc2626', marginTop: '8px', fontSize: '14px' }}>{error}</p>
      )}
    </div>
  );
};

export default ExportButton;
