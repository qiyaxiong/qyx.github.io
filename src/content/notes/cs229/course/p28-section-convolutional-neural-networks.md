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

## 二维卷积的具体计算

![使用 im2col 将局部多通道卷积转换为矩阵乘法](/images/notes/cs229/tikz/p28-im2col-convolution.png)

单通道输入：

$$
X=
\begin{bmatrix}
1&2&0\\
0&1&3\\
2&1&0
\end{bmatrix}
$$

卷积核：

$$
K=
\begin{bmatrix}
1&0\\
0&-1
\end{bmatrix}
$$

使用 stride 1、无 padding，左上角输出：

$$
1\cdot1
+
2\cdot0
+
0\cdot0
+
1\cdot(-1)
=0
$$

右移一格：

$$
2\cdot1
+
0\cdot0
+
1\cdot0
+
3\cdot(-1)
=-1
$$

继续滑动得到 $2\times2$ 输出。

深度学习库中的“卷积”通常实际执行 cross-correlation，不翻转 Kernel。权重可学习，因此命名差异不影响表达能力，但手算时要与框架定义一致。

## 多通道卷积

![多通道卷积在局部空间窗口和输入通道上的联合收缩](/images/notes/cs229/tikz/p28-multichannel-convolution.png)

输入：

$$
X\in
\mathbb R^{C_{in}\times H\times W}
$$

一个输出通道的 Kernel：

$$
K_j
\in
\mathbb R^{C_{in}\times K_h\times K_w}
$$

它跨所有输入通道求和，产生一个二维特征图。

有 $C_{out}$ 个 Kernel，就得到：

$$
Y
\in
\mathbb R^{C_{out}\times H_{out}\times W_{out}}
$$

参数量：

$$
C_{out}
\left(
C_{in}K_hK_w+1
\right)
$$

其中 $1$ 是每个输出通道的偏置。

参数量与输入图像空间尺寸无关，这是卷积相对全连接层的重要优势。

## 输出尺寸公式

单个空间维度：

$$
H_{out}
=
\left\lfloor
\frac{
H+2P-D(K-1)-1
}{
S
}
\right\rfloor
+1
$$

$P$ 是 padding，$S$ 是 stride，$D$ 是 dilation。

当 $D=1$：

$$
H_{out}
=
\left\lfloor
\frac{H+2P-K}{S}
\right\rfloor
+1
$$

例如 $H=32,K=3,P=1,S=1$，输出仍为 32。

若 $S=2$，输出约减半。网络设计时要逐层计算空间尺寸，避免在分类头才发现张量形状错误。

## 感受野如何增长

连续两个 $3\times3$、stride 1 卷积的有效感受野是 $5\times5$，三个是 $7\times7$。

多层小 Kernel 相比一个大 Kernel：

- 参数更少；
- 插入更多非线性；
- 计算通常更高效。

stride 或 pooling 会让后续一个单元跨越更大的输入区域，加速感受野增长。

理论感受野不等于有效感受野。实际梯度贡献常集中在中心区域，应结合可视化和任务验证。

## 卷积的等变性

忽略边界效应，输入平移后，卷积输出也相应平移：

$$
\operatorname{Conv}(T_\Delta x)
=
T_\Delta\operatorname{Conv}(x)
$$

这叫平移等变，不是平移不变。

分类输出希望对小平移近似不变，通常通过 pooling、stride、全局平均和数据增强逐步获得。

Padding、边界、下采样和离散像素会破坏严格等变性。

## Pooling 的作用与代价

Max Pooling 保留局部最大响应：

$$
y
=
\max_{i\in\text{window}}x_i
$$

Average Pooling 保留局部平均。

Pooling 降低空间分辨率、计算和小位移敏感性，但会丢失精确位置信息。

现代架构也常使用 stride convolution 代替 pooling，让下采样方式可学习。

检测、分割等密集预测任务不能过早丢失空间信息，常使用跳跃连接和上采样恢复细节。

## 卷积层反向传播

前向中一个 Kernel 权重在所有空间位置共享，因此其梯度是所有使用位置贡献之和。

对某个权重 $K_{a,b}$：

$$
\frac{\partial L}{\partial K_{a,b}}
=
\sum_{i,j}
\frac{\partial L}{\partial Y_{i,j}}
X_{i+a,j+b}
$$

输入梯度把输出梯度通过 Kernel 分配回所有覆盖位置。

权重共享既减少参数，也让同一模式在不同位置共同更新。

实现通常由自动微分完成，但 shape、padding 和 stride 错误仍需通过小矩阵数值检查定位。

## 典型 CNN 架构块

基础块：

```text
Conv
→ Normalization
→ Activation
```

重复若干次后下采样。

残差块：

$$
y=F(x)+x
$$

跳跃连接为梯度提供直接路径，使深层网络更易优化。

当通道或空间尺寸变化时，捷径分支可使用 $1\times1$ 卷积对齐。

分类尾部常使用 Global Average Pooling，把每个通道的空间平均作为特征，再接线性分类层。

## 数据增强

增强应保持标签语义。

图像分类常用：

- 随机裁剪；
- 水平翻转；
- 颜色抖动；
- 随机擦除；
- Mixup 或 CutMix。

数字识别不能随意垂直翻转，医学影像也可能有方向和强度约束。

增强只用于训练。验证和测试使用确定性预处理，以保证可重复比较。

## 迁移学习协议

数据较少时，可使用预训练网络。

第一阶段冻结 backbone，只训练新分类头，验证数据与标签管道。

第二阶段用更小学习率解冻后几层或全部网络微调。

输入归一化必须匹配预训练模型。分类头输出维度与新任务类别数一致。

应与“冻结特征 + 线性分类器”基线比较，判断微调是否真正带来收益。

预训练数据与目标领域差异很大时，迁移收益可能有限，也可能继承原数据偏差。

## CNN 系统诊断

若训练损失不下降：

- 检查标签和类别索引；
- 在少量图片上过拟合；
- 可视化增强后输入；
- 检查 logits 与损失组合；
- 监控梯度和激活。

若训练好、验证差：

- 增强和正则；
- 检查重复图片泄漏；
- 按拍摄主体或来源分组划分；
- 简化模型或增加数据。

若某类表现差：

- 查看混淆矩阵；
- 可视化该类错例；
- 检查裁剪、尺度、遮挡和背景偏差；
- 统计每类样本与标签质量。

## 练习与答案思路

### 练习 1：参数量

输入 3 通道，卷积有 64 个 $3\times3$ Kernel，含偏置，参数量是多少？

答案：

$$
64(3\times3\times3+1)=1792
$$

### 练习 2：输出尺寸

输入 $28\times28$，Kernel 5，padding 0，stride 1，输出多大？

答案：$24\times24$。

### 练习 3：等变与不变

卷积本身对平移是等变还是不变？

答案：等变。输入平移会让特征图相应平移。

### 练习 4：数据划分

同一患者的多张影像能否随机分到训练和测试两侧？

答案：不应。模型可能记住患者或设备，应按患者分组划分。

## $1\times1$ 卷积

$1\times1$ 卷积不聚合空间邻域，但在每个位置混合通道：

$$
y_{:,i,j}
=
W
x_{:,i,j}
+b
$$

它可以：

- 改变通道数；
- 构造瓶颈；
- 在残差捷径中对齐维度；
- 以较低成本加入通道非线性变换。

参数量：

$$
C_{out}(C_{in}+1)
$$

## Depthwise Separable Convolution

普通卷积参数：

$$
C_{out}C_{in}K^2
$$

Depthwise 先为每个输入通道独立做空间卷积：

$$
C_{in}K^2
$$

再用 $1\times1$ Pointwise 混合通道：

$$
C_{in}C_{out}
$$

总参数显著减少。

MobileNet 等轻量架构使用这一结构换取移动端效率。

参数少不保证实际延迟一定低，仍需在目标硬件 benchmark。

## Dilated Convolution

Dilation 在 Kernel 元素间插入间隔。

有效 Kernel 大小：

$$
K_{\text{eff}}
=
D(K-1)+1
$$

$K=3,D=2$ 时有效覆盖 5。

它在不增加参数和不降低分辨率的情况下扩大感受野。

连续相同 dilation 可能产生 gridding artifact，需要组合不同 dilation。

## Transposed Convolution

Transposed Convolution 是卷积线性算子的转置结构，用于学习上采样。

它不是普通卷积的数学逆。

Kernel 与 stride 配置不当会产生 checkerboard artifact。

替代方式是先插值上采样，再做普通卷积。

分割和生成任务应比较两者的视觉与指标。

## Receptive Field 计算

设第 $l$ 层 jump：

$$
j_l
=
j_{l-1}s_l
$$

感受野：

$$
r_l
=
r_{l-1}
+
(k_l-1)d_lj_{l-1}
$$

初始：

$$
r_0=1,
\qquad
j_0=1
$$

这可精确计算任一深层单元覆盖原图范围。

检测小对象时，过早大 stride 会让空间信息丢失。

## BatchNorm 与 Conv

卷积 BatchNorm 通常对每个通道统计，聚合 batch 与空间位置。

小 batch 时统计不稳定。

迁移学习中冻结 backbone 但 BatchNorm 仍更新 running statistics，可能破坏预训练表示。

应明确：

```text
参数是否训练
running stats 是否更新
推理使用哪组统计
```

## Residual Network

残差块：

$$
y=x+F(x)
$$

若最优变换接近恒等，网络只需学习小残差。

反向梯度包含直接路径：

$$
\frac{\partial y}{\partial x}
=
I
+
\frac{\partial F}{\partial x}
$$

这缓解深层优化，但不等于梯度永远不会消失。

Pre-activation、Normalization 和初始化仍重要。

## CNN 可解释与偏差

Saliency Map 显示输出对像素梯度，但可能噪声大且不稳定。

Grad-CAM 使用特征图与梯度产生粗粒度热图。

遮挡测试直接遮住区域观察预测变化。

这些方法说明模型敏感区域，不证明因果，也可能被后处理误导。

检查模型是否依赖背景、水印、边框和拍摄设备。

## Adversarial 与自然扰动

极小定向扰动可能改变预测。

自然扰动包括：

- 模糊；
- 压缩；
- 光照；
- 旋转；
- 遮挡；
- 摄像头变化。

评价应覆盖与部署相关的扰动。

普通数据增强只提高见过类型的稳健性，不保证对所有分布外输入安全。

## CNN 效率指标

报告：

```text
参数量
FLOPs/MACs
峰值显存
batch 吞吐
单样本延迟
模型文件大小
目标设备能耗
```

FLOPs 相同的算子在不同硬件上延迟可能不同。

移动端还要考虑量化、算子支持和内存带宽。

## 量化

FP32 权重可量化到 INT8。

Post-training Quantization 不重新训练，简单但可能损失精度。

Quantization-aware Training 在训练中模拟量化误差，通常保持更好性能。

必须在目标硬件和真实切片重新评价，尤其关注小类别与边界样本。

## CNN 完整项目

选择 CIFAR-10 或小型领域图像：

1. 线性像素基线；
2. 小 CNN；
3. 输出 shape 和参数手算；
4. 数据增强；
5. BatchNorm；
6. 残差块；
7. 迁移学习；
8. 混淆矩阵；
9. 错例与热图；
10. 延迟和量化。

按实体分组划分，保存最佳 checkpoint，并报告多 seed。

## 补充练习

### 练习 5：Depthwise 参数

$C_{in}=32,C_{out}=64,K=3$，忽略偏置，Depthwise Separable 参数是多少？

答案：

$$
32\times9+32\times64=2336
$$

### 练习 6：Dilation

$K=3,D=3$ 的有效 Kernel 大小是多少？

答案：

$$
3(3-1)+1=7
$$

### 练习 7：量化

量化后总体 Accuracy 只降 0.1%，是否足够？

答案：不一定，还要检查关键类别、校准、延迟和目标设备真实执行。

## 一套 CNN Shape 手算

输入：

$$
(N,3,32,32)
$$

第一层 `Conv(3→32, K=3, P=1)`：

$$
(N,32,32,32)
$$

`MaxPool(K=2,S=2)`：

$$
(N,32,16,16)
$$

第二层 `Conv(32→64, K=3, P=1)`：

$$
(N,64,16,16)
$$

再次 Pool：

$$
(N,64,8,8)
$$

Global Average Pool：

$$
(N,64)
$$

Linear 到 10 类：

$$
(N,10)
$$

在写代码前完成这张表，可避免 flatten 维度硬编码错误。

## 参数手算

第一卷积：

$$
32(3\times3\times3+1)=896
$$

第二卷积：

$$
64(32\times3\times3+1)=18496
$$

分类层：

$$
10(64+1)=650
$$

总参数：

$$
20042
$$

Pooling 和 ReLU 没有可训练参数。

## 图像数据泄漏

常见泄漏：

- 同一视频相邻帧跨 split；
- 同一患者多张片子跨 split；
- 增强版本跨 split；
- 文件名或边框编码标签；
- 测试集参与归一化；
- 预训练数据包含 benchmark。

图像看起来不同不代表独立。划分单位应是产生相关图像的实体或事件。

## 讲义对照阅读路线

Discussion Slides 按：

```text
局部连接
参数共享
输出 shape
Pooling
典型架构
训练
```

每一层都写：

```text
输入
Kernel
Stride
Padding
输出
参数量
感受野
```

选择一张图片可视化前两层 feature maps，检查不是全零或完全饱和。

## 补充练习

### 练习 8：Flatten

若不用 Global Average Pool，`(N,64,8,8)` flatten 后维度是多少？

答案：$64\times8\times8=4096$。

### 练习 9：泄漏

同一视频的相邻帧随机跨训练测试会怎样？

答案：画面近重复，测试分数严重高估对新视频泛化。

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
