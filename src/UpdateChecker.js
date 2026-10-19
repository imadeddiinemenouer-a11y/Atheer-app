export async function checkForUpdates() {
  try {
    // جلب ملف الإصدار من موقعك مع منع التخزين المؤقت
    const res = await fetch(`https://imadeddiinemenouer-a11y.github.io/Atheer-app/version.json?t=${Date.now()}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    // قراءة الإصدار المحفوظ داخل التطبيق
    const localVersion = localStorage.getItem('atheer_web_version') || '0';
    
    // إذا كان رقم الإصدار في GitHub مختلفاً عن المحفوظ، فهناك تحديث
    if (data.version && String(data.version) !== String(localVersion)) {
      return data.version;
    }
  } catch(e) {
    console.log('Update check failed', e);
  }
  return null;
}

export function applyUpdate(newVersion) {
  localStorage.setItem('atheer_web_version', String(newVersion));
  window.location.reload(); // إعادة تحميل التطبيق لسحب الواجهة الجديدة
}