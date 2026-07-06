import React from 'react';

interface SidebarProps {
  templates: { type: string; label: string }[];
  selectedId: string | null;
  onSelect: (type: string) => void;
  userName: string;
  schoolName: string;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ templates, selectedId, onSelect, userName, schoolName, role }) => {
  return (
    <nav style={{
      width: 240, background: '#1e293b', color: '#fff',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Zunoora</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>
          Xush kelibsiz, {userName || 'Foydalanuvchi'}
        </p>
        <p style={{ fontSize: '11px', color: '#64748b' }}>{schoolName}</p>
        <span style={{
          display: 'inline-block', marginTop: '6px', padding: '2px 8px',
          background: role === 'director' ? '#7c3aed' : '#2563eb',
          borderRadius: '10px', fontSize: '11px', fontWeight: 500,
        }}>
          {role === 'director' ? 'Direktor' : "O'qituvchi"}
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        <p style={{ padding: '8px 16px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Hujjat turlari
        </p>
        {templates.length === 0 && (
          <p style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
            Shablonlar yuklanmoqda...
          </p>
        )}
        {templates.map(tpl => (
          <div
            key={tpl.type}
            onClick={() => onSelect(tpl.type)}
            style={{
              padding: '10px 16px', cursor: 'pointer', fontSize: '13px',
              background: selectedId === tpl.type ? '#334155' : 'transparent',
              borderLeft: selectedId === tpl.type ? '3px solid #3b82f6' : '3px solid transparent',
              color: selectedId === tpl.type ? '#fff' : '#cbd5e1',
            }}
          >
            {tpl.label}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
