# 小程序演示

## 工具指令

### Git Submodules

[git submodule 命令](https://www.runoob.com/git/git-submodule.html)

```bash
# 添加一个submodule
git submodule add <git-repo>

# 将新的配置从.gitmodules拷贝到.git/config
git submodule sync
# 当使用git clone下来的工程中带有submodule时，初始的时候，submodule的内容并不会自动下载下来的，此时，只需执行如下命令
git submodule update --init --recursive
```

### changeset

[changeset文档](https://github.com/changesets/changesets/tree/main)
