# CodeLabs

## 工程展示

### OctopusSvga

Svga动效播放器，是一个高性能、多端兼容（Web端、微信小程序、支付宝小程序、抖音小程序）、功能丰富的动效播放器。经历了企业级的验证，结合 `Worker` 能力，可进一步的提升 `下载 -> 解压 -> 解析` 能力。

对比Github上官方的 Svga 播放器，OctopusSvga有以下优势：

- 解压速度更快
  - 使用了 `fflate` 替代 `poka`，提升了解压速度，有效减少了包体积
- 解析速度更快
  - 使用了预检测技术，有效减少了不必要的数据解析
- 内存占用更小
  - 使用了常用数据复用技术，有效减小了内存占用
- 兼容性强
  - 针对Web端、微信小程序、支付宝小程序、抖音小程序做了兼容处理
- 高性能
  - 播放器采用了**双缓存技术**和**指数退避算法**，提升了播放性能。
- 功能更丰富
  - 增强了播放器本身的操作能力
  - `VideoManager` 帮忙管理动效集，可以通过 `preprocess` 和 `postprocess` 优化动效源文件处理策略（结合 `Worker` 可以有效提升原始文件处理速度）
  - 添加了海报生成器，添加了二维码生成器，以及自研了png图片生成器
  - `VideoEditor` 帮助修改海报内容

[查看这里](/packages/octopus-svga/README.md)

#### 演示代码

在 `mp-platform` 中，可通过对应小程序开发者工具查看（*抖音小程序，请在真机中查看*）。

### OctopusPlatform

多平台兼容工具，主要用于Svga播放器多端兼容处理，提高代码的可维护性。通过插件方式，方便兼容能力按需接入。

[查看这里](/packages/octopus-platform/README.md)

### OctopusBenchmark

性能测试工具。

[查看这里](/packages/octopus-benchmark/README.md)

## 工具指令

### git submodule

[git submodule 命令](https://www.runoob.com/git/git-submodule.html)

```bash
# 添加一个submodule
git submodule add <git-repo>

# 将新的配置从.gitmodules拷贝到.git/config
git submodule sync
# 当使用git clone下来的工程中带有submodule时，初始的时候，submodule的内容并不会自动下载下来的，此时，只需执行如下命令
git submodule update --init --recursive
```

## 为什么有了那么多框架，我们仍需要学习原生基础知识？

1. 只能用框架按照一些官方示例做些 Demo，离开了官方教程的引导，很多东西还是无法做出来，甚至没有一点思路。
2. 虽然能很熟练地使用框架，但是碰到一些底层问题时，因不明白底层原理，所以不知道怎样定位问题，当然也就无法解决。
3. 框架不能满足业务需求，需要写一个适应业务的精简框架，但却不知从何处下手。
4. 性能出现问题时，不知道从何处下手进行优化。

## 动画文件压缩工具

- [佳维动效文件处理工具](https://eff-tools.17ae.com/)

## changeset

[changeset文档](https://github.com/changesets/changesets/tree/main)
