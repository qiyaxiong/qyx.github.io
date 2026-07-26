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
