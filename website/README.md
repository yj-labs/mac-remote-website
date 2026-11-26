# Mac Remote 静态官网

纯 HTML、CSS 与 JavaScript，无依赖安装或打包步骤。页面独立于 App 工程，发布网页不需要构建 App。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 8877 --directory website
```

打开 `http://localhost:8877`。不要使用 `8765`：它是 Mac Remote 服务端的默认端口，会造成 App 启动失败。

首屏使用实际运行并已连接的 iOS 遥控页，以及 Mac 偏好设置的「控制」页，使用 CSS 设备外框组合展示。下方展示已连接的键盘页。截图里的控件和连接状态不重绘；设备名称按用户要求原样展示。网站仅保存经过处理的 WebP 展示副本，无损原图留在 App 私有仓库的 `docs/references/website/`。

手势演示直接叠加于遥控截图的真实触控板内，可选择单指移动、轻点点击和双指滚动，也可暂停；支持键盘切换和减少动态效果偏好，不实际操作 Mac。可选场景图提示词见 `docs/image-generation/WEBSITE_PENDING.md`。

## 下载链接

两个「下载 Mac 端」按钮从同目录 `latest-release.json` 读取最新安装包地址，点击直接下载，不经过 Release 列表。HTML 和 JavaScript 不写死版本号、构建号或附件文件名。

该 JSON **由 App 发布流程自动生成**：正式发布成功后，App 仓库的 `scripts/sync-website-release.sh` 使用授权 API 读取所有 Releases，过滤草稿、预发布和 iOS 版本，选择最高正式 Mac 版本，优先 DMG，其次 ZIP；将只含版本、文件名和下载 URL 的元数据更新到本公开仓库，并触发 Pages 部署。草稿不会更新官网。

若需修复同步，直接在 App 仓库运行 `./scripts/sync-website-release.sh`，不必重新打包。CI 使用官网仓库 Contents: write 权限的 `WEBSITE_SYNC_TOKEN` Secret；网页从不包含该令牌。网络或 JSON 出错时，按钮回退到 Release 页面，不猜测附件地址。

私有仓库附件仍受 GitHub 登录与权限限制。同步 URL 不会把安装包变成公开文件；要支持匿名下载，需要另行提供公开安装包来源。

iPhone 端当前没有公开安装入口，因此页面介绍源码安装方式。以后上架或提供 TestFlight 后，需更新第二步安装说明及下载区说明。

## GitHub Pages 部署

站点由 `.github/workflows/deploy-website.yml` 部署，仅上传 `website/`，不上传 App 源码、构建缓存或无损截图原图。无需安装依赖或运行前端构建。

### 仓库与访问方式

官网在公开仓库 `yj-labs/mac-remote-website` 独立维护。App 源码仓库 `yj-labs/mac_remote` 保持私有，未将其 Git 历史或源码复制到本仓库。迁出官网的原因是组织当前套餐不支持私有仓库的 GitHub Pages。

私有 App 仓库的 Releases API 与附件下载需要相应权限；官网公开不会使安装包自动公开。若需普通访客下载安装包，需另外配置公开的安装包发布位置，不能在前端放访问令牌。

### 首次部署

1. 将官网和工作流提交并推送至仓库的 `master` 分支。
2. 打开仓库 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**。操作需要仓库管理权限；API 对应 `build_type: workflow`。
3. 打开 **Actions → 部署 Mac Remote 官网 → Run workflow**，选择 `master` 后运行。如果本次推送已触发该工作流，可以直接查看正在执行的运行记录。
4. 等待 `deploy` 任务完成。成功后从任务的 `github-pages` 环境链接打开站点，并检查首页、图片和下载链接。
5. 默认地址为 **https://yj-labs.github.io/mac-remote-website/**。全部站内资源使用相对路径，适配 `/mac-remote-website/` 子目录。可以后续在 Pages 设置中绑定自定义域名。

### 更新与重新部署

修改 `website/` 或部署工作流后，提交并推送到 `master` 会自动触发部署。更新网页不构建 iOS/macOS App，也不会创建 App Release。若只需重试部署，在 Actions 中重新运行任务，或手动 Run workflow 即可。

### 停用与失败检查

- 访问 **Settings → Pages → Unpublish site** 可取消发布；仅停用 Actions 工作流不会自动删除已经上线的站点。
- Pages 未启用时，`configure-pages` 会失败，先完成 Source 配置再重跑。
- 如果组织限制 Actions、Pages 或部署环境，请在任务日志与仓库环境规则中检查；工作流需要 `pages: write` 和 `id-token: write`，无需在代码里保存访问令牌。

## 公开访问与搜索收录

本次选择：**公开访问，请求搜索引擎不收录**。`index.html` 的 `<head>` 已设置：

```html
<meta name="robots" content="noindex">
```

- 页面能通过完整链接直接访问；`noindex` 不是访问控制或密码保护，也不能保证所有抓取工具遵守。若页面此前已被收录，需等待搜索引擎重新抓取才可能移除。
- 不额外设置 `robots.txt` 的 `Disallow`：搜索引擎需要读取网页才能看到 `noindex`。GitHub 项目站点位于子路径，自身目录的 `robots.txt` 也不等同于域名根目录的爬虫规则。
- 以后允许收录时，删除该 meta 标签并重新部署。允许收录不代表一定能被搜到，收录时机由搜索引擎决定。
- GitHub Pages 网站访问权限与源码仓库可见性是两件事：私有仓库的 Pages 也可能公开。受限 Pages 项目站点需要组织的 GitHub Enterprise Cloud 等条件；普通公开 Pages 没有“仅凭密码访问”的开关。
- 官网的图片文件仍公开可取，`noindex` 只用于请求支持该指令的搜索引擎不索引页面。仓库与 Release 各自的访问权限不随此设置改变。

官方说明：[Pages 站点访问控制](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)、[Google noindex 指令](https://developers.google.com/search/docs/crawling-indexing/block-indexing)。

## 设计与素材

- 近黑底色与 App 深色背景一致；主按钮使用 MacTheme.green（#34C759），细节强调使用 RemoteStyle.green（#69C89B）。
- 产品图标复用 macOS AppIcon，网站副本位于 `assets/app-icon.png`，图标更新时同步。
- 页面背景和截图外部排版使用 CSS，App 画面使用实际截图，页面无外部字体或远程图片依赖。
- 主展示为已连接状态的双端真实界面；不改变 App 实际外观和界面比例，不用 AI 重绘 App UI。
- 支持窄屏、键盘焦点、减少动态效果偏好和 API 不可用时的下载回退。

## 采集运行截图

运行 iOS 模拟器时使用 Xcode 正常 Debug 签名，不要设置 `CODE_SIGNING_ALLOWED=NO`。禁用签名会跳过模拟器应用身份权限生成，可能导致系统钥匙串无法保存配对凭据。模拟器签名不要求导出真机签名证书。

配对、确认连接正常后再截取遥控主页面；截图发布前检查配对凭据，保留原图，网站只使用经过等比压缩的副本。官网预览使用 8877 等不与 App 冲突的端口，勿使用 App 默认的 8765。

Mac 窗口使用用户提供的完整 PNG 截图，保留红黄绿按钮、顶部空间、原始比例和透明圆角，不裁切标题区域。窗口按桌面内局部窗口比例展示，不铺满显示器。手势动效仅定位在 iPhone 截图的实际触控板区域。
