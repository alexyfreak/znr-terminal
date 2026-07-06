import React from 'react';
import { renderTemplate } from '../../../../src/renderer';

interface PreviewProps {
  template: string;
  values: Record<string, string>;
  onConfirm: () => void;
  onBack: () => void;
}

const Preview: React.FC<PreviewProps> = ({ template, values, onConfirm, onBack }) => {
  const rendered = renderTemplate(template, values);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ color: '#475569', marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Tayyor matn
      </h3>
      <div style={{
        flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
        padding: '24px', overflow: 'auto', fontFamily: '"Times New Roman", serif',
        fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap',
      }}>
        {rendered || 'Matn bo\'sh'}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={onBack} style={{
          padding: '10px 20px', background: '#e2e8f0', color: '#475569',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500,
        }}>
          Ortga
        </button>
        <button onClick={onConfirm} style={{
          padding: '10px 24px', background: '#22c55e', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, flex: 1,
        }}>
          Hujjat yaratish
        </button>
      </div>
    </div>
  );
};

export default Preview;
