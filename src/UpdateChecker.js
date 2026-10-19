export async function checkForUpdates() {
  try {
    // رابط GitLab Pages الخاص بك (تم تحديثه تلقائياً)
    const gitlabUrl = "https://imadeddiinemenouer.gitlab.io/Atheer-app/version.json";
    
    const res = await fetch(`${gitlabUrl}?t=${Date.now()}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    const localVersion = localStorage.getItem('atheer_web_version') || '0';
    
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
  window.location.reload();
}