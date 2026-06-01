# 发版指南（Release Guide）

本项目同时发布到**外网 npm** 和**内网腾讯源**，两者**同版本同步发布**。

| | 外网公开包 | 内网私有包 |
|---|---|---|
| 包名 | `smh-js-sdk` | `@tencent/smh-js-sdk` |
| Registry | `registry.npmjs.org` | `mirrors.tencent.com/npm/` |
| 发布方式 | GitHub Actions OIDC 可信发布（打 tag 自动触发） | 本地脚本同步发布 |

## 一键发版

```bash
npm run release            # patch:  1.0.14 -> 1.0.15
npm run release minor      # minor:  1.0.14 -> 1.1.0
npm run release major      # major:  1.0.14 -> 2.0.0
```

脚本会自动完成：

1. 检查分支（必须 `master`）、工作区是否干净、内网登录态
2. 二次确认 `[y/N]`
3. `npm version` 升级版本号 + commit + 打 tag
4. **先发内网** `@tencent/smh-js-sdk`（同步，失败立即终止）
5. 内网成功后，**推 tag 到 cnb** → CNB 同步 GitHub → GitHub Actions 自动发**外网** `smh-js-sdk`

> 顺序说明：内网是同步发布（立刻知成败），外网是异步 CI。先发内网验证，成功后再推外网 tag；内网失败时 tag 未推出，外网不会发，可安全回滚。

## 前置条件

**首次 / 换机器 / token 过期时**，需登录内网 registry（外网无需，走 OIDC）：

```bash
# 检查是否已登录内网
npm whoami --registry=http://mirrors.tencent.com/npm/

# 未登录则执行（登录信息参考司内 npm 镜像文档）
npm login --registry=http://mirrors.tencent.com/npm/
```

脚本已内置登录预检：未登录会提前提示并终止，不会留下半成品状态。

## 谁能发版（权限要求）

脚本本身不绑定任何人，团队成员都能用。能否发成功取决于执行者自己的权限：

| 发布目标 | 权限要求 | 说明 |
|---|---|---|
| **外网** `smh-js-sdk` | 无需个人权限 | 走 GitHub Actions OIDC，谁推 tag 都由 CI 用可信发布身份完成 |
| **内网** `@tencent/smh-js-sdk` | ① 已登录内网 registry ② 是该包 maintainer | 两者都满足才能发 |

**重要**：内网私服**不支持命令行查询/校验权限**（`npm owner ls` 返回 `no admin found`，`npm access` 报「不支持此操作」）。因此脚本**只能预检登录态，无法预检发布权限**。没有发布权限的人会在 `npm publish` 那步才报 403，此时 tag 已打，需按提示回滚。

**建议**：不确定自己有无内网发布权限的成员，先用 `--skip-internal` 只发外网，内网由有权限的人补发；或到司内 npm 镜像平台申请该包的 maintainer 权限。

## 可选参数

> 注意：通过 `npm run` 传 `--xxx` 形式的参数时，**必须用 `--` 分隔符**，否则会被 npm 自身吞掉。

```bash
npm run release -- patch --skip-internal   # 只发外网（跳过内网）
npm run release -- --internal-only         # 只发内网（不打 tag、不推外网，用当前版本号）
```

或直接用脚本（无需 `--` 分隔符）：

```bash
bash scripts/release.sh patch --skip-internal
bash scripts/release.sh --internal-only
```

> `--internal-only` 用于内网单独补发的兜底场景。**正常发版请勿使用**，否则会破坏内外网版本号同步。

## 查看发布结果

- GitHub Actions：https://github.com/cuijiawei123/smh-js-sdk/actions
- 外网 npm：https://www.npmjs.com/package/smh-js-sdk
- 内网：`npm view @tencent/smh-js-sdk version --registry=http://mirrors.tencent.com/npm/`

## 异常处理

### 内网成功、外网 CI 失败（两边暂不同步）

npm 版本号不可覆盖，**不要重发内网**。修复 GitHub Actions 失败原因后，重推同名 tag 触发外网发布：

```bash
git push cnb v1.0.15 --force   # 仅重新触发外网，内网不受影响
```

### 内网发布失败（脚本已终止，tag 已打但未推外网）

按脚本提示回滚本地 tag 和 commit：

```bash
git tag -d v1.0.15
git reset --hard HEAD~1
```

## 发版纪律（模式 A：内外网同步）

- ✅ 发版统一用 `npm run release`，内外网版本号天然对齐
- ⚠️ 不要单独跑 `npm run publish:internal` 补发内网，会导致内网版本号超前、破坏同步
- `--skip-internal` / `--internal-only` 仅用于异常兜底

## 底层机制

- **代码同步**：`.cnb.yml` 用 `tencentcom/git-sync` 插件，push 同步代码、tag_push 同步 tag 到 GitHub。GitHub token 存于 CNB 密钥仓库 `chrisscui/secrets/github.yml`，通过 `imports` 引用。
- **外网可信发布**：`.github/workflows/publish.yml` 监听 `v*` tag，用 OIDC（`id-token: write`）向 npm 换取短期令牌发布，无需 NPM_TOKEN，自动生成 provenance 溯源签名。npm 侧已在包 Settings → Trusted Publisher 绑定 `cuijiawei123/smh-js-sdk` + `publish.yml`。
