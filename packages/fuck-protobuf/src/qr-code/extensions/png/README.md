# png

## 规范

[Portable Network Graphics (PNG) Specification (Third Edition)](https://www.w3.org/TR/png/)

## 推荐文章

- [PNG文件结构](https://www.cnblogs.com/Yuuki-/p/7868858.html)
- [一步一步解码 PNG 图片](https://vivaxyblog.github.io/2019/12/07/decode-a-png-image-with-javascript-cn.html)
- [PNG的算法原理](https://zhuanlan.zhihu.com/p/106945903)
- [PNG文件解读(1):PNG/APNG格式的前世今生](https://www.zhoulujun.cn/html/theory/multimedia/CG-CV-IP/8409.html)
- [PNG文件解读(2):PNG格式文件结构与数据结构解读—解码PNG数据](https://www.cnblogs.com/zhoulujun/p/15113029.html)
- [PNG文件解读(3):图像数据块IDAT细节—PNG压缩与解码编码详解](https://www.zhoulujun.cn/html/theory/multimedia/CG-CV-IP/8411.html)
- [常见图片格式的封装及编解码（一）BMP](https://zhuanlan.zhihu.com/p/673517926)
- [常见图片格式的封装及编解码（二）PNG](https://zhuanlan.zhihu.com/p/673817002)
- [常见图片格式的封装及编解码（三）JPG](https://zhuanlan.zhihu.com/p/673817570)

![PNG图像的5种过滤器类型](https://www.nxrte.com/wp-content/uploads/2023/04/640-151.png)

![PNG图像的压缩算法](https://www.nxrte.com/wp-content/uploads/2023/04/640-152.png)

![PNG图像的分块（关键块和辅助块）](https://www.nxrte.com/wp-content/uploads/2023/04/640-153.png)

- 关键块是为了从 PNG 数据流中成功解码 PNG 图像而绝对需要的那些块。

> 有效的 PNG 数据流应以 PNG 签名开头，紧随其后的是 IHDR块，然后是一个或多个IDAT块，最后应以IEND 块结束。一个 PNG 数据流中只允许一个 IHDR块和一个 IEND块。

- 辅助块有些会有规定顺序，但没有强制在 PNG 数据流中出现的顺序。解码器可能会忽略辅助块。对于每个辅助块，所描述的操作都是在解码器没有忽略该块的假设下进行的。
