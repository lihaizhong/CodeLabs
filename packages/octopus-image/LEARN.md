# image encoder

## PNG

PNG 是一种无损压缩的图像文件格式，它支持多种颜色深度和颜色类型，并且支持透明度。PNG 图像文件通常具有 .png 扩展名。

### 规范

[Portable Network Graphics (PNG) Specification (Third Edition)](https://www.w3.org/TR/png/)

![PNG图像的5种过滤器类型](https://www.nxrte.com/wp-content/uploads/2023/04/640-151.png)

![PNG图像的压缩算法](https://www.nxrte.com/wp-content/uploads/2023/04/640-152.png)

![PNG图像的分块（关键块和辅助块）](https://www.nxrte.com/wp-content/uploads/2023/04/640-153.png)

- 关键块是为了从 PNG 数据流中成功解码 PNG 图像而绝对需要的那些块。

> 有效的 PNG 数据流应以 PNG 签名开头，紧随其后的是 IHDR 块，然后是一个或多个 IDAT 块，最后应以 IEND 块结束。一个 PNG 数据流中只允许一个 IHDR 块和一个 IEND 块。

- 辅助块有些会有规定顺序，但没有强制在 PNG 数据流中出现的顺序。解码器可能会忽略辅助块。对于每个辅助块，所描述的操作都是在解码器没有忽略该块的假设下进行的。

## JPEG

JPEG 是一种有损压缩的图像文件格式，它支持多种颜色深度和颜色类型，并且支持透明度。JPEG 图像文件通常具有.jpg 或.jpeg 扩展名。

### 规范

## WebP

WebP 是一种图像文件格式，它支持多种颜色深度和颜色类型，并且支持透明度。WebP 图像文件通常具有.webp 扩展名。

### 规范

## 推荐文章

- [常见图片格式的封装及编解码（一）BMP](https://zhuanlan.zhihu.com/p/673517926)
- [常见图片格式的封装及编解码（二）PNG](https://zhuanlan.zhihu.com/p/673817002)
- [常见图片格式的封装及编解码（三）JPG](https://zhuanlan.zhihu.com/p/673817570)
