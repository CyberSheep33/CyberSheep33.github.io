# 赛博小羊 CyberSheep 品牌主页

一个可直接部署到 GitHub Pages 的静态单页网站，适用于展示赛博小羊 CyberSheep 的品牌形象、内容定位、服务入口与二维码引流信息。

## 文件结构

- `index.html`：页面结构
- `styles.css`：视觉样式与响应式布局
- `script.js`：滚动显隐与二维码放大预览交互
- `logo.jpg`：品牌 Logo
- `official_account_qrcode.jpg`：公众号二维码
- `group_qrcode.png`：微信群二维码
- `.nojekyll`：确保 GitHub Pages 按静态文件站点方式发布

## 本地预览

直接双击 `index.html` 即可打开，也可以使用任意静态服务器预览。

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库，例如 `cybersheep_homepage`。
2. 将当前目录下所有文件上传到仓库根目录。
3. 进入仓库的 `Settings` -> `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 分支选择 `main`，目录选择 `/ (root)`，然后保存。
6. 等待 GitHub Pages 完成发布后，即可通过生成的公开地址访问主页。

## 可自定义内容

- 修改 `index.html` 中的 GitHub 仓库链接：
  `https://github.com/yourname/cybersheep_homepage`
- 若后续需要替换二维码图片，直接用新图片覆盖以下文件即可：
  - `official_account_qrcode.jpg`
  - `group_qrcode.png`
- 若要修改主推服务链接，更新 `index.html` 里 `sheepai.top` 对应的按钮地址。

## 交互特性

- 平滑滚动导航
- 卡片悬停动效
- 二维码点击放大预览
- 移动端优先响应式布局
