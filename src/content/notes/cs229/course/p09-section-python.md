---
title: P9：讨论课——Python 与向量化
description: 对应 B 站 P9 和 2018-10-12 Discussion Section，用 NumPy 的 shape、广播和矩阵运算实现可验证的机器学习代码。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 为什么向量化不是语法技巧

机器学习公式通常描述整批样本。向量化让代码结构贴近数学结构：

$$
\nabla_\theta J
=X^\top(X\theta-y)
$$

对应：

```python
gradient = X.T @ (X @ theta - y)
```

它减少 Python 循环开销，也减少循环索引、累加顺序和维度处理中的错误。

## ndarray 与 shape

NumPy 一维数组：

```python
x.shape == (n,)
```

不是明确的行向量或列向量。二维列向量：

```python
x.shape == (n, 1)
```

二维行向量：

```python
x.shape == (1, n)
```

三者在转置和广播时行为不同。机器学习实现应在接口处明确约定，不依赖“碰巧能算”。

## 建议的批数据约定

使用：

```text
X: (m, n)
y: (m,)
theta: (n,)
prediction: (m,)
```

则：

```python
prediction = X @ theta
```

若使用列向量体系，也必须始终一致：

```text
y: (m, 1)
theta: (n, 1)
```

不要在同一实现中反复混用。

## 索引与切片

```python
X[i]
```

通常得到 shape `(n,)`。

```python
X[i : i + 1]
```

保留二维 shape `(1, n)`。

```python
X[:, j]
```

得到一维列内容；而：

```python
X[:, j : j + 1]
```

保留 `(m, 1)`。

是否保留维度会影响后续矩阵乘法与广播。

## 广播

若：

```text
X: (m, n)
mu: (n,)
```

则：

```python
X_centered = X - mu
```

会把 `mu` 广播到每一行，这是预期行为。

危险情况是：

```text
a: (m, 1)
b: (m,)
```

执行 `a - b` 可能得到 `(m, m)`，而不是 `(m, 1)`。代码能运行，但结果完全错误。

因此关键计算前后要断言 shape。

## 矩阵乘法与逐元素乘法

```python
A @ B
```

表示矩阵乘法。

```python
A * B
```

表示逐元素乘法。

线性预测应使用：

```python
X @ theta
```

不是 `X * theta`。后者依赖广播，输出仍是矩阵。

## 向量化线性回归

预测：

```python
pred = X @ theta
```

残差：

```python
residual = pred - y
```

平均平方损失：

```python
loss = 0.5 * np.mean(residual**2)
```

梯度：

```python
gradient = X.T @ residual / X.shape[0]
```

整个实现与数学公式逐项对应。

## 向量化逻辑回归

logits：

```python
z = X @ theta
```

概率：

```python
p = sigmoid(z)
```

梯度：

```python
gradient = X.T @ (p - y) / X.shape[0]
```

损失不要直接写 `np.log(sigmoid(z))`，应使用稳定的 `logaddexp`：

```python
loss = np.mean(np.logaddexp(0, z) - y * z)
```

## 随机数与可复现

使用显式生成器：

```python
rng = np.random.default_rng(seed)
```

训练、验证、测试划分前设置种子，并记录：

- 数据版本；
- 划分索引；
- 随机种子；
- 依赖版本；
- 预处理参数。

同一随机种子并不保证跨硬件、跨库版本完全逐位一致，但能显著改善复现实验。

## 数据泄漏

标准化参数只能用训练集估计：

```python
mu = X_train.mean(axis=0)
sigma = X_train.std(axis=0)
```

然后同样应用到验证和测试集。

如果先在全部数据上计算均值和方差，测试集信息已经进入训练流程。

词表、缺失值填充、PCA 方向和特征筛选也遵循同一原则。

## Notebook 与模块代码

Notebook 适合探索、绘图和记录推导，但容易产生隐藏状态：

- 单元格执行顺序与页面顺序不同；
- 旧变量留在内存；
- 修改函数后没有重新运行依赖单元；
- 输出来自旧数据。

提交前应重启 kernel，从头运行全部单元。核心模型逻辑最好放入普通 `.py` 模块，由 Notebook 调用。

## 最小实现验证

在大数据训练前，先使用能手算的小样本：

```text
X = [[1, 0],
     [1, 1]]
y = [0, 1]
```

检查：

- 预测 shape；
- 损失为标量；
- 梯度方向；
- 一步更新后损失是否下降；
- 数值梯度是否与解析梯度一致。

## 用 shape 设计数据接口

机器学习代码最常见的错误不是语法错误，而是形状正确却语义错误。

建议固定以下约定：

```text
X: (batch, features)
y: (batch,)
theta: (features,)
scores: (batch,)
```

多分类时：

```text
logits: (batch, classes)
labels: (batch,)
one_hot: (batch, classes)
```

每个函数都应在文档或类型注释中声明输入、输出形状。重要边界使用断言：

```python
assert X.ndim == 2
assert y.ndim == 1
assert X.shape[0] == y.shape[0]
assert theta.shape == (X.shape[1],)
```

不要依赖 NumPy 猜测一维数组是行向量还是列向量。需要矩阵时明确使用 `(n, 1)` 或 `(1, n)`。

## 广播规则逐步判断

NumPy 从最后一个维度向前比较。两个维度兼容，当且仅当它们相等，或其中一个是 $1$。

例如：

```text
X:  (128, 32)
mu:      (32,)
```

`X - mu` 合法，`mu` 被视为 `(1, 32)` 并沿 batch 轴广播。

但：

```text
scores: (128, 1)
labels:    (128,)
```

相减会广播为 `(128, 128)`，程序不报错，却完全改变计算含义。

解决方式是统一都使用 `(128,)`，或把标签显式变成 `(128, 1)`。

任何损失计算后都应断言结果为标量：

```python
loss = binary_cross_entropy(scores, labels)
assert np.ndim(loss) == 0
```

## 向量化来自代数结构

向量化不是把 `for` 循环机械删除，而是先写出矩阵关系。

线性回归逐样本预测：

$$
\hat y^{(i)}=\theta^\top x^{(i)}
$$

把样本作为矩阵的行：

$$
\hat y=X\theta
$$

梯度：

$$
\nabla_\theta J
=
\frac1m
X^\top(X\theta-y)
$$

NumPy 实现：

```python
residual = X @ theta - y
gradient = X.T @ residual / X.shape[0]
```

矩阵表达不仅更快，也更接近数学推导，更容易检查维度和复用高性能底层库。

## 稳定实现 Logistic Loss

直接计算：

```python
p = 1 / (1 + np.exp(-z))
loss = -(y * np.log(p) + (1-y) * np.log(1-p))
```

当 $|z|$ 很大时可能出现溢出或 `log(0)`。

使用 logits 的稳定形式：

$$
\ell(z,y)
=
\max(z,0)-yz+\log(1+e^{-|z|})
$$

NumPy 可以写成：

```python
loss = np.maximum(z, 0) - y * z + np.log1p(np.exp(-np.abs(z)))
```

梯度仍是：

```python
gradient = X.T @ (sigmoid(z) - y) / len(y)
```

成熟框架应优先使用 `binary_cross_entropy_with_logits` 一类函数。

## 随机数与实验复现

只在脚本开头设置一次全局随机种子通常不够。数据划分、初始化、数据增强和并行 worker 都可能消耗随机状态。

建议显式创建随机数生成器：

```python
rng = np.random.default_rng(seed)
indices = rng.permutation(len(X))
theta = rng.normal(0, 0.01, size=n_features)
```

实验记录至少保存：

- 代码提交 SHA；
- 数据版本和划分索引；
- 随机种子；
- 依赖版本；
- 超参数；
- 训练和验证指标。

复现不是要求浮点结果每一位都相同，而是能重建相同实验条件并得到统计一致的结论。

## 防止数据泄漏的 Pipeline

预处理器只能在训练集上 `fit`：

```python
scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_dev = scaler.transform(X_dev)
X_test = scaler.transform(X_test)
```

缺失值填充、词表构建、PCA、特征选择和类别重采样都遵循同一规则。

更安全的做法是把预处理与模型封装为一个 Pipeline，让交叉验证在每个 fold 内重新拟合预处理器。

时间序列不能随机打乱后切分。必须按时间顺序模拟“用过去预测未来”，并保证窗口特征不读取预测时刻之后的信息。

## 从 Notebook 走向可测试模块

Notebook 适合探索，但单元格可乱序执行，隐藏状态容易造成“重启后无法运行”。

完成探索后，把稳定逻辑拆成纯函数：

```python
def fit_preprocessor(X_train):
    ...

def transform(preprocessor, X):
    ...

def loss_and_gradient(theta, X, y):
    ...

def evaluate(theta, X, y):
    ...
```

纯函数输入输出明确，便于单元测试和复用。Notebook 只负责串联实验、展示图表和记录结论。

## 最小测试集合

### Shape 测试

使用极小矩阵检查每一步输出维度。

### 数值梯度测试

比较解析梯度与中心差分。

### 过拟合小批量

模型应能在极小训练集上把损失降得很低。做不到通常说明实现或优化有问题。

### 置换标签测试

随机打乱标签后，验证表现应接近随机水平。若仍然很好，可能存在泄漏。

### 基线测试

与均值预测、多数类或成熟库实现比较。

## 练习与答案思路

### 练习 1：广播陷阱

`a.shape == (5, 1)`，`b.shape == (5,)`，`a-b` 的形状是什么？

答案：`(5, 5)`。应先统一两个数组的语义和维度。

### 练习 2：矩阵乘法

`X * theta` 与 `X @ theta` 有什么差别？

答案：前者是逐元素乘法并可能广播；后者执行矩阵—向量乘法。

### 练习 3：泄漏判断

在全数据上标准化后再做五折交叉验证是否正确？

答案：不正确。每一折的标准化参数必须只由该折训练部分估计。

### 练习 4：调试顺序

训练结果异常时，应先扩大数据和模型，还是先让模型过拟合十个样本？

答案：先过拟合极小数据，验证前向、损失、梯度和更新链路正确。

## dtype 与数值范围

NumPy 默认浮点通常是 `float64`，深度学习框架常用 `float32`。

`float32` 内存更小、硬件吞吐高，但有效精度和表示范围低于 `float64`。

梯度检查和病态线性代数可临时使用 `float64`。

整数数组执行除法或写入浮点结果时要检查 dtype。标签索引通常是整数，模型输入和参数通常是浮点。

不要把缺失值填成极大哨兵数却不加指示，它可能导致溢出和错误距离。

训练中统一监控：

```python
np.isfinite(loss)
np.isfinite(parameters).all()
np.isfinite(gradients).all()
```

## 内存布局与复制

切片可能返回 view，也可能产生 copy。

对 view 原地修改可能改变原数组：

```python
part = X[:, :3]
part[:] = 0
```

如果需要独立数据，显式：

```python
part = X[:, :3].copy()
```

高级索引和布尔索引通常产生 copy。

大型数组中，无意复制会让内存突然翻倍。可用：

```python
array.flags
np.shares_memory(a, b)
```

检查。

连续内存布局会影响底层矩阵库性能，但不要在没有 profiling 前进行复杂微优化。

## 批处理与内存估算

一个 `float32` 占 4 字节。

若 batch 为 1024、特征为 100000，稠密矩阵需要：

$$
1024\times100000\times4
\approx409.6\text{ MB}
$$

还没计算中间激活、梯度与参数。

稀疏数据应使用 CSR/CSC 等结构。Mini-batch 大小根据内存、吞吐和优化噪声共同选择。

数据集太大时，使用迭代器、memory map、分块读取或数据加载器，不要一次性全部载入。

## 性能优化顺序

第一步保证正确，并写出基准测试。

第二步 profiling，找到实际瓶颈。不要凭感觉优化。

第三步优先消除 Python 层逐元素循环，用 NumPy 向量化或成熟库函数。

第四步减少不必要复制和格式转换。

第五步才考虑并行、JIT、GPU 或自定义算子。

如果数据读取占 80% 时间，优化矩阵乘法不会显著改善总耗时。

## 数据校验

读取数据后自动检查：

```text
行数与唯一 ID 数
重复样本
标签范围
缺失比例
数值范围
类别分布
时间范围
训练/验证重叠
```

建立 schema：

```python
assert df["age"].between(0, 120).all()
assert set(df["label"].unique()) <= {0, 1}
assert df["id"].is_unique
```

训练前后的数据统计应保存，线上同样监控。

## 面向对象与纯函数的边界

预处理器和模型需要保存状态，适合对象：

```python
class StandardScaler:
    def fit(self, X):
        self.mean_ = ...
        self.scale_ = ...
        return self

    def transform(self, X):
        return (X - self.mean_) / self.scale_
```

损失、指标和基础变换可保持纯函数，便于测试。

对象接口应明确 `fit` 是否修改状态，`transform` 是否允许训练前调用，保存与加载包含哪些字段。

## 测试数据要小而有辨识力

随机大数组不容易手工确认结果。

为矩阵乘法使用简单整数：

$$
X=
\begin{bmatrix}
1&2\\3&4
\end{bmatrix},
\quad
\theta=
\begin{bmatrix}
1\\-1
\end{bmatrix}
$$

预期：

$$
X\theta=
\begin{bmatrix}
-1\\-1
\end{bmatrix}
$$

为标准化测试常数列、缺失值和单样本。

为分类损失测试极大正负 logits，确认结果有限。

边界样本比大量随机样本更能发现实现缺陷。

## 完整作业结构

把本节 Notebook 改造成可运行包：

```text
src/
  dataset.py
  preprocessing.py
  linear_model.py
  metrics.py
tests/
  test_preprocessing.py
  test_gradients.py
  test_metrics.py
scripts/
  train.py
  evaluate.py
```

`train.py` 接收配置并保存模型、预处理器、指标和元数据。

`evaluate.py` 只加载已保存产物，不重新拟合任何预处理。

测试命令与运行说明写入 README。

## 补充练习

### 练习 5：内存

一亿个 `float64` 约占多少内存？

答案：每个 8 字节，共约 800 MB，尚未计容器开销。

### 练习 6：View

修改切片为何可能改变原数组？

答案：基本切片可能共享同一底层内存，是 view。

### 练习 7：性能

程序慢时第一步是否应改写成 GPU？

答案：不应。先 profiling，确认瓶颈与正确性，再选择优化手段。

## 本节检查

- 能区分 `(n,)`、`(n,1)` 和 `(1,n)`；
- 能解释 `@` 与 `*` 的差别；
- 能识别广播产生 `(m,m)` 的隐蔽错误；
- 能向量化线性回归和逻辑回归梯度；
- 能稳定计算 logits 交叉熵；
- 能避免预处理中的数据泄漏；
- 能控制随机性并记录实验条件；
- 能重启 Notebook 后从头复现实验。

下一节进入 [P10：Kernel](/notes/cs229/course/p10-kernels)。

## 来源说明

- 视频：[B 站 P9：Python Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=9)
- Slides：[Python Tutorial，共 40 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229_python_tutorial/cs229_python_friday.pdf)
- Notebook：[Spring 2020 Python Tutorial](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229_python_tutorial/Spring_2020_Notebook.ipynb)

中文内容对应讨论课的 NumPy、向量化和实现检查目标。
