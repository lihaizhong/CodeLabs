# 小程序演示

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

### changeset

[changeset文档](https://github.com/changesets/changesets/tree/main)
