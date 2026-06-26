# Linux Command Web Editor

这是一个基于 [jaywcjlove/linux-command](https://github.com/jaywcjlove/linux-command) 修改的 Linux 命令速查站。

和原项目的静态 Pages 部署不同，本项目面向自托管场景：页面仍然由静态文件提供，但内置了一个 Node 后端保存接口，可以在网页上直接编辑或新增 Markdown 命令文档，保存后自动重新生成对应页面。

## 功能

- 搜索 Linux 命令说明。
- 查看命令详情页。
- 在每个命令详情页点击“修正”，直接编辑对应的 `command/*.md`。
- 在首页点击“添加命令”，通过模板新增命令文档。
- 保存时写入本地 Markdown 文件。
- 保存后增量构建，只重新生成当前命令页面和搜索数据。
- 通过 `EDIT_TOKEN` 保护保存接口，避免匿名写入。
- 使用 Caddy 提供静态页面和反向代理 API。
- 使用 systemd 管理 Node 后端并支持开机自启动。

## 项目结构

```text
command/              Linux 命令 Markdown 源文件
dist/                 搜索数据 JSON
scripts/build.mjs     静态页面构建脚本，支持全量和增量构建
server.js             Web 编辑保存接口和静态服务后端
template/             EJS、Stylus、前端 JS 模板
.deploy/              构建输出目录，不建议提交
```

## 环境要求

- Linux 服务器
- Node.js 16 或更高版本
- npm
- Caddy
- systemd

## 安装

```bash
git clone <your-repo-url> /var/www/linux-command-src
cd /var/www/linux-command-src
npm install
npm run build
```

构建完成后会生成 `.deploy/` 目录。Caddy 负责读取这个目录里的静态文件。

## 配置保存令牌

创建环境变量文件：

```bash
sudo tee /etc/linux-command-editor.env >/dev/null <<'EOF'
PORT=3000
EDIT_TOKEN=请替换成足够长的随机字符串
EOF
```

生成随机令牌可以使用：

```bash
openssl rand -hex 32
```

注意：不要把 `/etc/linux-command-editor.env` 或仓库里的 `linux.env` 软链接提交到公开仓库。

## systemd 服务

创建服务文件：

```bash
sudo tee /etc/systemd/system/linux-command-editor.service >/dev/null <<'EOF'
[Unit]
Description=Linux Command web editor
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/linux-command-src
EnvironmentFile=/etc/linux-command-editor.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
```

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now linux-command-editor
sudo systemctl status linux-command-editor
```

后端默认监听 `3000` 端口。建议只通过 Caddy 暴露，不要直接开放到公网。

## Caddy 配置

示例配置：

```caddyfile
{
	auto_https off
}

http://:9665 {
	bind 127.0.0.1

	root * /var/www/linux-command-src/.deploy
	encode gzip

	route {
		reverse_proxy /api/* 127.0.0.1:3000
		try_files {path} {path}/ /index.html
		file_server
	}
}
```

验证并重载：

```bash
sudo caddy validate --config /var/www/Caddyfile
sudo systemctl reload caddy
```

如果你的外层还有一个公网入口或主站 Caddy，可以把该站点反代到 `127.0.0.1:9665`。

## 使用方式

访问站点首页后：

- 搜索框可以查询命令。
- 命令详情页右上角有“修正”按钮。
- 首页下方有“添加命令”按钮。
- 第一次保存时浏览器会要求输入 `EDIT_TOKEN`。
- 令牌会保存在当前浏览器的 `localStorage` 中。

保存成功后，后端会返回文件路径和构建耗时。普通修正和新增命令默认使用增量构建。

## 构建命令

全量构建：

```bash
npm run build
```

单命令增量构建：

```bash
npm run build:one -- --single=systemctl
```

增量构建会更新：

- `dist/data.json`
- `dist/data.min.json`
- `.deploy/js/dt.js`
- `.deploy/index.html`
- `.deploy/add.html`
- `.deploy/list.html`
- `.deploy/hot.html`
- `.deploy/c/<command>.html`
- `.deploy/edit/<command>.html`

如果修改了模板、样式、前端脚本或全局资源，建议执行全量构建。

## 运维命令

查看后端状态：

```bash
systemctl status linux-command-editor
```

查看日志：

```bash
journalctl -u linux-command-editor -f
```

重启后端：

```bash
sudo systemctl restart linux-command-editor
```

查看 Caddy 状态：

```bash
systemctl status caddy
```

## 安全说明

- `EDIT_TOKEN` 必须足够长，不能提交到公开仓库。
- `/api/save-md` 具有写入 `command/*.md` 的能力，必须通过令牌保护。
- 推荐只在可信网络或加了认证的入口中使用编辑功能。
- 新增命令名只允许字母、数字、点、下划线、加号、`@`、冒号和短横线，避免路径越界。
- 后端只允许写入 `command` 目录下的 Markdown 文件。

## 公开仓库注意事项

建议不要提交：

- `.deploy/`
- `node_modules/`
- `linux.env`
- `/etc/linux-command-editor.env`
- 任何真实令牌或服务器私有配置

可以提交：

- `command/`
- `template/`
- `scripts/`
- `server.js`
- `package.json`
- `package-lock.json`
- `dist/`
- `LICENSE`
- `README.md`

## 致谢与许可证

本项目基于 [jaywcjlove/linux-command](https://github.com/jaywcjlove/linux-command) 修改，原项目由小弟调调等贡献者维护，采用 MIT License。

本仓库继续保留原始 [LICENSE](./LICENSE)。根据 MIT License，你可以使用、复制、修改、发布、分发和再授权本项目，但需要保留版权声明和许可证文本。

命令文档内容来自原项目、网络资料和后续补充。若内容侵犯了你的权益，请提交 issue 或联系维护者删除或修正。
