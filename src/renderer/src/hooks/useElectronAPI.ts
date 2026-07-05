export function useElectronAPI(): ElectronAPI {
  const api = window.electronAPI;
  if (!api) {
    throw new Error(
      'electronAPI mavjud emas. Bu dastur Electron ichida ishga tushirilganiga ishonch hosil qiling.'
    );
  }
  return api;
}
