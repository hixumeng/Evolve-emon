# Evolve-emon 开发与部署

定制版仓库：https://github.com/hixumeng/Evolve-emon
原项目：https://github.com/pmotschmann/Evolve
目标服务器：192.236.223.253
正式访问地址：https://evo.emonxu.top/

## 修改同步流程

每次完成修改后，先在本地构建和验证，再提交并推送到用户 Fork 的 `master`，
然后发布构建产物到服务器并验证公网运行情况。
`origin` 保存已验证的定制版本，`upstream` 用于读取原作者更新。
推送采用快进或正常合并，保留远端已有提交；不同步构建产物和本机凭据。
项目长期协作约定记录在 `AGENTS.md`。

## 本地开发（macOS / Linux）

使用 Node.js 24，依赖由 `package-lock.json` 锁定。

```sh
npm ci
npm run build
npm run serve
```

访问 http://localhost:4400/ 。修改 `src/` 后重新运行 `npm run build`；
修改文案使用 `strings/`，修改样式使用 `src/evolve.less`。
`evolve/` 和 `wiki/` 下的构建产物无需提交。

```sh
npm run build:static
```

生成 `dist/`，可直接由 Nginx 托管。这个命令依赖 macOS / Linux 的 `tar`。
发布包包含 LICENSE、`source.html` 和与构建对应的 `source.tar.gz`；
源码下载地址为 `/source.html`。构建时不会收集 Git 数据、node_modules 或环境变量文件。

## Docker 部署

服务器需有 Docker Engine 和 Docker Compose。先将经过验证的定制版代码上传或拉取至服务器，
再在项目目录运行：

```sh
docker compose up -d --build
curl -I http://127.0.0.1:8080/
```

默认监听服务器本机 `127.0.0.1:8080`，适合接入服务器上已有的 Nginx / Caddy。
若要直接通过 IP 的 8080 端口访问，且服务器允许该端口入站：

```sh
EVOLVE_BIND=0.0.0.0 EVOLVE_PORT=8080 docker compose up -d --build
```

随后访问 http://192.236.223.253:8080/ 。端口已被占用时可修改 `EVOLVE_PORT`。
重复执行时需使用相同的变量值。查看日志与停止：

```sh
docker compose logs --tail=100 game
docker compose down
```

若服务器已有域名和反向代理，将该域名代理到 `http://127.0.0.1:8080`；
根据现有站点配置添加独立虚拟主机。更新时重新上传 / 拉取代码，再执行相同的构建启动命令。
执行部署前先确认 SSH 登录方式、已有站点和端口占用情况。

## 本次服务器部署（Caddy）

目标服务器已使用 Caddy，实际采用静态文件部署，不安装 Docker。
将 `dist/` 上传至 `/srv/evolve-emon/releases/<版本>/`，用
`/srv/evolve-emon/current` 软链接指向当前版本。
在 `/etc/caddy/Caddyfile` 中配置 `deploy/Caddyfile.domain.example` 的域名站点，
并在现有 `:80` 站点内添加该域名的 HTTPS 跳转。保留原有站点路由。

```sh
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy
curl -I --resolve evo.emonxu.top:443:127.0.0.1 https://evo.emonxu.top/
```

访问地址：https://evo.emonxu.top/ 。后续更新只需上传新构建并切换 `current` 软链接，
无需重启已有站点。需要回退时，将 `current` 指向前一个发布目录。
首次改动 Caddy 配置前保留带时间戳的备份。
`deploy/deploy-caddy.sh` 可在服务器上执行：传入已上传的站点压缩包路径和唯一版本标识。
脚本先验证配置，然后切换软链接、平滑加载配置并检查资源；失败时回退配置和版本链接。

### 域名访问

`evo.emonxu.top` 的 A 记录指向 `192.236.223.253`。
在 Caddyfile 中加入 `deploy/Caddyfile.domain.example` 的域名站点块，
使用相同的 `/srv/evolve-emon/current` 发布目录，Caddy 自动管理 HTTPS 证书。
服务器已有显式 `:80` 兜底站点，因此同时在该站点内添加示例中的域名 HTTPS 跳转。
正式地址为 https://evo.emonxu.top/ ，HTTP 域名访问跳转至 HTTPS。
旧 IP 游戏路由已移除，直接通过 IP 访问 HTTP 首页返回 404。
部署脚本检查域名站点已配置，不会重新创建 IP 游戏入口。

## 定制设置：产出倍率

设置页顶部可输入产出倍率并点击“应用”，支持 0.1–1000（含小数），默认 1。
同时作用于 RNA/DNA、文明手动采集和使用全局生产修正的自动资源产出；
建造成本、资源容量和游戏时间速度保持原值。
点击“恢复 1 倍”可还原原版产出；倍率随存档保存，旧存档默认 1。
空值、非正数、超出范围的输入不会改变当前设置。
交易、事件奖励和威望奖励不使用该产出倍率。

## 存档与外部资源

游戏存档位于浏览器 localStorage，服务器只提供静态文件。
从官方站迁移时，在原站导出存档，在新站导入；更换域名、端口或 HTTP / HTTPS 时也需要迁移。
自建部署不会自动增加云存档或跨设备同步。
原版 HTML 仍使用 unpkg 的 JS 库和 Google 字体；首次加载需要浏览器能访问这些外部资源。

## 跟进原作者更新

本地 `origin` 指向定制版，`upstream` 指向原项目。当前初次拉取只下载了 master 最新提交。
需要完整历史以合并上游时：

```sh
git fetch --unshallow origin
git fetch upstream master
git merge upstream/master
```

在独立分支解决冲突、重新构建并验证，然后发布。
