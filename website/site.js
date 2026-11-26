/* 最新 macOS 安装包解析，不依赖外部库。 */
(() => {
  // 动效直接叠加于真实遥控截图的触控板区域，不修改截图、不发送远控指令。
  const demo = document.getElementById('gesture-demo');
  const tabs = Array.from(document.querySelectorAll('[data-gesture]'));
  const descriptions = { move: '单指轻移，光标随之移动。', tap: '轻点一下，完成鼠标点击。', scroll: '双指上下滑动，页面随之滚动。' };
  const activate = (tab) => {
    tabs.forEach((item) => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    demo.dataset.mode = tab.dataset.gesture;
    demo.setAttribute('aria-labelledby', tab.id);
    document.querySelector('.gesture-description').textContent = descriptions[tab.dataset.gesture];
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); activate(next); next.focus(); }
    });
  });
  const motion = document.querySelector('.motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) { motion.hidden = true; }
  motion.addEventListener('click', () => {
    const paused = demo.classList.toggle('is-paused');
    motion.setAttribute('aria-pressed', String(paused));
    motion.textContent = paused ? '继续演示' : '暂停演示';
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  // 按平台筛选，避免未来 iOS 发布被误认为最新 Mac 安装包。
  fetch('https://api.github.com/repos/yj-labs/mac_remote/releases?per_page=30', {
    headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal,
  }).then((response) => {
    if (!response.ok) throw new Error('无法读取发布信息');
    return response.json();
  }).then((releases) => {
    if (!Array.isArray(releases)) return;
    const release = releases.find((item) => !item.draft && !item.prerelease && /^mac-v\d+\.\d+\.\d+$/.test(item.tag_name));
    if (!release) return;
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const asset = assets.find((item) => /^MacRemote-macOS-.*-universal\.dmg$/.test(item.name)) || assets.find((item) => /^MacRemote-macOS-.*-universal\.zip$/.test(item.name));
    const isRepositoryURL = (url) => typeof url === 'string' && url.startsWith('https://github.com/yj-labs/mac_remote/releases/');
    if (asset && isRepositoryURL(asset.browser_download_url)) {
      document.querySelectorAll('[data-download]').forEach((link) => { link.href = asset.browser_download_url; });
    }
    if (isRepositoryURL(release.html_url)) document.getElementById('release-link').href = release.html_url;
    document.getElementById('release-meta').textContent = `${release.tag_name.slice(5)} · macOS 13+ · Apple Silicon 与 Intel`;
  }).catch(() => {
    // 网络、跨域或 API 限流时，下载按钮继续指向 Release 列表。
  }).finally(() => clearTimeout(timeout));
})();
