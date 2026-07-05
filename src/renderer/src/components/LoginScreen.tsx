import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (context: unknown) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginId.trim()) {
      setError("ID bo'sh bo'lishi mumkin emas");
      return;
    }
    if (!pin.trim() || pin.trim().length < 4 || pin.trim().length > 6 || !/^\d+$/.test(pin.trim())) {
      setError('PIN 4-6 raqamdan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.login(loginId, pin);
      if (result.success && result.data) {
        onLogin(result.data);
      } else {
        setError(result.error || 'ID yoki PIN noto\'g\'ri');
      }
    } catch {
      setError('Tizimga kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#f8fafc',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '360px',
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#1e293b', fontSize: '28px' }}>
          Zunoora
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#64748b', fontSize: '14px' }}>
          O'quv hujjatlarini tayyorlash tizimi
        </p>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Login ID (8 symbol)"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1',
              borderRadius: '8px', fontSize: '15px', outline: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="password"
            placeholder="PIN kod"
            value={pin}
            onChange={e => setPin(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1',
              borderRadius: '8px', fontSize: '15px', outline: 'none',
            }}
          />
        </div>
        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#3b82f6',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Kirish...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
