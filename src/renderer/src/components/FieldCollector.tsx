import React, { useState, useMemo } from 'react';

export interface FieldSchema {
  required: string[];
  optional: string[];
  displayNames: Record<string, string>;
  fieldOrder: string[];
  complexSteps: Record<string, { header: string; fields: string[] }[]> | null;
}

interface AutoFillContext {
  school?: { name: string };
  director?: { full_name: string };
  user?: { full_name: string; position?: string; phone?: string; subject?: string };
  role: string;
  classes?: { name: string; academic_year: string }[];
}

interface FieldCollectorProps {
  schema: FieldSchema;
  shablonType: string;
  context: AutoFillContext;
  onComplete: (values: Record<string, string>) => void;
  onBack: () => void;
}

const FieldCollector: React.FC<FieldCollectorProps> = ({ schema, shablonType, context, onComplete, onBack }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allFields = useMemo(() => [...schema.required, ...schema.optional], [schema]);
  const steps = schema.complexSteps?.[shablonType];

  const getAutoFill = (field: string): string | null => {
    const map: Record<string, string | null | undefined> = {
      school: context.school?.name,
      director_name: context.director?.full_name,
      recipient_name: context.director?.full_name,
      teacher_name: context.user?.full_name,
      sender_name: context.user?.full_name,
      employee_name: context.user?.full_name,
      sender_position: context.user?.position,
      position: context.user?.position,
      class_name: context.classes?.[0]?.name,
      academic_year: context.classes?.[0]?.academic_year,
      teacher_phone: context.user?.phone,
    };
    if (context.role === 'teacher') {
      map.subject = context.user?.subject;
    }
    return map[field] ?? null;
  };

  const isDateField = (field: string): boolean =>
    /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(field);

  const isNumericField = (field: string): boolean =>
    /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(field);

  const fieldDefaults: Record<string, string> = {
    date: new Date().toLocaleDateString('ru-RU'),
  };

  const getSortedFields = (fields: string[]): string[] => {
    const ordered = fields.filter(f => schema.fieldOrder.includes(f));
    ordered.sort((a, b) => schema.fieldOrder.indexOf(a) - schema.fieldOrder.indexOf(b));
    const remaining = fields.filter(f => !schema.fieldOrder.includes(f));
    return [...ordered, ...remaining];
  };

  const visibleFields = useMemo(() => {
    if (steps && currentStep < steps.length) {
      return steps[currentStep].fields;
    }
    return getSortedFields(allFields);
  }, [steps, currentStep, allFields, schema.fieldOrder]);

  const currentHeader = steps && currentStep < steps.length ? steps[currentStep].header : null;

  const validateField = (field: string, value: string): string | null => {
    if (schema.required.includes(field) && !value.trim() && !getAutoFill(field)) {
      return `${schema.displayNames[field] || field} bo'sh bo'lishi mumkin emas`;
    }
    if (value.trim() && isDateField(field) && !/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      return 'Sana KK.OO.YYYY formatida bo\'lishi kerak';
    }
    if (value.trim() && isNumericField(field) && !/^\d+$/.test(value.trim())) {
      return 'Faqat raqam kiritilishi mumkin';
    }
    return null;
  };

  const handleFieldChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const isStepComplete = (): boolean => {
    const fieldsForStep = steps && currentStep < steps.length
      ? steps[currentStep].fields
      : schema.required;
    return fieldsForStep.every(f =>
      !schema.required.includes(f) || values[f]?.trim() || getAutoFill(f)
    );
  };

  const handleNext = () => {
    if (!steps) {
      const requiredErrors = schema.required.filter(f => {
        const v = values[f] || getAutoFill(f) || '';
        return !v.trim();
      });
      if (requiredErrors.length > 0) {
        const newErrors: Record<string, string> = {};
        requiredErrors.forEach(f => {
          newErrors[f] = `${schema.displayNames[f] || f} bo'sh bo'lishi mumkin emas`;
        });
        setErrors(newErrors);
        return;
      }
      const finalValues = { ...values };
      allFields.forEach(f => {
        if (!finalValues[f]) {
          const auto = getAutoFill(f);
          if (auto) finalValues[f] = auto;
          else if (fieldDefaults[f]) finalValues[f] = fieldDefaults[f];
        }
      });
      onComplete(finalValues);
      return;
    }

    if (!isStepComplete()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      const finalValues = { ...values };
      allFields.forEach(f => {
        if (!finalValues[f]) {
          const auto = getAutoFill(f);
          if (auto) finalValues[f] = auto;
          else if (fieldDefaults[f]) finalValues[f] = fieldDefaults[f];
        }
      });
      onComplete(finalValues);
    }
  };

  const renderFieldInput = (field: string) => {
    const auto = getAutoFill(field);
    const defaultValue = auto || fieldDefaults[field] || '';
    const isRequired = schema.required.includes(field);
    const label = schema.displayNames[field] || field;
    const hasError = !!errors[field];

    return (
      <div key={field} style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#334155' }}>
          {label}
          {isRequired && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
        <input
          type="text"
          placeholder={defaultValue || (isRequired ? '' : 'Ixtiyoriy')}
          defaultValue={defaultValue}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          style={{
            width: '100%', padding: '8px 12px',
            border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
            borderRadius: '6px', fontSize: '14px', outline: 'none',
          }}
        />
        {auto && (
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Avtomatik: {auto}
          </span>
        )}
        {hasError && (
          <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', display: 'block' }}>
            {errors[field]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {currentHeader && (
        <h3 style={{
          color: '#475569', marginBottom: '20px', fontSize: '16px',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {currentHeader}
        </h3>
      )}
      {steps && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: i <= currentStep ? '#3b82f6' : '#e2e8f0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}
      {!currentHeader && (
        <h3 style={{ color: '#475569', marginBottom: '20px', fontSize: '24px', fontWeight: 600 }}>
          Ma'lumotlarni to'ldiring
        </h3>
      )}
      {visibleFields.map(renderFieldInput)}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={onBack} style={{
          padding: '10px 20px', background: '#e2e8f0', color: '#475569',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500,
        }}>
          Ortga
        </button>
        <button onClick={handleNext} style={{
          padding: '10px 24px', background: '#3b82f6', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, flex: 1,
        }}>
          {steps && currentStep < steps.length - 1 ? 'Keyingi' : 'Tayyor'}
        </button>
      </div>
    </div>
  );
};

export default FieldCollector;
