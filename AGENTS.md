# AI 部署入口

本仓库是原生 DeepSeek Harness 的本地美化插件和独立桌宠，不是另一套聊天客户端。

1. 先读 `README.md` 与 `docs/AI部署提示词.md`，检查实际系统、CPU、Node 和官方 Harness 版本。已验证范围是 macOS Apple Silicon、Harness 0.2.0-rc.2；不要宣称其他版本兼容，也不要绕过安装器检查。
2. 首次部署依次执行 `./run.sh setup`、`./run.sh install`、`./run.sh start`。安装前原生 Harness 必须已打开过一次并正常完全退出；遇到正在运行的任务，请先让用户保存，不能强制终止。
3. 预装的 6 个启动画面、6 套皮肤、4 个桌宠及音轨均在仓库内，不需要额外申请美化 API Key。可用 `shasum -a 256 -c assets/SHA256SUMS` 校验素材；不要遗漏 MP4、PNG、SVG 或将其变成外链占位。
4. 工具箱入口为原生账号菜单 → 设置 → 美化工具箱。独立桌宠运行 `./run.sh pet`，不会启动 Harness 后端。首次安装准备仍按 README 完成。
5. 用户设置、导入的自定义素材、安装备份、账号与会话不属于公开源码。不要提交 `.local/`、`.runtime/`、`.upstream/`、`node_modules/`、密钥或私人截图。不要修改签名应用。
6. 改代码后执行 `./run.sh build` 与合适的测试；说明实际执行结果和未验证范围，不将预览或模拟页面当作真实 Harness 验收。

发布地址：https://github.com/cyberdaddyleo/deepseek-meihuaqi
详细来源及素材许可范围见 `THIRD_PARTY_NOTICES.md`。
