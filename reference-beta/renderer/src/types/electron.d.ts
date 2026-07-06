export interface UserContextData {
  user?: { full_name: string; position?: string; phone?: string; subject?: string };
  school?: { name: string; address?: string; phone?: string };
  director?: { full_name: string };
  teachers?: { full_name: string }[];
  classes?: { name: string; academic_year: string }[];
  role: string;
}

export interface ShablonData {
  id: string;
  type: string;
  label: string;
  description: string | null;
  teacher_visible: boolean;
  schema: { required: string[]; optional: string[] };
  template: string;
}

export interface ElectronAPI {
  login: (loginId: string, pin: string) => Promise<{ success: boolean; data?: UserContextData; error?: string }>;
  loadTemplates: () => Promise<{ success: boolean; data?: ShablonData[]; error?: string }>;
  getTemplateSchema: (type: string) => Promise<{
    success: boolean;
    data?: {
      required: string[];
      optional: string[];
      displayNames: Record<string, string>;
      fieldOrder: string[];
      complexSteps: Record<string, { header: string; fields: string[] }[]> | null;
    };
    error?: string;
  }>;
  renderAndGenerate: (data: {
    template: string;
    values: Record<string, string>;
    shablonType: string;
    userName: string;
    school?: { name: string; address?: string; phone?: string };
  }) => Promise<{ success: boolean; data?: string; error?: string }>;
  showSaveDialog: (defaultName: string) => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
