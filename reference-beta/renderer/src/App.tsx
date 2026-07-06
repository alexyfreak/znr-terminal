import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ContentPanel from './components/ContentPanel';

type AppView = 'login' | 'main';

interface UserContextData {
  user?: { full_name: string; position?: string; phone?: string; subject?: string };
  school?: { name: string; address?: string; phone?: string };
  director?: { full_name: string };
  teachers?: { full_name: string }[];
  classes?: { name: string; academic_year: string }[];
  role: string;
}

interface ExportData {
  template: string;
  values: Record<string, string>;
  shablonType: string;
  userName: string;
  school?: { name: string; address?: string | null; phone?: string | null };
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [userContext, setUserContext] = useState<UserContextData | null>(null);
  const [templates, setTemplates] = useState<{ type: string; label: string; description: string | null; teacher_visible: boolean; schema: { required: string[]; optional: string[] }; template: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<{ type: string; label: string; description: string | null; teacher_visible: boolean; schema: { required: string[]; optional: string[] }; template: string } | null>(null);

  const handleLogin = useCallback(async (context: unknown) => {
    setUserContext(context as UserContextData);
    try {
      const result = await window.electronAPI.loadTemplates();
      if (result.success && result.data) {
        setTemplates(result.data as typeof templates);
      }
    } catch {
      // silent
    }
    setView('main');
  }, []);

  const handleTemplateSelect = useCallback((type: string) => {
    const tpl = templates.find(t => t.type === type);
    setSelectedTemplate(tpl || null);
  }, [templates]);

  const handleGenerate = useCallback(async (data: ExportData): Promise<string> => {
    const result = await window.electronAPI.renderAndGenerate(data);
    if (result.success && result.data) {
      return result.data as string;
    }
    throw new Error(result.error || 'Hujjat yaratishda xatolik');
  }, []);

  if (view === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const selectedItem = selectedTemplate ? {
    type: selectedTemplate.type,
    name: selectedTemplate.label,
    template: selectedTemplate.template,
    schema: selectedTemplate.schema,
  } : null;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        templates={templates.map(t => ({ type: t.type, label: t.label, description: t.description }))}
        selectedId={selectedTemplate?.type || null}
        onSelect={handleTemplateSelect}
        userName={userContext?.user?.full_name || ''}
        schoolName={userContext?.school?.name || ''}
        role={userContext?.role || ''}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ContentPanel
          selectedTemplate={selectedItem}
          user={{
            full_name: userContext?.user?.full_name || '',
            position: userContext?.user?.position,
            phone: userContext?.user?.phone,
            subject: userContext?.user?.subject,
            role: userContext?.role || '',
          }}
          school={userContext?.school || null}
          classes={userContext?.classes || []}
          onGenerate={handleGenerate}
        />
      </main>
    </div>
  );
};

export default App;
