---
title: P28：讨论课——卷积神经网络
description: 对应 B 站 P28 和 2018-12-07 Discussion Section，从局部连接、参数共享和卷积尺寸进入 CNN 训练与诊断。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 为什么图像不直接使用全连接层

图像：

$$
X\in\mathbb R^{H\times W\times C}
$$

若展平后连接到大量隐藏单元，参数数目随像素数快速增加，也丢失局部空间结构。

图像中的有用模式具有两个特点：

- 局部相关：边缘由邻近像素组成；
- 平移复用：同一种边缘可能出现在不同位置。

卷积通过局部连接与参数共享利用这些先验。

## 卷积核

卷积核：

$$
K\in\mathbb R^{k_h\times k_w\times C_{\mathrm{in}}}
$$

在输入上滑动，每个位置计算局部加权和。

多个输出通道使用多个核：

$$
W
\in
\mathbb R^{
k_h\times k_w\times C_{\mathrm{in}}\times C_{\mathrm{out}}
}
$$

每个输出通道学习一种局部模式。

## 参数共享

同一个核在所有空间位置使用相同权重。

参数数目：

$$
k_hk_wC_{\mathrm{in}}C_{\mathrm{out}}
$$

与输入图像的 $H$、$W$ 无关。

这提高统计效率，并带来对平移的等变性。

## 输出尺寸

一维尺寸下，输入 $n$、核 $k$、padding $p$、stride $s$，输出：

$$
n_{\mathrm{out}}
=
\left\lfloor
\frac{n+2p-k}{s}
\right\rfloor+1
$$

二维高度和宽度分别计算。

尺寸错误是 CNN 实现中最常见问题之一。每层都应显式记录：

```text
batch × height × width × channels
```

或框架使用的 `NCHW` 约定。

## Padding

无 padding 的 valid 卷积会缩小空间尺寸。

适当 padding 可以保持尺寸。奇数核、stride 1 时，常取：

$$
p=\frac{k-1}{2}
$$

边界处 padding 值是人为假设。零填充、反射填充和复制填充会产生不同边缘行为。

## Stride

stride 大于 $1$ 会降低空间分辨率。

它减少计算，但可能跳过细节并产生 aliasing。

下采样前使用平滑或学习到的降采样可降低混叠风险。

## Pooling

Max pooling：

$$
y=\max_{x\in R}x
$$

Average pooling：

$$
y=\frac1{|R|}\sum_{x\in R}x
$$

Pooling 降低空间尺寸并扩大有效感受野。

现代网络也常用带 stride 的卷积替代固定 pooling。

## 感受野

某层单元的感受野，是输入中能够影响它的区域。

堆叠多个小卷积可以逐渐扩大感受野，并在层间加入非线性。

理论感受野覆盖大区域，不表示所有位置贡献相同；有效感受野通常更集中。

## 平移等变与不变

卷积近似满足：

```text
输入平移
→ 特征图相应平移
```

这是等变性。

分类最终希望输出对小平移较稳定，可通过 pooling、全局平均和数据增强获得近似不变性。

Padding、stride 和边界会破坏严格等变。

## 典型 CNN 块

```text
Convolution
→ Normalization
→ Activation
→ Downsampling
```

多次堆叠后：

```text
Global Average Pooling
→ Linear Classifier
```

具体顺序随架构而异，但 shape、激活尺度和下采样节奏始终需要检查。

## 反向传播

卷积层梯度同样来自链式法则。

由于参数共享，一个核权重的梯度是它在所有空间位置使用时产生的梯度之和。

输入梯度可理解为把上游梯度通过相应翻转/转置卷积传播回输入位置。

实际使用自动微分，但仍应对小卷积做数值梯度检查。

## 数据增强

可使用：

- 随机裁剪；
- 水平翻转；
- 颜色扰动；
- 旋转；
- Mixup 或 CutMix。

增强必须保持标签语义。例如数字识别中任意旋转可能改变类别，医学影像翻转也可能破坏左右侧信息。

训练增强与验证预处理要分开。

## 迁移学习

数据较少时，可以使用预训练 CNN：

1. 替换任务输出头；
2. 先冻结 backbone 训练新头；
3. 再用较小学习率微调部分或全部层。

预训练数据与目标领域差异大时，迁移收益会下降，甚至引入不合适偏差。

## CNN 诊断

- 先在极小图像集上过拟合；
- 可视化增强后的真实输入；
- 检查通道顺序与归一化；
- 记录每层 shape；
- 检查激活和梯度；
- 按类别查看混淆矩阵；
- 检查背景、边框或水印捷径；
- 使用遮挡、反事实或跨域测试验证模型依赖。

高准确率可能来自数据泄漏或背景捷径，而不是目标物体。

## 本节检查

- 能说明局部连接与参数共享解决什么问题；
- 能计算卷积输出尺寸；
- 能区分 padding、stride 与 pooling；
- 能解释感受野和空间等变性；
- 能写出卷积参数数量；
- 能说明共享权重梯度来自所有位置累加；
- 能设计保持标签语义的数据增强；
- 能用小样本过拟合和可视化诊断 CNN。

至此，B 站 28 个分集全部对应到独立课程页面。返回 [逐课课程目录](/notes/cs229/course) 复习。

## 来源说明

- 视频：[B 站 P28：CNN Discussion Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=28)
- Slides：[Deep Learning Friday PPTX](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229_deep_learning_friday.pptx)

该仓库只保留原始 PPTX，没有 PDF 版；页面因此提供材料下载和中文完整讲解，不伪造 PDF 对照。
