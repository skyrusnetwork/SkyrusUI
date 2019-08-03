BitShares-UI
============

这是一个连接 BitShares API 的轻钱包。BitShares API 由 *witness_node* 程序提供。

这个钱包*将所有的密钥存储在本地浏览器上*，*不会把你的密钥暴露给任何人*，因为它会先在本地对交易签名，再传输到 API 服务器上，由服务器广播至区块链网络。钱包由用户选择的密码加密并储存在浏览器数据库中。

## 项目依赖

BitShares-UI 依赖于 Node.js v9 以上版本。

在 Linux 和 macOS 上，安装 Node 最简单的方式是用 [NVM](https://github.com/creationix/nvm)。

将以下命令复制到终端中执行即可安装 NVM。

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
nvm install v9
nvm use v9
```

Node 安装完成后，获取项目的源代码：

```
git clone https://github.com/bitshares/bitshares-ui.git
cd bitshares-ui
```

在启动之前，需要先安装 npm 软件包：

```
npm install
```

## 运行开发服务器

开发服务器使用 Express 和 Webpack。

所有软件包安装好后，可以使用以下命令启动开发服务器：

```
npm start
```

编译完成后，即可通过浏览器访问 `localhost:8080` 或 `127.0.0.1:8080` 打开钱包。服务器启用了热加载功能，在编辑源文件后，浏览器中的内容会实时更新。

## 生产环境
如果你想自己架设钱包，你应该进行生产环境构建，并使用 NGINX 或 Apache 托管。只需要运行以下命令构建生产环境应用包：

```
npm run build
```


应用包会创建在 `/dist` 目录下，可以使用网站服务器进行托管。

## 可安装钱包
我们使用 Electron 提供可安装钱包，支持 Windows, macOS 和 Debian 系 Linux 系统，如 Ubuntu。首先确保你安装的 python 版本为 2.7.x，因为一个依赖要求此版本。

在 Linux 上，你需要安装以下软件包来生成图标：

`sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils`

每个目标平台都有自己的脚本用来构建项目：

__Linux__
`npm run package-deb`  
__Windows__
`npm run package-win`  
__Mac__
`npm run package-mac`

编译 UI 时将会针对 Electron 做出一些特殊修改，之后生成可安装的二进制文件，并将文件复制到 `build/binaries` 文件夹中。
