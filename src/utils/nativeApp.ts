export async function setupNativeApp(): Promise<void> {
  try {
    const mod = await import('@capacitor/app');
    await mod.App.addListener('appStateChange', () => {});
  } catch {
    // Browser/PWA mode: Capacitor App plugin is optional at runtime.
  }
}
