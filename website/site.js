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
  // 由 App 正式发布流程自动生成的公开元数据，不在前端保存私有仓库令牌。
  fetch(new URL('latest-release.json', document.baseURI), {
    cache: 'no-store', signal: controller.signal,
  }).then((response) => {
    if (!response.ok) throw new Error('无法读取发布信息');
    return response.json();
  }).then((release) => {
    if (!release || !/^mac-v\d+\.\d+\.\d+$/.test(release.tag)) return;
    const prefix = 'https://github.com/yj-labs/mac-remote-website/releases/';
    const download = typeof release.download_url === 'string' ? release.download_url : '';
    const filename = download.split('/').pop();
    if (!download.startsWith(prefix + 'download/' + release.tag + '/') || !/^MacRemote-macOS-.*-universal\.(dmg|zip)$/.test(filename)) return;
    document.querySelectorAll('[data-download]').forEach((link) => { link.href = download; });
    if (typeof release.release_url === 'string' && release.release_url.startsWith(prefix + 'tag/')) {
      document.getElementById('release-link').href = release.release_url;
    }
    document.getElementById('release-meta').textContent = `${release.tag.slice(5)} · macOS 13+ · Apple Silicon 与 Intel`;
  }).catch(() => {
    // 元数据不可用时保持 Release 页回退，不猜测文件名或版本号。
  }).finally(() => clearTimeout(timeout));
})();
