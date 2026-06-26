wg-quick
===

WireGuard 隧道快速管理工具，可通过配置文件一键完成接口启停、路由与 DNS 规则配置。

## 补充说明

**wg-quick 命令** 是 WireGuard VPN 官方提供的快捷管理脚本，能够自动解析 WireGuard 配置文件，一站式完成虚拟网卡创建、密钥对加载、IP 地址分配、路由表写入、DNS 服务器设置、防火墙策略配置等操作，无需手动组合执行 `wg`、`ip`、`iptables` 等命令，是日常管理 WireGuard 隧道最常用的工具。

常见使用场景包括个人终端 VPN 隧道的快速拉起与关闭、服务器 WireGuard 节点部署、多套 VPN 配置的快速切换测试等。默认从 `/etc/wireguard/` 目录下读取 `<接口名>.conf` 格式的配置文件，所有操作均需要 root 权限执行；关闭隧道时会自动清理所有关联的系统配置，避免残留路由与防火墙规则影响网络环境。

### 语法

```shell
wg-quick [选项] <操作> [接口名 | 配置文件路径]
```

### 选项

- `-h, --help`: 显示 wg-quick 命令的帮助信息
- `-v, --version`: 显示 wg-quick 的版本信息

### 常用操作

- `up`: 加载配置并启动指定的 WireGuard 隧道接口
- `down`: 关闭指定的 WireGuard 隧道接口，同步清理关联的路由、DNS 与防火墙规则
- `save`: 将当前运行中接口的生效配置持久化保存到对应配置文件
- `strip`: 输出过滤掉注释与空行的精简配置内容，便于分享或迁移

### 实例

启动默认路径下的 wg0 隧道接口
```shell
wg-quick up wg0
```

关闭 wg0 隧道接口并清理所有关联配置
```shell
wg-quick down wg0
```

指定自定义路径的配置文件启动隧道
```shell
wg-quick up /etc/wireguard/wg0.conf
```

导出 wg0 接口的精简有效配置
```shell
wg-quick strip wg0
```

将当前运行的 wg0 配置保存到配置文件
```shell
wg-quick save wg0
```

查看命令帮助说明
```shell
wg-quick --help
```