# 项目协作约定

- 用户要求每次完成修改都同步到 GitHub：`https://github.com/hixumeng/Evolve-emon`。
- 默认交付顺序：本地修改 → 适当的构建和测试 → Git 提交 → 推送到 Fork 的 `master` → 发布服务器 → 公网验证。
- 同步保留提交历史，先检查远端更新，采用快进或正常合并；不要强制覆盖远端提交。
- `origin` 是用户的 Fork，`upstream` 是原作者仓库。定制改动只推送到 `origin`。
- 修改游戏逻辑和样式使用 `src/`，文案使用 `strings/`。构建使用 Node.js 24 和 `npm run build:static`。
- 不提交 `evolve/`、`wiki/` 中重新生成的 JS/CSS、`dist/`、依赖目录、截图、临时测试脚本或密钥。
- 线上地址是 `https://evo.emonxu.top/`，静态发布目录为 `/srv/evolve-emon/current`；使用版本目录和软链接切换，保留可回退版本。
- 旧 IP 游戏入口已关闭。更新时使用域名验证，不要重新启用 IP 路由。
- 若推送或部署失败，准确报告当前 GitHub 和线上版本状态，不把仅本地提交称为已同步。
