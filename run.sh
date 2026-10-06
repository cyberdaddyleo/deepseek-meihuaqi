#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
TASK=${1:-start}
if [ "$#" -gt 0 ]; then shift; fi
mkdir -p .runtime
NODE_BIN=''
if command -v node >/dev/null 2>&1; then
  if node -e 'const fs=require("fs"),p=require("path");process.exit(Number(process.versions.node.split(".")[0])>=24&&fs.existsSync(p.resolve(p.dirname(process.execPath),"../include/node/node_api.h"))?0:1)' 2>/dev/null; then NODE_BIN=$(command -v node); fi
fi
if [ -z "$NODE_BIN" ]; then
  if [ ! -x .runtime/node/bin/node ]; then
    [ "$(uname -s)" = Darwin ] || { echo '请安装带开发头文件的 Node.js 24+ 后重试。自动安装仅验证 macOS。'; exit 1; }
    case $(uname -m) in arm64) ARCH=arm64;; x86_64) ARCH=x64;; *) echo '未支持的 CPU';exit 1;; esac
    FILE="node-v24.19.0-darwin-$ARCH.tar.gz"
    echo '正在下载官方 Node.js 24.19.0（仅保存到本项目 .runtime）…'
    curl -fL --retry 2 "https://nodejs.org/dist/v24.19.0/$FILE" -o ".runtime/$FILE"
    curl -fsSL --retry 2 https://nodejs.org/dist/v24.19.0/SHASUMS256.txt -o .runtime/SHASUMS256.txt
    (cd .runtime && awk -v f="$FILE" '$2 == f {print}' SHASUMS256.txt > node.sha256 && test -s node.sha256 && shasum -a 256 -c node.sha256 && tar -xzf "$FILE")
    mv ".runtime/node-v24.19.0-darwin-$ARCH" .runtime/node
    rm ".runtime/$FILE"
  fi
  NODE_BIN="$PWD/.runtime/node/bin/node"
fi
export PATH="$(dirname "$NODE_BIN"):$PATH"
case "$TASK" in
 setup|doctor|build|start|install) SCRIPT=$TASK; [ "$TASK" != start ] || SCRIPT=launch; exec "$NODE_BIN" "scripts/$SCRIPT.mjs" "$@";;
 pet) exec "$NODE_BIN" scripts/launch.mjs --pet "$@";;
 uninstall) exec "$NODE_BIN" scripts/install.mjs --remove;;
 test) exec "$NODE_BIN" --test tests/*.test.mjs;;
 test:pet-behavior) exec "$NODE_BIN" tests/pet-behavior-ui.mjs "$@";;
 test:geek-hud) exec "$NODE_BIN" tests/geek-hud-native.mjs "$@";;
 test:custom-video-manager|test:custom-video-startup|test:video-startup|test:geek-video|test:geek-native|test:cyberdad-video|test:cyberdad-native|test:cyberdad-pet|test:whalegirl-pet|test:whalegirl-native|test:pet-sound-browser|test:pet|test:native|test:startup|test:custom-manager|test:custom-pet-store|test:native-custom|test:native-custom-startup) exec "$NODE_BIN" "tests/${TASK#test:}.mjs" "$@";;
 test:install-browser) exec "$NODE_BIN" node_modules/playwright/cli.js install chromium;;
 *) echo '命令：setup / install / start / pet / uninstall / doctor / build / test / test:pet / test:pet-behavior / test:cyberdad-pet / test:native / test:startup / test:custom-manager / test:custom-pet-store / test:native-custom / test:native-custom-startup / test:install-browser'; exit 1;;
esac
