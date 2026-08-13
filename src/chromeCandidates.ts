/**
 * Candidate Chrome/Chromium/Edge/Brave executable paths for a platform, in
 * priority order. Pure (platform + env in, paths out) so it can be unit-tested;
 * `findChrome` picks the first one that exists on disk. Covers the installs the
 * previous list missed: per-user Chrome and Edge on Windows, snap Chromium and
 * Edge on Linux, Edge on macOS.
 */
export function chromeCandidates(platform: NodeJS.Platform, env: NodeJS.ProcessEnv): string[] {
  if (platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    ];
  }

  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA;
    const perUser = localAppData
      ? [`${localAppData}\\Google\\Chrome\\Application\\chrome.exe`]
      : [];
    return [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ...perUser,
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    ];
  }

  return [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
    "/usr/bin/microsoft-edge",
    "/usr/bin/brave-browser",
  ];
}
