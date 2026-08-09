import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const sourceDir = join(root, "src/visuals/tikz/cs229/storyboards");
const outputDir = join(root, "public/images/notes/cs229/storyboards");
const tectonic = process.env.TECTONIC ?? "/opt/homebrew/bin/tectonic";

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const preamble = String.raw`
\documentclass[tikz,border=8pt]{standalone}
\usepackage[UTF8,fontset=fandol]{ctex}
\usepackage{amsmath,amssymb}
\usetikzlibrary{arrows.meta,calc,positioning}
\definecolor{ink}{HTML}{172033}
\definecolor{muted}{HTML}{637083}
\definecolor{blue}{HTML}{4F86C6}
\definecolor{green}{HTML}{61A66A}
\definecolor{red}{HTML}{D55E5E}
\definecolor{amber}{HTML}{D59B3D}
\definecolor{paperblue}{HTML}{F2F7FD}
\definecolor{papergreen}{HTML}{F3F9F1}
\definecolor{paperamber}{HTML}{FFF8E8}
\tikzset{
  panel/.style={anchor=north west,minimum width=9.15cm,minimum height=6.05cm,
    text width=8.45cm,align=left,inner sep=10pt,draw=black!12,rounded corners=5pt,fill=white},
  title/.style={font=\bfseries\large,text=ink,anchor=west},
  body/.style={font=\small,text=muted,align=left,text width=7.9cm},
  formula/.style={draw=blue!35,fill=paperblue,rounded corners=4pt,inner sep=8pt,
    text=ink,align=center,text width=7.7cm},
  insight/.style={draw=green!40,fill=papergreen,rounded corners=4pt,inner sep=7pt,
    text=ink,align=left,text width=7.7cm,font=\small},
  arrow/.style={-{Latex[length=2.3mm]},line width=1pt,draw=blue!70},
  chip/.style={rounded corners=3pt,draw=black!14,fill=black!2,inner xsep=7pt,
    inner ysep=5pt,font=\small,text=ink},
}
\newcommand{\Panel}[5]{%
  \node[panel] (#1) at (#2,#3) {};
  \node[title] at ($(#1.north west)+(0.35,-0.42)$) {#4};
  \node[body,anchor=north west] at ($(#1.north west)+(0.35,-1.05)$) {#5};
}
\newcommand{\Summary}[1]{%
  \node[draw=amber!35,fill=paperamber,rounded corners=6pt,minimum width=28.2cm,
    minimum height=1.55cm,text width=27.2cm,align=center,font=\small,text=ink]
    at (14.125,-13.35) {\textbf{一图总结}\quad #1};
}
\newcommand{\Identity}{%
  \node[font=\scriptsize,text=black!38,anchor=east] at (28.15,-14.35)
    {cs229-storyboard@五道口纳什};
}
\newcommand{\Formula}[1]{%
  \par\vspace{5pt}\begingroup\setlength{\fboxsep}{8pt}%
  \colorbox{paperblue}{\parbox{7.45cm}{\centering\color{ink}#1}}%
  \endgroup\par\vspace{6pt}}
\newcommand{\Insight}[1]{%
  \par\vspace{5pt}\begingroup\setlength{\fboxsep}{7pt}%
  \colorbox{papergreen}{\parbox{7.55cm}{\color{ink}#1}}%
  \endgroup\par\vspace{6pt}}
\newcommand{\Chip}[1]{%
  \begingroup\setlength{\fboxsep}{5pt}\colorbox{black!4}{\strut\color{ink}#1}\endgroup}
`;

const diagrams = [
  {
    id: "p01-ml-workflow-storyboard",
    panels: [
      ["1. 先定义任务", String.raw`明确输入 $x$、输出 $y$ 与成功标准。\Formula{监督学习：$(x,y)$\\无监督学习：只有 $x$}指标必须对应真实业务目标。`],
      ["2. 数据决定上限", String.raw`训练集只是未来数据的样本。\Insight{先检查标签质量、采样偏差、时间泄漏和覆盖范围，再讨论模型。}`],
      ["3. 选择表示与假设", String.raw`特征把原始对象映射到模型可处理的空间：\Formula{$x\xrightarrow{\phi}\phi(x)\xrightarrow{h_\theta}\hat y$}模型假设决定可表达范围。`],
      ["4. 用损失训练", String.raw`把预测错误压成一个可优化标量：\Formula{$\hat\theta=\arg\min_\theta\dfrac1m\sum_i\ell(h_\theta(x_i),y_i)$}`],
      ["5. 用未见数据评价", String.raw`\Chip{训练集：拟合}\quad\Chip{验证集：选择}\quad\Chip{测试集：一次验收}不要用测试集反复调参。`],
      ["6. 部署后仍要闭环", String.raw`\Insight{监控输入漂移、性能衰减、延迟和反馈偏差；出现问题时回到数据与目标，而不只是换模型。}`],
    ],
    summary: String.raw`任务定义 $\rightarrow$ 数据 $\rightarrow$ 表示与模型 $\rightarrow$ 优化 $\rightarrow$ 离线评价 $\rightarrow$ 线上监控。`,
  },
  {
    id: "p03-linear-algebra-storyboard",
    panels: [
      ["1. 向量表示一个对象", String.raw`向量的每个坐标对应一个特征轴。\Formula{$x\in\mathbb R^n,\qquad \lVert x\rVert_2=\sqrt{x^\top x}$}内积同时给出长度与夹角。`],
      ["2. 矩阵表示线性变换", String.raw`\Formula{$A:\mathbb R^n\to\mathbb R^m,\qquad y=Ax$}矩阵乘法是“先组合输入方向，再得到输出坐标”。`],
      ["3. 秩描述有效方向", String.raw`\Formula{$\operatorname{rank}(A)\le\min(m,n)$}秩不足意味着有方向被压扁；求逆或回归时会出现不可辨识。`],
      ["4. 特征向量是不转向的方向", String.raw`\Formula{$Av=\lambda v$}变换只改变它的尺度。对称矩阵拥有正交特征向量，可作为新的坐标轴。`],
      ["5. SVD 拆解任意矩阵", String.raw`\Formula{$A=U\Sigma V^\top$}先沿 $V$ 旋转，按奇异值缩放，再沿 $U$ 旋转。`],
      ["6. 最小二乘使用投影", String.raw`\Insight{$Ax\approx b$ 的最优残差与 $A$ 的列空间正交：$A^\top(b-Ax)=0$。}`],
    ],
    summary: String.raw`向量与内积 $\rightarrow$ 线性变换 $\rightarrow$ 秩 $\rightarrow$ 特征分解 $\rightarrow$ SVD $\rightarrow$ 投影求解。`,
  },
  {
    id: "p05-glm-storyboard",
    panels: [
      ["1. 感知机只关心分对没有", String.raw`\Formula{$\hat y=\operatorname{sign}(\theta^\top x)$}错分样本触发更新：$\theta\leftarrow\theta+\alpha yx$。`],
      ["2. 概率模型需要完整分布", String.raw`指数族统一许多常见分布：\Formula{$p(y;\eta)=b(y)\exp(\eta^\top T(y)-a(\eta))$}`],
      ["3. 均值来自对数配分函数", String.raw`\Formula{$\mathbb E[T(y)]=\nabla_\eta a(\eta)$}因此自然参数 $\eta$ 决定条件均值。`],
      ["4. 线性预测自然参数", String.raw`GLM 假设自然参数由特征线性给出：\Formula{$\eta=\theta^\top x$}`],
      ["5. 链接函数连接均值", String.raw`\Formula{$g(\mathbb E[y\mid x])=\theta^\top x$}高斯对应恒等链接，Bernoulli 对应 logit，Poisson 对应 log。`],
      ["6. 一套模板得到多个模型", String.raw`\Chip{连续值：线性回归}\quad\Chip{二分类：Logistic}\quad\Chip{计数：Poisson}选择分布要匹配标签取值域。`],
    ],
    summary: String.raw`线性分数 $\rightarrow$ 指数族分布 $\rightarrow$ 自然参数 $\rightarrow$ 链接函数 $\rightarrow$ 具体 GLM。`,
  },
  {
    id: "p06-probability-storyboard",
    panels: [
      ["1. 随机变量把结果变成数", String.raw`\Formula{$X:\Omega\to\mathbb R,\qquad p(x)\text{ 或 }f(x)$}离散变量用概率质量，连续变量用密度。`],
      ["2. 期望是加权平均", String.raw`\Formula{$\mathbb E[X]=\sum_x xp(x)\quad\text{或}\quad\int xf(x)\,dx$}方差衡量偏离均值的平方尺度。`],
      ["3. 联合分布包含依赖", String.raw`\Formula{$p(x,y)=p(x\mid y)p(y)$}边缘化通过对另一个变量求和或积分得到 $p(x)$。`],
      ["4. Bayes 反转条件", String.raw`\Formula{$p(y\mid x)=\dfrac{p(x\mid y)p(y)}{p(x)}$}后验 = 似然 × 先验 ÷ 证据。`],
      ["5. 独立与条件独立不同", String.raw`\Insight{$X\perp Y$ 表示 $p(x,y)=p(x)p(y)$；$X\perp Y\mid Z$ 只在给定 $Z$ 后分解。}`],
      ["6. 大数定律连接数据", String.raw`\Formula{$\dfrac1m\sum_{i=1}^mX_i\xrightarrow{p}\mathbb E[X]$}样本均值因此可以估计总体期望。`],
    ],
    summary: String.raw`随机变量 $\rightarrow$ 分布与期望 $\rightarrow$ 联合/条件/边缘 $\rightarrow$ Bayes $\rightarrow$ 独立性 $\rightarrow$ 统计估计。`,
  },
  {
    id: "p09-python-vectorization-storyboard",
    panels: [
      ["1. 先固定数组形状", String.raw`\Formula{$X:m\times n,\quad w:n\times1,\quad y:m\times1$}第一维通常是样本，第二维是特征。`],
      ["2. 用矩阵运算替代样本循环", String.raw`\Formula{$\hat y=Xw$}BLAS 在底层批量执行乘加，比 Python 循环更快也更接近公式。`],
      ["3. 广播必须写清轴", String.raw`\Formula{$X-\mu:\ (m,n)-(n,)\to(m,n)$}广播不是复制语义；要确认被扩展的是哪一个轴。`],
      ["4. 布尔掩码表达筛选", String.raw`\Formula{$M_i=\mathbf1[y_i>0],\qquad X[M]$}掩码是布尔支持，不是索引值或概率。`],
      ["5. 数值稳定优先", String.raw`\Insight{避免显式求逆；使用 solve。计算 softmax、log-likelihood 时先减最大值或用 log-sum-exp。}`],
      ["6. 用断言保护实现", String.raw`\Chip{检查 shape}\quad\Chip{检查 dtype}\quad\Chip{检查有限值}\quad\Chip{小样本对照循环}先保证正确，再优化速度。`],
    ],
    summary: String.raw`形状约定 $\rightarrow$ 向量化 $\rightarrow$ 广播 $\rightarrow$ 掩码 $\rightarrow$ 数值稳定 $\rightarrow$ 断言验证。`,
  },
  {
    id: "p10-kernel-methods-storyboard",
    panels: [
      ["1. 线性边界可能不够", String.raw`原空间中不可线性分离的数据，可先映射到更高维：\Formula{$x\xrightarrow{\phi}\phi(x)$}`],
      ["2. 对偶只依赖内积", String.raw`SVM 对偶目标中样本只以 $\phi(x_i)^\top\phi(x_j)$ 出现。\Formula{$\max_\alpha\sum_i\alpha_i-\tfrac12\sum_{ij}\alpha_i\alpha_jy_iy_j\langle\phi_i,\phi_j\rangle$}`],
      ["3. 核函数跳过显式映射", String.raw`\Formula{$K(x,z)=\phi(x)^\top\phi(z)$}只计算相似度，就能获得高维线性模型的效果。`],
      ["4. 合法核必须半正定", String.raw`对任意系数 $c$：\Formula{$c^\top Kc\ge0$}Gram 矩阵半正定保证它确实对应某个特征空间内积。`],
      ["5. 预测只看支持向量", String.raw`\Formula{$f(x)=\sum_{i\in SV}\alpha_i y_iK(x_i,x)+b$}核越复杂、支持向量越多，预测代价越高。`],
      ["6. 超参数控制边界", String.raw`\Chip{$C$：错分惩罚}\quad\Chip{$\gamma$：RBF 局部尺度}\Insight{先标准化特征，再用验证集联合选择。}`],
    ],
    summary: String.raw`非线性问题 $\rightarrow$ 特征映射 $\rightarrow$ 对偶内积 $\rightarrow$ 核技巧 $\rightarrow$ 支持向量预测 $\rightarrow$ 超参数选择。`,
  },
  {
    id: "p02-linear-regression-storyboard",
    panels: [
      ["1. 把预测写成矩阵", String.raw`设计矩阵把所有样本排成行：\Formula{$\hat y=X\theta$\\$X:m\times n,\ \theta:n\times1$}一次矩阵乘法得到全部预测。`],
      ["2. 残差变成目标函数", String.raw`误差向量为 $r=X\theta-y$。\Formula{$J(\theta)=\tfrac12\lVert X\theta-y\rVert_2^2$}平方损失让大误差付出更高代价。`],
      ["3. 求梯度并更新", String.raw`链式法则把残差拉回参数空间：\Formula{$\nabla_\theta J=X^\top(X\theta-y)$\\$\theta\leftarrow\theta-\alpha\nabla J$}`],
      ["4. 也可以直接求解", String.raw`令梯度为零：\Formula{$X^\top X\theta=X^\top y$\\$\theta^*=(X^\top X)^{-1}X^\top y$}实际计算优先用线性求解器或伪逆。`],
      ["5. 几何上是投影", String.raw`最优预测 $X\theta^*$ 是 $y$ 在 $X$ 列空间上的投影。\Insight{$X^\top(y-X\theta^*)=0$：残差与每个特征方向正交。}`],
      ["6. 两种方法怎么选", String.raw`\Chip{小而稠密：正规方程}\quad\Chip{大而稀疏：梯度法}无论选哪种，都先检查维度、缩放和验证集误差。`],
    ],
    summary: String.raw`数据 $X,y$ $\rightarrow$ 预测 $X\theta$ $\rightarrow$ 残差 $r$ $\rightarrow$ 梯度或正规方程 $\rightarrow$ 最小二乘解。`,
  },
  {
    id: "p04-logistic-newton-storyboard",
    panels: [
      ["1. 线性分数不是概率", String.raw`先计算 $z=\theta^\top x$，它可以取任意实数。\Formula{$h_\theta(x)=\sigma(z)=\dfrac1{1+e^{-z}}$}Sigmoid 把分数压到 $(0,1)$。`],
      ["2. 用伯努利似然", String.raw`标签 $y\in\{0,1\}$：\Formula{$\ell(\theta)=\sum_i[y_i\log h_i+(1-y_i)\log(1-h_i)]$}训练就是最大化真实标签的概率。`],
      ["3. 梯度仍很简洁", String.raw`对数似然求导后：\Formula{$\nabla\ell=X^\top(y-p)$}“真实标签减预测概率”决定修正方向。`],
      ["4. Hessian 给出曲率", String.raw`令 $W=\mathrm{diag}(p_i(1-p_i))$：\Formula{$H=-X^\top W X$}靠近 $p=0.5$ 的样本权重更大。`],
      ["5. Newton / IRLS 更新", String.raw`利用曲率调整步长：\Formula{$\theta\leftarrow\theta-H^{-1}\nabla\ell$}它等价于反复求解一次加权最小二乘。`],
      ["6. 先处理数值边界", String.raw`\Insight{完全可分时参数可能无限增大；加入正则化。计算损失时用 log-sum-exp，避免 $\log(0)$。}`],
    ],
    summary: String.raw`线性分数 $\rightarrow$ Sigmoid 概率 $\rightarrow$ 伯努利似然 $\rightarrow$ 梯度与曲率 $\rightarrow$ Newton/IRLS。`,
  },
  {
    id: "p07-generative-classification-storyboard",
    panels: [
      ["1. 先描述数据怎样生成", String.raw`生成式模型分别学习先验与类条件分布：\Formula{$p(y),\qquad p(x\mid y)$}最后再用 Bayes 公式反推类别。`],
      ["2. GDA 的假设", String.raw`两类数据各自服从高斯，并共享协方差：\Formula{$x\mid y=k\sim\mathcal N(\mu_k,\Sigma)$}`],
      ["3. 参数来自计数和均值", String.raw`\Formula{$\phi=\tfrac1m\sum_i\mathbf1[y_i=1]$\\$\mu_k=\dfrac{\sum_i\mathbf1[y_i=k]x_i}{\sum_i\mathbf1[y_i=k]}$}协方差汇总所有类内偏差。`],
      ["4. 为什么边界是直线", String.raw`比较两个类别的对数后验，二次项因共享 $\Sigma$ 抵消：\Insight{$\log\dfrac{p(y=1\mid x)}{p(y=0\mid x)}=w^\top x+b$。}`],
      ["5. Naive Bayes 换一种分解", String.raw`高维离散特征使用条件独立假设：\Formula{$p(x\mid y)=\prod_j p(x_j\mid y)$}在对数空间里，乘积变成求和。`],
      ["6. 零频率必须平滑", String.raw`\Formula{$\hat\phi_{j\mid y}=\dfrac{N_{j,y}+\alpha}{N_y+\alpha K}$}拉普拉斯平滑避免一个未见词让整类概率归零。`],
    ],
    summary: String.raw`建模 $p(y)$ 与 $p(x\mid y)$ $\rightarrow$ 估计参数 $\rightarrow$ 比较对数后验 $\rightarrow$ 得到分类边界。`,
  },
  {
    id: "p16-backprop-storyboard",
    panels: [
      ["1. 前向传播保存中间量", String.raw`线性层与激活层交替：\Formula{$Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}$\\$A^{[l]}=g(Z^{[l]})$}`],
      ["2. 从损失末端开始", String.raw`先得到输出层梯度 $dA^{[L]}$，再逐层向前追溯。\Insight{反向传播不是“反着算输出”，而是传播损失对每个中间量的敏感度。}`],
      ["3. 激活层做逐元素乘法", String.raw`\Formula{$dZ^{[l]}=dA^{[l]}\odot g'(Z^{[l]})$}ReLU 只让前向为正的位置通过梯度。`],
      ["4. 线性层产生三条梯度", String.raw`\Formula{$dW^{[l]}=dZ^{[l]}(A^{[l-1]})^\top$\\$db^{[l]}=\sum dZ^{[l]}$\\$dA^{[l-1]}=(W^{[l]})^\top dZ^{[l]}$}`],
      ["5. 形状是最好的单元测试", String.raw`\Insight{$dW$ 必须与 $W$ 同形，$db$ 与 $b$ 同形，$dA^{[l-1]}$ 与 $A^{[l-1]}$ 同形。}先查形状，再查数值。`],
      ["6. 更新前做梯度检查", String.raw`用有限差分比较解析梯度：\Formula{$\dfrac{J(\theta+\epsilon)-J(\theta-\epsilon)}{2\epsilon}$}只在小网络和双精度下检查。`],
    ],
    summary: String.raw`前向缓存 $\rightarrow$ 输出层误差 $\rightarrow$ 激活层局部导数 $\rightarrow$ 线性层三条梯度 $\rightarrow$ 参数更新。`,
  },
  {
    id: "p20-em-storyboard",
    panels: [
      ["1. 隐变量让似然难算", String.raw`观测到 $x$，却看不到 $z$：\Formula{$\ell(\theta)=\sum_i\log\sum_z p(x_i,z;\theta)$}“对数外还有求和”阻碍直接优化。`],
      ["2. 引入辅助分布", String.raw`为每个样本引入 $q_i(z)$，用 Jensen 不等式构造下界：\Formula{$\ell(\theta)\ge\sum_{i,z}q_i(z)\log\dfrac{p(x_i,z;\theta)}{q_i(z)}$}`],
      ["3. E 步更新责任度", String.raw`固定旧参数，令下界贴住真实似然：\Formula{$q_i(z)=p(z\mid x_i;\theta^{old})$}它回答“每个隐状态应负责多少”。`],
      ["4. M 步更新模型", String.raw`固定责任度，最大化完整数据的期望对数似然：\Formula{$\theta^{new}=\arg\max_\theta\sum_{i,z}q_i(z)\log p(x_i,z;\theta)$}`],
      ["5. 为什么不会变差", String.raw`E 步让下界与当前似然相等，M 步提高下界：\Insight{$\ell(\theta^{new})\ge\mathcal L(q,\theta^{new})\ge\mathcal L(q,\theta^{old})=\ell(\theta^{old})$。}`],
      ["6. 以高斯混合为例", String.raw`\Chip{E：样本属于各簇的概率}\quad\Chip{M：加权均值与协方差}多次初始化以降低落入差的局部最优的风险。`],
    ],
    summary: String.raw`困难似然 $\rightarrow$ Jensen 下界 $\rightarrow$ E 步估计隐状态 $\rightarrow$ M 步更新参数 $\rightarrow$ 单调改进。`,
  },
  {
    id: "p21-pca-storyboard",
    panels: [
      ["1. 先中心化", String.raw`减去训练集均值：\Formula{$x_c^{(i)}=x^{(i)}-\mu$}否则第一主成分可能只是在追逐整体偏移。`],
      ["2. 计算协方差", String.raw`\Formula{$S=\dfrac1m X_c^\top X_c$}对角线是各特征方差，非对角线描述共同变化。`],
      ["3. 找最大方差方向", String.raw`在单位长度约束下最大化投影方差：\Formula{$\max_{\lVert u\rVert=1}u^\top S u$\\$Su=\lambda u$}答案是最大特征值对应的特征向量。`],
      ["4. 取前 k 个主成分", String.raw`将前 $k$ 个正交方向排成 $U_k$：\Formula{$z=U_k^\top(x-\mu)$}原始 $n$ 维样本被编码成 $k$ 维坐标。`],
      ["5. 投影还能重建", String.raw`\Formula{$\hat x=\mu+U_kz$}丢掉的方向越少，重建误差越小；PCA 同时最小化平方重建误差。`],
      ["6. 用解释方差选 k", String.raw`\Formula{$\mathrm{EVR}(k)=\dfrac{\sum_{j=1}^k\lambda_j}{\sum_{j=1}^n\lambda_j}$}只在训练集拟合 PCA，再用同一均值和主轴变换验证集。`],
    ],
    summary: String.raw`中心化 $\rightarrow$ 协方差 $\rightarrow$ 特征分解 $\rightarrow$ 选择前 $k$ 个方向 $\rightarrow$ 投影与重建。`,
  },
  {
    id: "p11-model-selection-storyboard",
    panels: [
      ["1. 三份数据承担不同职责", String.raw`\Chip{训练集：拟合参数}\quad\Chip{验证集：选模型}\quad\Chip{测试集：最终估计}职责混用就会产生乐观偏差。`],
      ["2. 超参数不能在训练集选", String.raw`模型复杂度、正则强度和阈值都属于选择过程：\Formula{$\lambda^*=\arg\min_\lambda R_{val}(\hat\theta_\lambda)$}`],
      ["3. 交叉验证重复轮换", String.raw`\Formula{$\widehat R_{CV}=\dfrac1K\sum_{k=1}^KR(D_k;\hat\theta_{-k})$}每折只用其余数据训练。`],
      ["4. 时间数据不能随机打乱", String.raw`\Insight{时间序列应使用滚动或扩展窗口；未来样本绝不能参与过去模型的训练和预处理。}`],
      ["5. 所有预处理都要折内拟合", String.raw`标准化、缺失值填补、特征选择和 PCA 都必须只看当前训练折。\Formula{$T_k=\operatorname{fit}(D_{-k})$}`],
      ["6. 最后只看一次测试集", String.raw`选择结束后用训练+验证数据重训，再在测试集报告带置信区间的结果。\Insight{看过测试结果再修改模型，测试集就变成了验证集。}`],
    ],
    summary: String.raw`划分职责 $\rightarrow$ 训练候选模型 $\rightarrow$ 交叉验证选择 $\rightarrow$ 防止泄漏 $\rightarrow$ 重训 $\rightarrow$ 一次测试。`,
  },
  {
    id: "p12-learning-theory-storyboard",
    panels: [
      ["1. 真正关心总体风险", String.raw`\Formula{$R(h)=\mathbb E_{(x,y)\sim\mathcal D}[\ell(h(x),y)]$}但未知分布 $\mathcal D$ 让它无法直接计算。`],
      ["2. 用样本风险代替", String.raw`\Formula{$\widehat R_m(h)=\dfrac1m\sum_{i=1}^m\ell(h(x_i),y_i)$}ERM 选择经验风险最小的假设。`],
      ["3. 总误差可分成两部分", String.raw`\Formula{$R(\hat h)-R(h^*)=\text{估计误差}+\text{近似误差}$}模型太简单时近似误差大，太复杂时估计误差大。`],
      ["4. 一致收敛连接两者", String.raw`若所有假设的经验风险都接近总体风险：\Formula{$\sup_{h\in\mathcal H}|R(h)-\widehat R(h)|\le\epsilon$}ERM 才能泛化。`],
      ["5. 容量决定样本复杂度", String.raw`有限假设类常见界：\Formula{$m=O\!\left(\dfrac{\log|\mathcal H|+\log(1/\delta)}{\epsilon^2}\right)$}更大容量需要更多数据。`],
      ["6. 正则化是在控制容量", String.raw`\Formula{$\min_h\widehat R(h)+\lambda\Omega(h)$}正则化不只是优化技巧，它在限制可选函数的有效复杂度。`],
    ],
    summary: String.raw`总体风险 $\rightarrow$ 经验风险 $\rightarrow$ ERM $\rightarrow$ 一致收敛 $\rightarrow$ 容量与样本量 $\rightarrow$ 正则化。`,
  },
  {
    id: "p13-trees-ensembles-storyboard",
    panels: [
      ["1. 树通过问题切分空间", String.raw`每个节点选择特征和阈值：\Formula{$x_j\le t\ ?$}叶节点给出类别概率或回归均值。`],
      ["2. 选择让子节点更纯的切分", String.raw`分类常用 Gini：\Formula{$G(S)=1-\sum_kp_k^2$}最大化切分前后不纯度的下降。`],
      ["3. 深树容易过拟合", String.raw`\Chip{限制深度}\quad\Chip{最小叶样本}\quad\Chip{剪枝}\Insight{单棵树偏差低、方差高，对数据扰动敏感。}`],
      ["4. Bagging 降低方差", String.raw`在 bootstrap 样本上训练多棵树并平均：\Formula{$\hat f(x)=\dfrac1B\sum_{b=1}^Bf_b(x)$}`],
      ["5. 随机森林再随机特征", String.raw`每次切分只看特征子集，使不同树的错误相关性下降。\Insight{强树 + 低相关性，是随机森林有效的核心。}`],
      ["6. Boosting 顺序修正错误", String.raw`\Formula{$F_t(x)=F_{t-1}(x)+\eta f_t(x)$}新弱学习器拟合当前残差或负梯度，学习率与树数共同控制复杂度。`],
    ],
    summary: String.raw`递归切分 $\rightarrow$ 纯度目标 $\rightarrow$ 控制单树复杂度 $\rightarrow$ Bagging/随机森林 $\rightarrow$ Boosting。`,
  },
  {
    id: "p14-neural-network-storyboard",
    panels: [
      ["1. 单个神经元", String.raw`\Formula{$z=w^\top x+b,\qquad a=g(z)$}线性组合负责旋转缩放，非线性激活负责弯曲决策边界。`],
      ["2. 一层同时计算多个神经元", String.raw`\Formula{$Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}$}$W^{[l]}:n_l\times n_{l-1}$，批次轴保持不变。`],
      ["3. 多层形成特征层级", String.raw`\Formula{$A^{[L]}=f^{[L]}\circ\cdots\circ f^{[1]}(X)$}前层提取局部模式，后层组合成任务相关表示。`],
      ["4. 没有激活就仍是线性", String.raw`\Formula{$W_2(W_1x)=\widetilde W x$}堆叠任意多个纯线性层仍可合并成一个线性变换。`],
      ["5. 输出层匹配任务", String.raw`\Chip{回归：线性输出}\quad\Chip{二分类：Sigmoid}\quad\Chip{多分类：Softmax}损失函数要与输出分布配套。`],
      ["6. 参数通过反向传播学习", String.raw`\Formula{$W\leftarrow W-\alpha\dfrac{\partial J}{\partial W}$}\Insight{前向计算预测，反向传播梯度；二者共享同一计算图。}`],
    ],
    summary: String.raw`神经元 $\rightarrow$ 矩阵化层 $\rightarrow$ 非线性堆叠 $\rightarrow$ 任务输出 $\rightarrow$ 损失 $\rightarrow$ 反向传播更新。`,
  },
  {
    id: "p15-evaluation-metrics-storyboard",
    panels: [
      ["1. 从混淆矩阵开始", String.raw`\Formula{$\begin{array}{c|cc}&\hat y=1&\hat y=0\\\hline y=1&TP&FN\\y=0&FP&TN\end{array}$}所有二分类指标都是这四个计数的不同权衡。`],
      ["2. Precision 与 Recall 回答不同问题", String.raw`\Formula{$P=\dfrac{TP}{TP+FP},\qquad R=\dfrac{TP}{TP+FN}$}前者关心报出的有多准，后者关心真的抓到了多少。`],
      ["3. F1 是调和平均", String.raw`\Formula{$F_1=\dfrac{2PR}{P+R}$}只有 Precision 和 Recall 都高时，F1 才高。`],
      ["4. 阈值决定工作点", String.raw`模型输出分数，阈值把它转成类别。\Insight{ROC/PR 曲线比较所有阈值；类别极不平衡时优先看 PR 曲线。}`],
      ["5. 概率还要检查校准", String.raw`\Formula{$P(Y=1\mid \hat p\approx0.8)\approx0.8$}AUC 高不代表概率可信；可用可靠性图和 Brier score。`],
      ["6. 最终指标来自错误成本", String.raw`\Formula{$C=\lambda_{FN}FN+\lambda_{FP}FP$}阈值和指标必须对应漏报、误报的真实代价与容量限制。`],
    ],
    summary: String.raw`混淆矩阵 $\rightarrow$ Precision/Recall $\rightarrow$ F1 $\rightarrow$ 阈值曲线 $\rightarrow$ 校准 $\rightarrow$ 业务成本。`,
  },
  {
    id: "p17-ml-debugging-storyboard",
    panels: [
      ["1. 先建立可靠基线", String.raw`用简单模型、固定数据切分和明确指标得到可复现结果。\Insight{没有基线时，任何“提升”都无法归因。}`],
      ["2. 先判断偏差还是方差", String.raw`\Chip{训练误差高：高偏差}\quad\Chip{训练低、验证高：高方差}两种问题需要相反的修复方向。`],
      ["3. 学习曲线定位数据价值", String.raw`观察训练样本增加时的训练/验证误差。\Insight{验证误差仍持续下降，更多数据可能有效；两条曲线都高则先提高模型能力。}`],
      ["4. 做误差分桶", String.raw`按类别、来源、长度、时间和置信度切片。\Formula{$R_g=\dfrac1{|D_g|}\sum_{i\in D_g}\ell_i$}总体均值会隐藏局部失败。`],
      ["5. 一次只验证一个假设", String.raw`\Chip{数据问题}\quad\Chip{实现问题}\quad\Chip{优化问题}\quad\Chip{泛化问题}设计最小实验，让结果能推翻当前假设。`],
      ["6. 保存证据形成闭环", String.raw`记录配置、随机种子、数据版本、指标和失败样本。\Insight{调试的产物不是一个更高数字，而是一条可复现的因果证据链。}`],
    ],
    summary: String.raw`可靠基线 $\rightarrow$ 偏差/方差诊断 $\rightarrow$ 学习曲线 $\rightarrow$ 误差分桶 $\rightarrow$ 最小实验 $\rightarrow$ 证据沉淀。`,
  },
  {
    id: "p18-midterm-map-storyboard",
    panels: [
      ["1. 线性回归", String.raw`\Formula{$\nabla J=X^\top(X\theta-y)$}掌握梯度下降、正规方程、概率解释和投影视角。`],
      ["2. Logistic 与 GLM", String.raw`\Formula{$p(y=1\mid x)=\sigma(\theta^\top x)$}从指数族与链接函数理解分类概率。`],
      ["3. 生成式分类", String.raw`\Formula{$p(y\mid x)\propto p(x\mid y)p(y)$}比较 GDA、Naive Bayes 与判别式方法的假设。`],
      ["4. SVM 与核", String.raw`\Formula{$f(x)=\sum_i\alpha_i y_iK(x_i,x)+b$}间隔、KKT、支持向量和核技巧是一条连续主线。`],
      ["5. 学习理论", String.raw`\Formula{$R=\text{经验风险}+\text{泛化差距}$}能区分近似误差、估计误差与优化误差。`],
      ["6. 解题按统一模板", String.raw`\Chip{写目标}\quad\Chip{写约束/假设}\quad\Chip{求导或构造估计量}\quad\Chip{检查维度与边界}先说明为什么，再代数计算。`],
    ],
    summary: String.raw`线性模型 $\rightarrow$ 概率分类 $\rightarrow$ 生成式模型 $\rightarrow$ 间隔与核 $\rightarrow$ 泛化理论 $\rightarrow$ 统一解题模板。`,
  },
  {
    id: "p19-clustering-em-storyboard",
    panels: [
      ["1. K-means 先分配", String.raw`固定中心，选择最近簇：\Formula{$c_i=\arg\min_k\lVert x_i-\mu_k\rVert_2^2$}`],
      ["2. 再更新中心", String.raw`固定分配，取簇内均值：\Formula{$\mu_k=\dfrac{\sum_i\mathbf1[c_i=k]x_i}{\sum_i\mathbf1[c_i=k]}$}两步交替降低平方距离目标。`],
      ["3. 硬分配有明显限制", String.raw`\Insight{K-means 偏好近似球形、相似尺度的簇，并且不给出不确定性。初始中心不同可能得到不同结果。}`],
      ["4. GMM 把簇变成概率分布", String.raw`\Formula{$p(x)=\sum_{k=1}^K\pi_k\mathcal N(x;\mu_k,\Sigma_k)$}每个样本可以部分属于多个簇。`],
      ["5. E 步计算软责任度", String.raw`\Formula{$\gamma_{ik}=\dfrac{\pi_k\mathcal N(x_i;\mu_k,\Sigma_k)}{\sum_j\pi_j\mathcal N(x_i;\mu_j,\Sigma_j)}$}`],
      ["6. M 步做加权估计", String.raw`\Formula{$N_k=\sum_i\gamma_{ik},\quad\mu_k=\dfrac1{N_k}\sum_i\gamma_{ik}x_i$}协方差和混合权重同样按责任度更新。`],
    ],
    summary: String.raw`K-means 硬分配 $\leftrightarrow$ 中心更新 $\rightarrow$ GMM 概率建模 $\rightarrow$ E 步责任度 $\leftrightarrow$ M 步参数更新。`,
  },
  {
    id: "p22-ica-rl-intro-storyboard",
    panels: [
      ["1. ICA 从混合信号出发", String.raw`观测是独立源的线性混合：\Formula{$x=As$}目标是在不知道 $A$ 与 $s$ 时恢复源信号。`],
      ["2. 学习解混矩阵", String.raw`\Formula{$\hat s=Wx,\qquad W\approx A^{-1}$}只靠协方差无法区分旋转，必须利用非高斯性与独立性。`],
      ["3. 独立性提供目标", String.raw`\Formula{$p(s)=\prod_jp(s_j)$}最大化非高斯性或最小化互信息，使输出分量尽量独立。`],
      ["4. 强化学习换成序列决策", String.raw`智能体在状态 $s_t$ 选择动作 $a_t$，环境返回奖励和新状态。\Formula{$s_t\xrightarrow{a_t,r_t}s_{t+1}$}`],
      ["5. 目标是长期回报", String.raw`\Formula{$G_t=\sum_{k=0}^{\infty}\gamma^k r_{t+k}$}$\gamma$ 控制未来奖励的权重。`],
      ["6. 策略决定行为", String.raw`\Formula{$a\sim\pi(a\mid s)$}\Insight{RL 的难点是当前动作改变未来数据分布，同时必须在探索与利用之间权衡。}`],
    ],
    summary: String.raw`ICA：混合 $\rightarrow$ 解混 $\rightarrow$ 独立源；RL：状态 $\rightarrow$ 动作 $\rightarrow$ 奖励 $\rightarrow$ 长期回报与策略。`,
  },
  {
    id: "p23-mdp-planning-storyboard",
    panels: [
      ["1. MDP 定义决策环境", String.raw`\Formula{$(\mathcal S,\mathcal A,P,R,\gamma)$}Markov 性表示未来只需当前状态与动作。`],
      ["2. 价值衡量长期收益", String.raw`\Formula{$V^\pi(s)=\mathbb E_\pi[\sum_{t=0}^{\infty}\gamma^t r_t\mid s_0=s]$}`],
      ["3. Bellman 方程做一步分解", String.raw`\Formula{$V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)[R+\gamma V^\pi(s')]$}`],
      ["4. 最优价值取最佳动作", String.raw`\Formula{$V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)[R+\gamma V^*(s')]$}`],
      ["5. 价值迭代直接逼近最优值", String.raw`反复应用 Bellman 最优算子：\Formula{$V_{k+1}=\mathcal T^*V_k$}收敛后用贪心动作提取策略。`],
      ["6. 策略迭代交替两步", String.raw`\Chip{策略评估：求 $V^\pi$}\quad\Chip{策略改进：对 $V^\pi$ 贪心}\Insight{策略稳定时停止。}`],
    ],
    summary: String.raw`MDP $\rightarrow$ 策略价值 $\rightarrow$ Bellman 分解 $\rightarrow$ 最优价值 $\rightarrow$ 价值迭代或策略迭代。`,
  },
  {
    id: "p24-continuous-mdp-storyboard",
    panels: [
      ["1. 连续状态不能枚举", String.raw`当 $s\in\mathbb R^n$ 时，表格价值函数不可行。\Insight{需要函数逼近、采样或利用动力学结构。}`],
      ["2. 先学习或给定环境模型", String.raw`\Formula{$s_{t+1}=f(s_t,a_t)+\epsilon_t$}模型回答“执行动作后会到哪里”。`],
      ["3. 用模拟生成轨迹", String.raw`\Formula{$\tau=(s_0,a_0,r_0,\ldots,s_T)$}从模型反复采样可估计策略回报，但模型误差会沿时间累积。`],
      ["4. Monte Carlo 估计价值", String.raw`\Formula{$\widehat V^\pi(s)=\dfrac1N\sum_{i=1}^N\sum_t\gamma^tr_t^{(i)}$}样本越多方差越小，计算代价越高。`],
      ["5. 函数逼近推广到未见状态", String.raw`\Formula{$V_\theta(s)\approx V^\pi(s)$}线性基函数、神经网络都可使用，但训练目标与数据分布必须匹配。`],
      ["6. 模型偏差需要监控", String.raw`\Insight{短期预测准不代表长期规划准。比较真实与模拟的多步状态、奖励和约束违例，限制规划视野。}`],
    ],
    summary: String.raw`连续状态 $\rightarrow$ 动力学模型 $\rightarrow$ 模拟轨迹 $\rightarrow$ 价值估计 $\rightarrow$ 函数逼近 $\rightarrow$ 模型误差诊断。`,
  },
  {
    id: "p25-ml-critiques-storyboard",
    panels: [
      ["1. 指标不是目标本身", String.raw`\Insight{当代理指标成为优化目标，它可能不再代表真实目标。先写清谁获益、谁承担错误成本。}`],
      ["2. 数据不是中立样本", String.raw`采集机制决定谁被看见、怎样被标注。\Formula{$p_{train}(x,y)\neq p_{deploy}(x,y)$}分布偏差会复制到模型。`],
      ["3. 历史标签可能含有偏见", String.raw`\Insight{标签常记录过去决策而非客观真相。高拟合度可能只是更准确地复制历史制度。}`],
      ["4. 总体指标会隐藏群体差异", String.raw`\Formula{$R=\sum_gP(g)R_g$}必须同时报告关键群体、交叉群体和罕见失败模式。`],
      ["5. 反馈回路改变未来数据", String.raw`模型输出影响行动，行动改变后续观测。\Formula{预测 $\rightarrow$ 决策 $\rightarrow$ 环境变化 $\rightarrow$ 新训练数据}`],
      ["6. 治理是持续流程", String.raw`\Chip{用途边界}\quad\Chip{人工复核}\quad\Chip{申诉机制}\quad\Chip{审计与退出}\Insight{不是一次公平性指标就能结束。}`],
    ],
    summary: String.raw`目标审查 $\rightarrow$ 数据与标签审查 $\rightarrow$ 分群评价 $\rightarrow$ 反馈回路 $\rightarrow$ 人工与制度治理。`,
  },
  {
    id: "p26-lds-lqr-storyboard",
    panels: [
      ["1. 线性动力学描述状态变化", String.raw`\Formula{$x_{t+1}=Ax_t+Bu_t+w_t$}$A$ 描述自然演化，$B$ 描述控制输入如何作用于状态。`],
      ["2. 奖励惩罚状态与动作", String.raw`LQR 常写成最小成本：\Formula{$J=\sum_t(x_t^\top Qx_t+u_t^\top Ru_t)$}$Q,R$ 决定控制取舍。`],
      ["3. 价值函数保持二次型", String.raw`\Formula{$V_t(x)=x^\top P_tx$}线性动力学加二次成本，使 Bellman 递推仍能解析求解。`],
      ["4. Riccati 方程反向递推", String.raw`\Formula{$P_t=Q+A^\top P_{t+1}A-A^\top P_{t+1}B(R+B^\top P_{t+1}B)^{-1}B^\top P_{t+1}A$}`],
      ["5. 最优控制是线性反馈", String.raw`\Formula{$u_t=-K_tx_t$}反馈不是预先固定动作，而是根据当前偏差实时修正。`],
      ["6. 闭环稳定性要验证", String.raw`\Formula{$x_{t+1}=(A-BK)x_t$}\Insight{检查 $A-BK$ 的特征值、控制饱和和模型误差，而不只看训练轨迹成本。}`],
    ],
    summary: String.raw`线性动力学 $\rightarrow$ 二次成本 $\rightarrow$ 二次价值 $\rightarrow$ Riccati 递推 $\rightarrow$ 线性反馈 $\rightarrow$ 稳定性检查。`,
  },
  {
    id: "p27-rl-lqg-debugging-storyboard",
    panels: [
      ["1. 先验证环境与奖励", String.raw`\Insight{检查终止条件、奖励符号、动作边界和观测延迟。许多“算法失败”其实是环境接口错误。}`],
      ["2. 分开看数据与更新", String.raw`\Chip{状态覆盖}\quad\Chip{动作分布}\quad\Chip{回报尺度}\quad\Chip{梯度/TD 误差}只看总回报无法定位问题。`],
      ["3. DDP 在名义轨迹附近展开", String.raw`对动力学与成本做局部二阶近似。\Formula{$Q_x,Q_u,Q_{xx},Q_{uu},Q_{ux}$}反向求局部控制律，前向更新轨迹。`],
      ["4. 部分可观测时先估计状态", String.raw`\Formula{$y_t=Cx_t+v_t$}传感器只提供含噪观测，控制器需要状态估计 $\hat x_t$。`],
      ["5. Kalman Filter 预测再校正", String.raw`\Formula{$\hat x_{t|t-1}=A\hat x_{t-1|t-1}+Bu_{t-1}$\\$\hat x_{t|t}=\hat x_{t|t-1}+K_t(y_t-C\hat x_{t|t-1})$}`],
      ["6. LQG 组合估计与控制", String.raw`\Formula{$u_t=-K\hat x_t$}\Insight{分离原理允许分别设计 Kalman Filter 与 LQR，但仍需检查模型失配和噪声假设。}`],
    ],
    summary: String.raw`环境诊断 $\rightarrow$ 学习信号诊断 $\rightarrow$ DDP 局部控制 $\rightarrow$ Kalman 状态估计 $\rightarrow$ LQG 闭环。`,
  },
  {
    id: "p28-cnn-storyboard",
    panels: [
      ["1. 图像具有空间结构", String.raw`输入通常是 $X:H\times W\times C_{in}$。相邻像素相关，直接展平会丢失局部关系并产生大量参数。`],
      ["2. 卷积只连接局部区域", String.raw`\Formula{$Y_{i,j,c_o}=\sum_{u,v,c_i}K_{u,v,c_i,c_o}X_{i+u,j+v,c_i}$}卷积核在空间位置间共享。`],
      ["3. 输出尺寸由三项决定", String.raw`\Formula{$H_{out}=\left\lfloor\dfrac{H+2P-K}{S}\right\rfloor+1$}核大小 $K$、步幅 $S$、填充 $P$ 共同决定分辨率。`],
      ["4. 通道维负责组合特征", String.raw`每个输出通道汇总所有输入通道。\Formula{$K:K_h\times K_w\times C_{in}\times C_{out}$}`],
      ["5. 深层感受野逐步扩大", String.raw`\Insight{浅层检测边缘与纹理，深层组合成部件和对象。堆叠小卷积常比单个大卷积参数更少。}`],
      ["6. 分类头汇总空间信息", String.raw`\Chip{卷积 + 激活}\quad\Chip{下采样}\quad\Chip{全局平均池化}\quad\Chip{线性分类}\Insight{检查尺寸链和数据增强是否保持标签语义。}`],
    ],
    summary: String.raw`空间输入 $\rightarrow$ 局部连接与权重共享 $\rightarrow$ 尺寸计算 $\rightarrow$ 多通道特征 $\rightarrow$ 深层感受野 $\rightarrow$ 分类输出。`,
  },
];

function documentFor(diagram) {
  const positions = [
    ["0", "0"], ["9.55", "0"], ["19.1", "0"],
    ["0", "-6.45"], ["9.55", "-6.45"], ["19.1", "-6.45"],
  ];
  const panels = diagram.panels.map(([title, body], index) => {
    const [x, y] = positions[index];
    return String.raw`\Panel{p${index + 1}}{${x}}{${y}}{${title}}{${body}}`;
  }).join("\n");

  return `${preamble}
\\begin{document}
\\begin{tikzpicture}[x=1cm,y=1cm]
\\fill[white] (-0.35,0.35) rectangle (28.6,-14.55);
${panels}
\\Summary{${diagram.summary}}
\\Identity
\\end{tikzpicture}
\\end{document}
`;
}

for (const diagram of diagrams) {
  const texPath = join(sourceDir, `${diagram.id}.tex`);
  writeFileSync(texPath, documentFor(diagram));
  execFileSync(tectonic, [texPath, "--outdir", outputDir], { stdio: "inherit" });
  const pdfPath = join(outputDir, `${diagram.id}.pdf`);
  execFileSync("sips", ["-s", "format", "png", pdfPath, "--out", join(outputDir, `${diagram.id}.png`), "--resampleWidth", "2200"], { stdio: "inherit" });
}

console.log(`Generated ${diagrams.length} CS229 storyboard diagrams.`);
