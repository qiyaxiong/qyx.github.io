import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const sourceDir = join(root, "src/visuals/tikz/cs229");
const outputDir = join(root, "public/images/notes/cs229/tikz");
const tectonic = process.env.TECTONIC ?? "/opt/homebrew/bin/tectonic";

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const preamble = String.raw`
\documentclass[tikz,border=10pt]{standalone}
\usepackage[UTF8,fontset=fandol]{ctex}
\usepackage{amsmath,amssymb}
\usetikzlibrary{arrows.meta,backgrounds,calc,fit,positioning}
\definecolor{roleTeal}{HTML}{4F8FA5}
\definecolor{roleOrange}{HTML}{EE995B}
\definecolor{roleCoral}{HTML}{C95B5B}
\definecolor{roleViolet}{HTML}{8A74B5}
\definecolor{roleGray}{HTML}{85898F}
\tikzset{
  flow/.style={-{Latex[length=2.4mm,width=1.8mm]}, line width=.7pt, draw=black!58},
  op/.style={font=\Large, text=black!70},
  stage/.style={font=\small\bfseries, text=black!55},
  symbol/.style={font=\small, text=black!84, align=center},
  dimlabel/.style={font=\scriptsize, text=black!52, align=center},
  note/.style={rounded corners=2pt, fill=black!2, draw=black!14, line width=.5pt,
    inner xsep=10pt, inner ysep=8pt, text width=27.2cm, align=left, font=\small},
  tag/.style={rounded corners=2pt, fill=black!4, draw=black!18, inner sep=4pt,
    font=\scriptsize, text=black!65}
}
\newcommand{\cellsize}{0.46}
\newcommand{\DenseBlock}[8]{%
  \begin{scope}[shift={(#2,#3)}]
    \pgfmathtruncatemacro{\R}{#4}
    \pgfmathtruncatemacro{\C}{#5}
    \foreach \r in {1,...,\R}{
      \foreach \c in {1,...,\C}{
        \pgfmathtruncatemacro{\tone}{mod(7*\r+11*\c+3*\r*\c,3)}
        \ifcase\tone\def\mix{38}\or\def\mix{58}\or\def\mix{76}\fi
        \fill[rounded corners=.7pt,#6!\mix]
          ({(\c-1)*\cellsize},{-(\r-1)*\cellsize})
          rectangle ++({.39},{-.39});
      }
    }
    \draw[black!55,line width=.65pt]
      (-.11,.09) -- (-.19,.09) -- (-.19,{-\R*\cellsize+.07}) -- (-.11,{-\R*\cellsize+.07});
    \draw[black!55,line width=.65pt]
      ({\C*\cellsize-.07},.09) -- ({\C*\cellsize+.01},.09)
      -- ({\C*\cellsize+.01},{-\R*\cellsize+.07}) -- ({\C*\cellsize-.07},{-\R*\cellsize+.07});
    \coordinate (#1-west) at (-.19,{-\R*\cellsize/2+.035});
    \coordinate (#1-east) at ({\C*\cellsize+.01},{-\R*\cellsize/2+.035});
    \coordinate (#1-center) at ({\C*\cellsize/2-.035},{-\R*\cellsize/2+.035});
    \node[symbol] (#1-label) at ({\C*\cellsize/2-.035},{-\R*\cellsize-.28}) {#7};
    \node[dimlabel] at ({\C*\cellsize/2-.035},{-\R*\cellsize-.65}) {#8};
  \end{scope}
}
\newcommand{\DiagBlock}[8]{%
  \begin{scope}[shift={(#2,#3)}]
    \pgfmathtruncatemacro{\R}{#4}
    \pgfmathtruncatemacro{\C}{#5}
    \foreach \r in {1,...,\R}{
      \foreach \c in {1,...,\C}{
        \ifnum\r=\c
          \fill[rounded corners=.7pt,#6!68]
            ({(\c-1)*\cellsize},{-(\r-1)*\cellsize}) rectangle ++({.39},{-.39});
        \else
          \draw[rounded corners=.7pt,black!10,line width=.35pt]
            ({(\c-1)*\cellsize},{-(\r-1)*\cellsize}) rectangle ++({.39},{-.39});
        \fi
      }
    }
    \draw[black!55,line width=.65pt]
      (-.11,.09) -- (-.19,.09) -- (-.19,{-\R*\cellsize+.07}) -- (-.11,{-\R*\cellsize+.07});
    \draw[black!55,line width=.65pt]
      ({\C*\cellsize-.07},.09) -- ({\C*\cellsize+.01},.09)
      -- ({\C*\cellsize+.01},{-\R*\cellsize+.07}) -- ({\C*\cellsize-.07},{-\R*\cellsize+.07});
    \coordinate (#1-west) at (-.19,{-\R*\cellsize/2+.035});
    \coordinate (#1-east) at ({\C*\cellsize+.01},{-\R*\cellsize/2+.035});
    \coordinate (#1-center) at ({\C*\cellsize/2-.035},{-\R*\cellsize/2+.035});
    \node[symbol] at ({\C*\cellsize/2-.035},{-\R*\cellsize-.28}) {#7};
    \node[dimlabel] at ({\C*\cellsize/2-.035},{-\R*\cellsize-.65}) {#8};
  \end{scope}
}
\newcommand{\ScalarBlock}[8]{%
  \begin{scope}[shift={(#2,#3)}]
    \fill[rounded corners=2pt,#6!58] (0,0) rectangle (1.05,-1.05);
    \draw[rounded corners=2pt,black!45,line width=.65pt] (0,0) rectangle (1.05,-1.05);
    \coordinate (#1-west) at (0,-.525);
    \coordinate (#1-east) at (1.05,-.525);
    \coordinate (#1-center) at (.525,-.525);
    \node[symbol] at (.525,-1.35) {#7};
    \node[dimlabel] at (.525,-1.72) {#8};
  \end{scope}
}
\newcommand{\MeaningBox}[3]{%
  \node[note,anchor=north west] (meaning) at (-13.6,-6.0) {%
    \begin{minipage}{26.5cm}
      \textbf{轴}\quad #1\\[5pt]
      \textbf{对象}\quad #2\\[5pt]
      \textbf{机制}\quad #3
    \end{minipage}};
}
\newcommand{\Identity}[1]{%
  \node[font=\scriptsize,text=black!42,anchor=north] at (0,-8.15) {#1};
}
`;

const diagrams = [
  {
    id: "p02-vectorized-gradient",
    body: String.raw`
\node[font=\large] at (0,0) {$\nabla_{\theta}J(\theta)=X^\top(X\theta-y),\qquad
\theta\leftarrow\theta-\alpha\nabla_{\theta}J(\theta)$};
\node[stage] at (0,-.75) {向量化梯度：预测 $\rightarrow$ 残差 $\rightarrow$ 按特征聚合};
\DenseBlock{X}{-12.6}{-1.45}{5}{3}{roleTeal}{$X$}{$m\times n$}
\DenseBlock{theta}{-8.55}{-1.45}{3}{1}{roleOrange}{$\theta$}{$n\times1$}
\node[op] at (-9.65,-2.1) {$\times$};
\DenseBlock{pred}{-6.3}{-1.45}{5}{1}{roleViolet}{$X\theta$}{$m\times1$}
\node[op] at (-4.9,-2.1) {$-$};
\DenseBlock{y}{-3.55}{-1.45}{5}{1}{roleCoral}{$y$}{$m\times1$}
\node[op] at (-1.75,-2.1) {$=$};
\DenseBlock{res}{-.55}{-1.45}{5}{1}{roleCoral}{$r=X\theta-y$}{$m\times1$}
\node[op] at (1.2,-2.1) {$\Longrightarrow$};
\DenseBlock{Xt}{2.1}{-1.45}{3}{5}{roleTeal}{$X^\top$}{$n\times m$}
\node[op] at (5.05,-2.1) {$\times$};
\DenseBlock{res2}{6.1}{-1.45}{5}{1}{roleCoral}{$r$}{$m\times1$}
\node[op] at (7.65,-2.1) {$=$};
\DenseBlock{grad}{8.8}{-1.45}{3}{1}{roleOrange}{$\nabla_\theta J$}{$n\times1$}
\node[tag] at (3.2,-4.35) {收缩样本轴 $m$};
\MeaningBox{$m$ 是样本数，$n$ 是参数/特征数；同一个 $m$ 轴贯穿预测、标签与残差。}
{$X$ 是设计矩阵，$\theta$ 是待学习参数，$r$ 是逐样本误差，梯度与参数同形。}
{$X\theta$ 沿特征轴 $n$ 收缩；$X^\top r$ 再沿样本轴 $m$ 聚合，把误差信号分配回每个参数。}
\Identity{线性回归的向量化梯度}
`,
  },
  {
    id: "p02-normal-equation",
    body: String.raw`
\node[font=\large] at (0,0) {$X^\top X\hat\theta=X^\top y,\qquad
\hat\theta=(X^\top X)^{-1}X^\top y$};
\node[stage] at (0,-.75) {令梯度为零后，样本轴被消去，只留下参数空间中的线性系统};
\DenseBlock{Xt}{-11.8}{-1.4}{3}{5}{roleTeal}{$X^\top$}{$n\times m$}
\DenseBlock{X}{-8.1}{-1.4}{5}{3}{roleTeal}{$X$}{$m\times n$}
\node[op] at (-9.15,-2.1) {$\times$};
\node[op] at (-5.95,-2.1) {$=$};
\DenseBlock{gram}{-4.75}{-1.4}{3}{3}{roleViolet}{$X^\top X$}{$n\times n$}
\DenseBlock{theta}{-1.6}{-1.4}{3}{1}{roleOrange}{$\hat\theta$}{$n\times1$}
\node[op] at (-2.55,-2.1) {$\times$};
\node[op] at (-.1,-2.1) {$=$};
\DenseBlock{Xtr}{1.1}{-1.4}{3}{5}{roleTeal}{$X^\top$}{$n\times m$}
\DenseBlock{y}{4.85}{-1.4}{5}{1}{roleCoral}{$y$}{$m\times1$}
\node[op] at (3.8,-2.1) {$\times$};
\node[op] at (6.35,-2.1) {$=$};
\DenseBlock{rhs}{7.6}{-1.4}{3}{1}{roleCoral}{$X^\top y$}{$n\times1$}
\node[tag] at (-9.4,-4.25) {沿 $m$ 聚合};
\node[tag] at (3.1,-4.25) {沿 $m$ 聚合};
\MeaningBox{$X^\top X$ 是 $n\times n$ 方阵；左右两端最终都落在参数空间 $\mathbb R^n$。}
{$X^\top X$ 是特征 Gram 矩阵，$X^\top y$ 是特征与目标的相关量，$\hat\theta$ 是线性系统的解。}
{正规方程不是必须显式求逆；实现中优先用 QR、SVD 或线性求解器，避免放大条件数与数值误差。}
\Identity{最小二乘的正规方程}
`,
  },
  {
    id: "p02-least-squares-projection",
    body: String.raw`
\node[font=\large] at (0,0) {$y=X\hat\theta+r,\qquad X^\top r=0$};
\node[stage] at (0,-.75) {目标向量被分成“可由特征解释的部分”和“与全部特征正交的残差”};
\DenseBlock{y}{-10.8}{-1.5}{5}{1}{roleCoral}{$y$}{$m\times1$}
\node[op] at (-9.2,-2.3) {$=$};
\DenseBlock{X}{-7.65}{-1.5}{5}{3}{roleTeal}{$X$}{$m\times n$}
\DenseBlock{theta}{-4.05}{-1.5}{3}{1}{roleOrange}{$\hat\theta$}{$n\times1$}
\node[op] at (-5.05,-2.3) {$\times$};
\node[op] at (-2.6,-2.3) {$+$};
\DenseBlock{res}{-1.25}{-1.5}{5}{1}{roleCoral}{$r$}{$m\times1$}
\draw[roleTeal,line width=1.2pt,fill=roleTeal!8] (3.2,-4.4) -- (10.7,-4.4) -- (8.25,-1.3) -- cycle;
\node[dimlabel] at (7.3,-4.75) {$\operatorname{Col}(X)$：可表达的预测子空间};
\draw[flow,draw=roleViolet] (5.05,-3.65) -- node[above,sloped,font=\small] {$\hat y=X\hat\theta$} (8.15,-2.35);
\draw[flow,draw=roleCoral] (8.15,-2.35) -- node[right,font=\small] {$r$} (8.15,-.95);
\draw[black!50,line width=.55pt] (7.82,-2.48) -- (7.82,-2.15) -- (8.15,-2.02);
\node[symbol] at (9.65,-1.05) {$r\perp\operatorname{Col}(X)$};
\MeaningBox{$m$ 是观测空间维度；$X$ 的 $n$ 个列向量张成预测可达到的子空间。}
{$\hat y=X\hat\theta$ 是 $y$ 在列空间上的正交投影，$r=y-\hat y$ 是无法被当前特征解释的部分。}
{$X^\top r=0$ 表示残差与每个特征列都正交；把它展开，恰好得到 $X^\top X\hat\theta=X^\top y$。}
\Identity{最小二乘的正交投影}
`,
  },
  {
    id: "p03-matrix-multiplication",
    body: String.raw`
\node[font=\large] at (0,0) {$C=AB,\qquad C_{ij}=\sum_{k=1}^{n}A_{ik}B_{kj}$};
\node[stage] at (0,-.75) {矩阵乘法：左矩阵的一行与右矩阵的一列做内积};
\DenseBlock{A}{-10.6}{-1.45}{4}{5}{roleTeal}{$A$}{$m\times n$}
\node[op] at (-7.55,-2.3) {$\times$};
\DenseBlock{B}{-6.2}{-1.45}{5}{3}{roleOrange}{$B$}{$n\times p$}
\node[op] at (-3.55,-2.3) {$=$};
\DenseBlock{C}{-2.0}{-1.45}{4}{3}{roleViolet}{$C=AB$}{$m\times p$}
\node[tag] at (-7.6,-4.35) {共同边长 $n$ 被收缩};
\draw[rounded corners=2pt,fill=roleTeal!58,draw=none] (4.0,-1.65) rectangle (8.0,-2.02);
\node[dimlabel,anchor=east] at (3.65,-1.83) {$A_{i,:}$};
\draw[rounded corners=2pt,fill=roleOrange!62,draw=none] (8.65,-1.1) rectangle (9.02,-4.1);
\node[dimlabel] at (8.84,-4.45) {$B_{:,j}$};
\node[op] at (8.35,-2.0) {$\cdot$};
\node[op] at (10.0,-2.55) {$=$};
\fill[rounded corners=1pt,roleViolet!72] (10.8,-2.35) rectangle ++(.5,-.5);
\node[symbol] at (11.05,-3.25) {$C_{ij}$};
\MeaningBox{$m$ 是输出行数，$p$ 是输出列数，$n$ 同时是 $A$ 的列轴和 $B$ 的行轴。}
{$A_{i,:}$ 是第 $i$ 行向量，$B_{:,j}$ 是第 $j$ 列向量，$C_{ij}$ 是它们内积得到的标量。}
{收缩轴 $n$ 在两个输入中必须一致；它在输出中消失，而未收缩的 $m,p$ 两轴被保留。}
\Identity{矩阵乘法的收缩轴}
`,
  },
  {
    id: "p03-orthogonal-projection",
    body: String.raw`
\node[font=\large] at (0,0) {$\hat x=UU^\top x,\qquad P=UU^\top,\quad P^\top=P,\ P^2=P$};
\node[stage] at (0,-.75) {先测量各基方向的坐标，再用同一组基向量重建投影};
\DenseBlock{Ut}{-11.1}{-1.45}{3}{5}{roleTeal}{$U^\top$}{$k\times m$}
\DenseBlock{x}{-7.5}{-1.45}{5}{1}{roleCoral}{$x$}{$m\times1$}
\node[op] at (-8.6,-2.2) {$\times$};
\node[op] at (-6.0,-2.2) {$=$};
\DenseBlock{coef}{-4.85}{-1.45}{3}{1}{roleOrange}{$c=U^\top x$}{$k\times1$}
\node[op] at (-2.8,-2.2) {$\longrightarrow$};
\DenseBlock{U}{-1.2}{-1.45}{5}{3}{roleTeal}{$U$}{$m\times k$}
\DenseBlock{coef2}{2.4}{-1.45}{3}{1}{roleOrange}{$c$}{$k\times1$}
\node[op] at (1.35,-2.2) {$\times$};
\node[op] at (3.95,-2.2) {$=$};
\DenseBlock{proj}{5.1}{-1.45}{5}{1}{roleViolet}{$\hat x$}{$m\times1$}
\node[tag] at (-9.25,-4.35) {分析：压到 $k$ 维};
\node[tag] at (1.15,-4.35) {合成：还原到 $m$ 维};
\MeaningBox{$m$ 是原空间维度，$k$ 是子空间维度；$U$ 的 $k$ 个列向量是正交归一基。}
{$c$ 是坐标/系数向量，$\hat x$ 是子空间内离 $x$ 最近的向量，$P$ 是 $m\times m$ 投影算子。}
{$U^\top$ 做分析、$U$ 做合成；$P^2=P$ 表示投影一次后再次投影不会改变结果。}
\Identity{正交投影的分析与合成}
`,
  },
  {
    id: "p03-svd-pseudoinverse",
    body: String.raw`
\node[font=\large] at (0,0) {$A=U\Sigma V^\top,\qquad A^+=V\Sigma^+U^\top$};
\node[stage] at (0,-.75) {SVD 把线性变换拆成：旋转坐标 $\rightarrow$ 按方向缩放 $\rightarrow$ 旋转到输出空间};
\DenseBlock{Vt}{-11.6}{-1.45}{3}{3}{roleTeal}{$V^\top$}{$n\times n$}
\DiagBlock{S}{-8.45}{-1.45}{4}{3}{roleOrange}{$\Sigma$}{$m\times n$}
\DenseBlock{U}{-5.3}{-1.45}{4}{4}{roleViolet}{$U$}{$m\times m$}
\node[op] at (-9.25,-2.2) {$\rightarrow$};
\node[op] at (-6.1,-2.2) {$\rightarrow$};
\node[symbol] at (-7.2,-4.65) {正向：$x\mapsto V^\top x\mapsto\Sigma V^\top x\mapsto Ax$};
\node[op] at (0,-2.2) {$\Longleftrightarrow$};
\DenseBlock{Ut}{2.0}{-1.45}{4}{4}{roleViolet}{$U^\top$}{$m\times m$}
\DiagBlock{Sp}{5.75}{-1.45}{3}{4}{roleOrange}{$\Sigma^+$}{$n\times m$}
\DenseBlock{V}{8.9}{-1.45}{3}{3}{roleTeal}{$V$}{$n\times n$}
\node[op] at (4.9,-2.2) {$\rightarrow$};
\node[op] at (8.05,-2.2) {$\rightarrow$};
\node[symbol] at (6.9,-4.65) {逆向：只对可辨识方向取 $1/\sigma_i$};
\MeaningBox{$m,n$ 是输出/输入空间维度；对角线方向代表奇异方向，示意单元格表达结构而非字面维数。}
{$U,V$ 是正交基变换，$\Sigma$ 的非零对角元 $\sigma_i$ 是缩放强度，$\Sigma^+$ 对其取倒数。}
{零奇异值保持为零；很小的 $\sigma_i$ 会放大噪声，因此数值库用阈值截断，得到稳定的最小二乘解。}
\Identity{SVD 与伪逆的方向分解}
`,
  },
  {
    id: "p10-kernel-gram",
    body: String.raw`
\node[font=\large] at (0,0) {$K_{ij}=K(x^{(i)},x^{(j)})=\phi(x^{(i)})^\top\phi(x^{(j)}),
\qquad c^\top Kc=\left\|\sum_i c_i\phi(x^{(i)})\right\|^2\ge0$};
\node[stage] at (0,-.75) {同一组样本两两比较，形成对称半正定的 Gram 矩阵};
\DenseBlock{samples}{-11.4}{-1.45}{5}{3}{roleTeal}{$X$：样本集合}{$m\times d$}
\node[op] at (-8.45,-2.35) {$\xrightarrow{\ \phi\ }$};
\DenseBlock{features}{-6.2}{-1.45}{5}{4}{roleOrange}{$\Phi$：隐式特征}{$m\times D$}
\node[op] at (-2.55,-2.35) {$\times$};
\DenseBlock{featurest}{-1.1}{-1.45}{4}{5}{roleOrange}{$\Phi^\top$}{$D\times m$}
\node[op] at (2.05,-2.35) {$=$};
\DenseBlock{gram}{3.5}{-1.45}{5}{5}{roleViolet}{$K=\Phi\Phi^\top$}{$m\times m$}
\draw[roleCoral,line width=1pt] (3.5,-1.45) -- (5.8,-3.75);
\node[tag] at (8.1,-2.0) {$K_{ij}=K_{ji}$：关于对角线对称};
\node[tag] at (8.1,-3.0) {$c^\top Kc\ge0$：任意方向能量非负};
\MeaningBox{$m$ 是样本数，$d$ 是原始特征维度，$D$ 是可能极高甚至无限的隐式特征维度。}
{$K_{ij}$ 是两个样本在特征空间的内积；$K$ 是相似度矩阵，而不是分类标签或距离矩阵。}
{Kernel trick 直接计算 $K(x,z)$，无需显式构造 $\phi(x)$；合法核保证任意样本集上的 $K$ 对称半正定。}
\Identity{Kernel Gram 矩阵}
`,
  },
  {
    id: "p10-kernel-svm-prediction",
    body: String.raw`
\node[font=\large] at (0,0) {$f(x)=\sum_{i=1}^{m}\alpha_i y_iK(x^{(i)},x)+b
=\sum_{i\in\mathrm{SV}}\alpha_i y_iK(x^{(i)},x)+b$};
\node[stage] at (0,-.75) {训练样本先经支持向量掩码筛选，再与查询样本计算核相似度并加权归约};
\DenseBlock{alpha}{-12.0}{-1.45}{5}{1}{roleOrange}{$\alpha$}{$m\times1$}
\DenseBlock{mask}{-10.0}{-1.45}{5}{1}{roleGray}{$\mathbf1[\alpha_i>0]$}{$m\times1$ 布尔}
\node[op] at (-10.95,-2.35) {$\rightarrow$};
\node[op] at (-8.55,-2.35) {$\operatorname{gather}$};
\DenseBlock{sv}{-6.65}{-1.45}{4}{3}{roleTeal}{$X_{\mathrm{SV}}$}{$s\times d$}
\node[op] at (-3.6,-2.35) {$K(\cdot,x)$};
\DenseBlock{kvec}{-1.6}{-1.45}{4}{1}{roleViolet}{$k_x$}{$s\times1$}
\node[op] at (.05,-2.35) {$\odot$};
\DenseBlock{weight}{1.3}{-1.45}{4}{1}{roleOrange}{$\alpha_{\mathrm{SV}}\odot y_{\mathrm{SV}}$}{$s\times1$}
\node[op] at (3.45,-2.35) {$\sum$};
\node[draw=black!45,rounded corners=2pt,minimum width=1.3cm,minimum height=1.3cm,
  fill=roleCoral!55,symbol] (score) at (5.25,-2.35) {$f(x)$};
\node[dimlabel] at (5.25,-3.35) {标量分数};
\node[tag] at (8.6,-1.75) {$s\le m$：支持向量数量};
\node[tag] at (8.6,-2.75) {预测成本约为 $O(sd)$（取决于核）};
\node[tag] at (8.6,-3.75) {$\operatorname{sign}(f(x))$ 给出类别};
\MeaningBox{$m$ 是训练样本数，$s$ 是非零 $\alpha_i$ 对应的支持向量数，$d$ 是输入维度。}
{$\alpha$ 是非负对偶系数，布尔掩码只表示支持集合；$k_x$ 是查询与各支持向量的核值。}
{筛选链必须区分“连续权重 $\alpha$”与“离散支持掩码”；最终沿支持向量轴 $s$ 做加权求和，再加偏置 $b$。}
\Identity{Kernel SVM 的支持向量预测}
`,
  },
];

function makePipeline({
  id,
  formula,
  stage,
  objects,
  operators,
  axes,
  semantics,
  mechanism,
  identity,
}) {
  const left = -11.5;
  const right = 11.5;
  const step = objects.length === 1 ? 0 : (right - left) / (objects.length - 1);
  const blocks = objects
    .map((object, index) => {
      const x = left + index * step;
      const command =
        object.kind === "diag"
          ? "\\DiagBlock"
          : object.rows === 1 && object.cols === 1
            ? "\\ScalarBlock"
            : "\\DenseBlock";
      return `${command}{obj${index}}{${x.toFixed(2)}}{-1.45}{${object.rows}}{${object.cols}}{${object.color}}{${object.label}}{${object.shape}}`;
    })
    .join("\n");
  const operationNodes = operators
    .map((operator, index) => {
      const x = left + step * (index + 0.5);
      return `\\node[op] at (${x.toFixed(2)},-2.25) {${operator}};`;
    })
    .join("\n");
  return {
    id,
    body: String.raw`
\node[font=\large] at (0,0) {${formula}};
\node[stage] at (0,-.75) {${stage}};
${blocks}
${operationNodes}
\MeaningBox{${axes}}
{${semantics}}
{${mechanism}}
\Identity{${identity}}
`,
  };
}

diagrams.push(
  makePipeline({
    id: "p01-learning-system-map",
    formula: String.raw`$\mathcal D\xrightarrow{\ \mathcal A\ }\theta
      \xrightarrow{\ h_\theta\ }\hat y,\qquad
      \hat R(\theta)=\frac1m\sum_{i=1}^m\ell(h_\theta(x^{(i)}),y^{(i)})$`,
    stage: String.raw`机器学习闭环：数据经过学习算法形成参数，再由模型产生预测并接受风险评估`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$\mathcal D$`, shape: String.raw`$m\times(n+1)$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta=\mathcal A(\mathcal D)$`, shape: String.raw`$n\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$\hat y=h_\theta(X)$`, shape: String.raw`$m\times1$` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$\ell(\hat y,y)$`, shape: String.raw`$m\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\hat R(\theta)$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\xrightarrow{\mathcal A}$`, String.raw`$\xrightarrow{h_\theta}$`, String.raw`$\xrightarrow{\ell}$`, String.raw`$\xrightarrow{\frac1m\sum}$`],
    axes: String.raw`$m$ 是样本轴，$n$ 是特征/参数轴；逐样本损失保留 $m$，平均风险把它归约为标量。`,
    semantics: String.raw`$\mathcal D$ 是带标签数据，$\mathcal A$ 是学习算法，$\theta$ 是模型参数，$\hat R$ 是经验风险。`,
    mechanism: String.raw`训练不是直接记住输出，而是用数据选择参数；评估再把逐样本误差聚合成可优化的目标。`,
    identity: "机器学习系统的训练与评估闭环",
  }),
  makePipeline({
    id: "p04-locally-weighted-newton",
    formula: String.raw`$\theta(x)=(X^\top W(x)X)^{-1}X^\top W(x)y,\qquad
      \theta\leftarrow\theta-H^{-1}\nabla J$`,
    stage: String.raw`局部加权回归用查询相关的对角权重重塑数据；Newton 法再用曲率校正更新方向`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { kind: "diag", rows: 5, cols: 5, color: "roleOrange", label: String.raw`$W(x)$`, shape: String.raw`$m\times m$` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$y$`, shape: String.raw`$m\times1$` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`$H$`, shape: String.raw`$n\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\Delta\theta$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\odot$`, String.raw`$\longrightarrow$`, String.raw`$\operatorname{curvature}$`, String.raw`$\times(-H^{-1})$`],
    axes: String.raw`$W(x)$ 的两个轴都是样本轴；$H$ 和参数更新都位于 $n$ 维参数空间。`,
    semantics: String.raw`$W(x)$ 的对角元是查询点对各训练样本的局部权重；$H$ 是目标函数 Hessian。`,
    mechanism: String.raw`带宽 $\tau$ 控制局部邻域；Newton 更新用 $H^{-1}$ 缩放梯度，在不同曲率方向采用不同步长。`,
    identity: "局部加权回归与 Newton 曲率更新",
  }),
  makePipeline({
    id: "p05-glm-exponential-family",
    formula: String.raw`$p(y;\eta)=b(y)e^{\eta^\top T(y)-a(\eta)},\qquad
      \eta=\theta^\top x,\quad \mathbb E[y\mid x]=g^{-1}(\eta)$`,
    stage: String.raw`GLM 把输入的线性预测量连接到指数族自然参数，再由分布给出条件均值`,
    objects: [
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta$`, shape: String.raw`$n\times1$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$\eta=X\theta$`, shape: String.raw`$m\times1$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$\mu=g^{-1}(\eta)$`, shape: String.raw`$m\times1$` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$p(y\mid\eta)$`, shape: String.raw`$m$ 个分布` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\xrightarrow{g^{-1}}$`, String.raw`$\longrightarrow$`, String.raw`$\xrightarrow{\text{likelihood}}$`],
    axes: String.raw`线性层收缩特征轴 $n$，样本轴 $m$ 从自然参数一直保留到条件分布。`,
    semantics: String.raw`$\eta$ 是自然参数，$T(y)$ 是充分统计量，$a(\eta)$ 是对数配分函数，$\mu$ 是条件均值。`,
    mechanism: String.raw`选择指数族分布与响应函数后，GLM 的学习仍归结为估计共享参数 $\theta$。`,
    identity: "指数族到广义线性模型",
  }),
  makePipeline({
    id: "p06-bayes-update",
    formula: String.raw`$p(\theta\mid D)=
      \frac{p(D\mid\theta)p(\theta)}{\int p(D\mid\vartheta)p(\vartheta)\,d\vartheta}$`,
    stage: String.raw`Bayes 更新：先验与似然逐点相乘，再由证据做全局归一化得到后验`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$p(\theta)$`, shape: String.raw`参数网格 $q\times1$` },
      { rows: 5, cols: 1, color: "roleOrange", label: String.raw`$p(D\mid\theta)$`, shape: String.raw`$q\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`未归一化后验`, shape: String.raw`$q\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$p(D)$`, shape: String.raw`标量证据` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$p(\theta\mid D)$`, shape: String.raw`$q\times1$` },
    ],
    operators: [String.raw`$\odot$`, String.raw`$=$`, String.raw`$\xrightarrow{\sum/\int}$`, String.raw`$\xrightarrow{\div p(D)}$`],
    axes: String.raw`$q$ 表示示意参数网格；归一化沿全部候选参数归约，输出重新成为概率分布。`,
    semantics: String.raw`先验表达观测前信念，似然评价参数对数据的解释，证据是归一化常数，后验融合二者。`,
    mechanism: String.raw`乘法在同一参数位置逐点发生；证据保证后验非负且总质量为 $1$。`,
    identity: "Bayes 公式的逐点乘法与归一化",
  }),
  makePipeline({
    id: "p07-gda-generative-classification",
    formula: String.raw`$\delta_k(x)=
      -\frac12(x-\mu_k)^\top\Sigma^{-1}(x-\mu_k)+\log\phi_k,\qquad
      \hat y=\arg\max_k\delta_k(x)$`,
    stage: String.raw`GDA 为每个类别计算共享协方差下的 Mahalanobis 分数，再在类别轴上取最大值`,
    objects: [
      { rows: 1, cols: 4, color: "roleTeal", label: String.raw`$x$`, shape: String.raw`$1\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$\mu$`, shape: String.raw`$K\times n$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$\Sigma^{-1}$`, shape: String.raw`$n\times n$` },
      { rows: 3, cols: 1, color: "roleCoral", label: String.raw`$\delta(x)$`, shape: String.raw`$K\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\hat y$`, shape: String.raw`类别 ID` },
    ],
    operators: [String.raw`$-\mu_k$`, String.raw`$\operatorname{quadratic}$`, String.raw`$+\log\phi$`, String.raw`$\arg\max_K$`],
    axes: String.raw`$n$ 是特征轴，$K$ 是类别轴；二次型收缩两个 $n$ 轴，保留每类一个分数。`,
    semantics: String.raw`$\mu_k$ 是类均值，$\Sigma$ 是共享协方差，$\phi_k$ 是类先验，$\hat y$ 是离散类别。`,
    mechanism: String.raw`共享协方差使类别分数之差中的二次项抵消，因此两类 GDA 的决策边界为线性。`,
    identity: "GDA 的生成式分类分数",
  }),
  makePipeline({
    id: "p08-svm-margin-kkt",
    formula: String.raw`$\gamma_i=\frac{y_i(w^\top x_i+b)}{\|w\|_2},\qquad
      \alpha_i\bigl(y_i(w^\top x_i+b)-1\bigr)=0$`,
    stage: String.raw`SVM 先计算所有样本的几何间隔，再由 KKT 互补条件识别真正约束边界的支持向量`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$w$`, shape: String.raw`$n\times1$` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$y$`, shape: String.raw`$m\times1,\ \{-1,+1\}$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$\gamma$`, shape: String.raw`$m\times1$` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$\mathbf1[\alpha_i>0]$`, shape: String.raw`$m\times1$ 布尔` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\odot$`, String.raw`$\div\|w\|$`, String.raw`$\xrightarrow{\mathrm{KKT}}$`],
    axes: String.raw`矩阵乘法收缩特征轴 $n$；间隔、对偶系数和支持掩码都沿样本轴 $m$ 对齐。`,
    semantics: String.raw`$\gamma_i$ 是带符号几何间隔，$\alpha_i$ 是对偶系数，支持掩码是离散集合指示器。`,
    mechanism: String.raw`只有落在间隔边界或违反间隔的样本可能有 $\alpha_i>0$，它们决定最终超平面。`,
    identity: "SVM 间隔与 KKT 支持向量",
  }),
  makePipeline({
    id: "p09-broadcasting-vectorization",
    formula: String.raw`$Z=XW+\mathbf1_m b^\top,\qquad
      (m\times n)(n\times p)+(m\times1)(1\times p)\to m\times p$`,
    stage: String.raw`向量化把样本批次一次送入矩阵乘法；广播只复制缺失轴，不改变单个偏置的语义`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$W$`, shape: String.raw`$n\times p$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$XW$`, shape: String.raw`$m\times p$` },
      { rows: 1, cols: 4, color: "roleCoral", label: String.raw`$b^\top$`, shape: String.raw`$1\times p$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$Z$`, shape: String.raw`$m\times p$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$+\operatorname{broadcast}_m$`, String.raw`$=$`],
    axes: String.raw`$n$ 是矩阵乘法收缩轴；$m$ 是批次轴；偏置只拥有输出轴 $p$，沿 $m$ 被广播。`,
    semantics: String.raw`$W$ 是线性变换，$b$ 是每个输出通道共享的偏置，$Z$ 与批量输出同形。`,
    mechanism: String.raw`广播要求从尾轴对齐且维度相等或为 $1$；显式写出目标形状能避免静默算错。`,
    identity: "NumPy 矩阵乘法与广播",
  }),
  makePipeline({
    id: "p11-cross-validation-model-selection",
    formula: String.raw`$\widehat R_{\mathrm{CV}}(\lambda)=
      \frac1K\sum_{k=1}^K R_k(\lambda),\qquad
      \lambda^\star=\arg\min_\lambda\widehat R_{\mathrm{CV}}(\lambda)$`,
    stage: String.raw`每个候选超参数在相同的 K 个验证折上接受评估，再沿折轴平均并沿候选轴选择`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`折分配`, shape: String.raw`$m\times K$ 掩码` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`候选 $\lambda$`, shape: String.raw`$L\times1$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$R_{l,k}$`, shape: String.raw`$L\times K$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$\bar R_l$`, shape: String.raw`$L\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\lambda^\star$`, shape: String.raw`候选 ID` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\operatorname{fit/eval}$`, String.raw`$\operatorname{mean}_K$`, String.raw`$\arg\min_L$`],
    axes: String.raw`$K$ 是验证折轴，$L$ 是候选超参数轴；平均只消去 $K$，模型选择再消去 $L$。`,
    semantics: String.raw`$R_{l,k}$ 是候选 $l$ 在折 $k$ 的验证误差；$\lambda^\star$ 是选择结果而非连续分数。`,
    mechanism: String.raw`测试集不能参与 $\arg\min$；嵌套交叉验证在外层另留评估折，避免选择偏差。`,
    identity: "K 折交叉验证与超参数选择",
  }),
  makePipeline({
    id: "p12-erm-generalization-bound",
    formula: String.raw`$\Pr\!\left(\sup_{h\in\mathcal H}
      |\hat\varepsilon(h)-\varepsilon(h)|>\gamma\right)
      \le 2|\mathcal H|e^{-2m\gamma^2}$`,
    stage: String.raw`经验误差在样本轴上平均；统一收敛界再同时控制整个假设类中的最大偏差`,
    objects: [
      { rows: 4, cols: 5, color: "roleTeal", label: String.raw`$\mathbf1[h_l(x_i)\ne y_i]$`, shape: String.raw`$L\times m$` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$\hat\varepsilon(h_l)$`, shape: String.raw`$L\times1$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$\varepsilon(h_l)$`, shape: String.raw`$L\times1$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$|\hat\varepsilon-\varepsilon|$`, shape: String.raw`$L\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\sup_h$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\operatorname{mean}_m$`, String.raw`$-$`, String.raw`$|\cdot|$`, String.raw`$\max_L$`],
    axes: String.raw`$m$ 是样本轴，$L=|\mathcal H|$ 是有限假设轴；Union Bound 为每个假设付出复杂度代价。`,
    semantics: String.raw`$\hat\varepsilon$ 是经验风险，$\varepsilon$ 是未知真风险，$\gamma$ 是允许偏差。`,
    mechanism: String.raw`样本数增大使集中项指数下降；假设类越大，控制全部假设所需样本越多。`,
    identity: "ERM 的统一收敛与泛化界",
  }),
  makePipeline({
    id: "p13-bagging-variance-reduction",
    formula: String.raw`$\bar f(x)=\frac1B\sum_{b=1}^Bf_b(x),\qquad
      \operatorname{Var}(\bar f)=\rho\sigma^2+\frac{1-\rho}{B}\sigma^2$`,
    stage: String.raw`Bootstrap 产生多份训练集，基学习器给出相关预测，平均沿模型轴降低非相关方差`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$\mathcal D$`, shape: String.raw`$m\times n$` },
      { rows: 4, cols: 5, color: "roleOrange", label: String.raw`Bootstrap IDs`, shape: String.raw`$B\times m$ 整数` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$f_b(x)$`, shape: String.raw`$B\times1$` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$\bar f(x)$`, shape: String.raw`标量` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\operatorname{Var}$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\operatorname{resample}$`, String.raw`$\operatorname{fit}_B$`, String.raw`$\operatorname{mean}_B$`, String.raw`$\longrightarrow$`],
    axes: String.raw`$B$ 是模型/重采样轴，$m$ 是每份样本数；平均只消去模型轴。`,
    semantics: String.raw`Bootstrap IDs 是离散带放回索引，不是权重；$f_b(x)$ 是各模型对同一查询的预测。`,
    mechanism: String.raw`增大 $B$ 只能压低 $(1-\rho)\sigma^2/B$；随机森林通过特征随机化进一步降低相关性 $\rho$。`,
    identity: "Bagging 的模型轴平均与方差降低",
  }),
  makePipeline({
    id: "p14-neural-network-forward",
    formula: String.raw`$Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]},\qquad
      A^{[l]}=\phi^{[l]}(Z^{[l]})$`,
    stage: String.raw`批量前向传播：线性层在通道轴上收缩，偏置沿样本轴广播，激活保持形状`,
    objects: [
      { rows: 3, cols: 5, color: "roleTeal", label: String.raw`$A^{[l-1]}$`, shape: String.raw`$n_{l-1}\times m$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$W^{[l]}$`, shape: String.raw`$n_l\times n_{l-1}$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$Z^{[l]}$`, shape: String.raw`$n_l\times m$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$b^{[l]}$`, shape: String.raw`$n_l\times1$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$A^{[l]}$`, shape: String.raw`$n_l\times m$` },
    ],
    operators: [String.raw`$\leftarrow\times$`, String.raw`$=$`, String.raw`$+\operatorname{broadcast}_m$`, String.raw`$\xrightarrow{\phi}$`],
    axes: String.raw`行轴是神经元/通道，列轴是样本；$n_{l-1}$ 被收缩，$n_l,m$ 保留。`,
    semantics: String.raw`$Z$ 是激活前值，$A$ 是激活后表示，$W,b$ 是该层共享参数。`,
    mechanism: String.raw`逐元素激活不改变形状；跨样本向量化只增加批次列，不复制参数。`,
    identity: "神经网络批量前向传播",
  }),
  makePipeline({
    id: "p15-confusion-matrix-metrics",
    formula: String.raw`$\mathrm{Precision}=\frac{TP}{TP+FP},\quad
      \mathrm{Recall}=\frac{TP}{TP+FN},\quad
      F_1=\frac{2PR}{P+R}$`,
    stage: String.raw`阈值把连续分数变成离散预测，预测与真值的二维计数表再派生不同决策指标`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$s(x)$`, shape: String.raw`$m\times1$ 分数` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$\hat y=\mathbf1[s\ge t]$`, shape: String.raw`$m\times1$ 布尔` },
      { rows: 2, cols: 2, color: "roleOrange", label: String.raw`$\begin{smallmatrix}TP&FN\\FP&TN\end{smallmatrix}$`, shape: String.raw`$2\times2$ 计数` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$(P,R,S,A)$`, shape: String.raw`$4\times1$ 指标` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$F_\beta$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\xrightarrow{\text{threshold }t}$`, String.raw`$\times y$`, String.raw`$\xrightarrow{\text{ratios}}$`, String.raw`$\xrightarrow{\text{trade-off}}$`],
    axes: String.raw`样本轴 $m$ 在计数时被归约；混淆矩阵的两轴分别是真实类别与预测类别。`,
    semantics: String.raw`分数是连续值，预测是布尔决策，TP/FP/FN/TN 是计数，指标是比率；四者不能混为同一对象。`,
    mechanism: String.raw`阈值改变混淆矩阵，从而沿 ROC/PR 曲线移动；指标选择应对应误报与漏报代价。`,
    identity: "混淆矩阵到 Precision、Recall 与 F1",
  }),
  makePipeline({
    id: "p16-backprop-shape-flow",
    formula: String.raw`$dW^{[l]}=\frac1m dZ^{[l]}(A^{[l-1]})^\top,\qquad
      dA^{[l-1]}=(W^{[l]})^\top dZ^{[l]}$`,
    stage: String.raw`反向传播把上游梯度分别收缩到参数空间和前一层表示空间`,
    objects: [
      { rows: 4, cols: 5, color: "roleCoral", label: String.raw`$dZ^{[l]}$`, shape: String.raw`$n_l\times m$` },
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$(A^{[l-1]})^\top$`, shape: String.raw`$m\times n_{l-1}$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$dW^{[l]}$`, shape: String.raw`$n_l\times n_{l-1}$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$(W^{[l]})^\top$`, shape: String.raw`$n_{l-1}\times n_l$` },
      { rows: 3, cols: 5, color: "roleViolet", label: String.raw`$dA^{[l-1]}$`, shape: String.raw`$n_{l-1}\times m$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$\longrightarrow\times$`, String.raw`$=$`],
    axes: String.raw`参数梯度沿样本轴 $m$ 聚合；输入梯度沿当前层通道轴 $n_l$ 收缩。`,
    semantics: String.raw`$dZ$ 是激活前值的上游梯度，$dW$ 与参数同形，$dA^{[l-1]}$ 与前一层表示同形。`,
    mechanism: String.raw`同一个 $dZ$ 有两个消费者：一条支路累计参数梯度，另一条把误差信号传回更早层。`,
    identity: "线性层反向传播的两条收缩路径",
  }),
  makePipeline({
    id: "p17-ml-diagnostic-gaps",
    formula: String.raw`$\Delta_{\mathrm{opt}}=J_{\mathrm{train}}-J^\star_{\mathrm{train}},
      \qquad \Delta_{\mathrm{gen}}=J_{\mathrm{val}}-J_{\mathrm{train}}$`,
    stage: String.raw`调试先把观测到的性能缺口分解到优化、泛化、数据与目标层，而不是直接换模型`,
    objects: [
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`训练切片`, shape: String.raw`$G\times M$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`验证切片`, shape: String.raw`$G\times M$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$\Delta_{\mathrm{gen},g}$`, shape: String.raw`$G\times1$` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`误差类型计数`, shape: String.raw`$G\times C$` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`下一步行动`, shape: String.raw`$G\times1$ ID` },
    ],
    operators: [String.raw`$-$`, String.raw`$\operatorname{gap}$`, String.raw`$\xrightarrow{\text{error analysis}}$`, String.raw`$\arg\max_C$`],
    axes: String.raw`$G$ 是人群/场景切片轴，$M$ 是指标轴，$C$ 是错误类别轴；同形切片才可直接比较。`,
    semantics: String.raw`性能差是连续诊断量，错误类型是计数，行动是离散决策；它们需要显式转换。`,
    mechanism: String.raw`训练差而验证也差优先查偏差/优化；训练好验证差优先查方差、泄漏与分布差异。`,
    identity: "机器学习误差分解与诊断行动",
  }),
  makePipeline({
    id: "p18-midterm-unified-solution-loop",
    formula: String.raw`$\text{assumption}\to p(y\mid x;\theta)\to
      J(\theta)\to\nabla J(\theta)\to\hat\theta\to\text{diagnosis}$`,
    stage: String.raw`期中核心模型共享同一解题闭环：先声明分布假设，再推目标、梯度、求解与验证`,
    objects: [
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta$`, shape: String.raw`$n\times1$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$h_\theta(X)$`, shape: String.raw`$m\times1$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$\ell_i$`, shape: String.raw`$m\times1$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\nabla_\theta J$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\operatorname{predict}$`, String.raw`$\xrightarrow{\ell}$`, String.raw`$\xrightarrow{\sum_m,\ \partial/\partial\theta}$`],
    axes: String.raw`预测和逐样本损失保留 $m$；梯度归约样本轴并回到与参数相同的 $n$ 维。`,
    semantics: String.raw`模型类型改变 $h,\ell$ 的具体形式，但参数、预测、损失和梯度的角色保持稳定。`,
    mechanism: String.raw`每次推导都检查输出域、维度、符号、凸性和数值稳定性，可覆盖线性回归、Logistic、GLM 与 SVM。`,
    identity: "CS229 期中模型的统一解题闭环",
  }),
  makePipeline({
    id: "p19-kmeans-gmm-responsibilities",
    formula: String.raw`$r_{ik}=p(z_i=k\mid x_i),\qquad
      \mu_k=\frac{\sum_i r_{ik}x_i}{\sum_i r_{ik}}$`,
    stage: String.raw`GMM 用责任度矩阵替代 K-means 的硬类别 ID，再沿样本轴加权更新每个簇参数`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times d$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$R=[r_{ik}]$`, shape: String.raw`$m\times K$ 概率` },
      { rows: 5, cols: 4, color: "roleOrange", label: String.raw`$R\odot X$`, shape: String.raw`$m\times K\times d$` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$\sum_i r_{ik}x_i$`, shape: String.raw`$K\times d$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$\mu$`, shape: String.raw`$K\times d$` },
    ],
    operators: [String.raw`$\xrightarrow{\text{E-step}}$`, String.raw`$\operatorname{broadcast}_d$`, String.raw`$\operatorname{sum}_m$`, String.raw`$\div N_k$`],
    axes: String.raw`$m$ 是样本轴，$K$ 是成分轴，$d$ 是特征轴；责任度每行沿 $K$ 求和为 $1$。`,
    semantics: String.raw`硬分配是类别 ID，责任度是连续概率；$N_k=\sum_i r_{ik}$ 是有效样本数。`,
    mechanism: String.raw`E 步生成软分配，M 步按责任度加权归约；K-means 是低方差极限下的硬化近似。`,
    identity: "从 K-means 硬分配到 GMM 责任度",
  }),
  makePipeline({
    id: "p20-em-elbo-coordinate-ascent",
    formula: String.raw`$\log p(x;\theta)=\mathcal L(\theta,Q)+
      D_{\mathrm{KL}}\!\left(Q(z)\|p(z\mid x;\theta)\right)$`,
    stage: String.raw`EM 在分布 Q 与参数 theta 两个坐标上交替优化，使下界贴紧并单调抬高`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times d$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$Q^{(t)}(z_i)$`, shape: String.raw`$m\times K$` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$\mathcal L(\theta,Q)$`, shape: String.raw`标量下界` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$\theta^{(t+1)}$`, shape: String.raw`参数集合` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\ell(\theta^{(t+1)})$`, shape: String.raw`标量似然` },
    ],
    operators: [String.raw`$\xrightarrow{\text{E-step}}$`, String.raw`$\operatorname{expectation}$`, String.raw`$\xrightarrow{\arg\max_\theta}$`, String.raw`$\nearrow$`],
    axes: String.raw`$m$ 是样本轴，$K$ 是隐状态轴；期望沿 $K$ 归约，所有样本贡献再求和为标量。`,
    semantics: String.raw`$Q$ 是辅助后验分布，ELBO 是可优化下界，KL 是下界与真实对数似然之间的间隙。`,
    mechanism: String.raw`E 步令 $Q=p(z\mid x;\theta^{(t)})$ 使 KL 为零；M 步固定 Q 提高下界，因此似然不下降。`,
    identity: "EM 的 ELBO 坐标上升",
  }),
  makePipeline({
    id: "p21-pca-projection-reconstruction",
    formula: String.raw`$Z=X_cU_k,\qquad \hat X=ZU_k^\top,\qquad
      U_k^\top U_k=I_k$`,
    stage: String.raw`PCA 用正交主轴把中心化数据压缩到 k 维，再用转置基重建回原特征空间`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$X_c$`, shape: String.raw`$m\times d$` },
      { rows: 4, cols: 2, color: "roleOrange", label: String.raw`$U_k$`, shape: String.raw`$d\times k$` },
      { rows: 5, cols: 2, color: "roleViolet", label: String.raw`$Z$`, shape: String.raw`$m\times k$` },
      { rows: 2, cols: 4, color: "roleOrange", label: String.raw`$U_k^\top$`, shape: String.raw`$k\times d$` },
      { rows: 5, cols: 4, color: "roleCoral", label: String.raw`$\hat X$`, shape: String.raw`$m\times d$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$\times$`, String.raw`$=$`],
    axes: String.raw`$m$ 是样本轴，$d$ 是原特征轴，$k<d$ 是主成分轴；转置真实交换 $d,k$ 边。`,
    semantics: String.raw`$U_k$ 的列是正交主方向，$Z$ 是低维坐标，$\hat X$ 是秩至多为 $k$ 的重建。`,
    mechanism: String.raw`编码收缩 $d$，解码收缩 $k$；选择最大特征值方向同时最大化保留方差并最小化重建误差。`,
    identity: "PCA 的投影与低秩重建",
  }),
  makePipeline({
    id: "p22-ica-unmixing",
    formula: String.raw`$x=As,\qquad \hat s=Wx,\qquad
      \log p_X(x)=\sum_i\log p_{S_i}(w_i^\top x)+\log|\det W|$`,
    stage: String.raw`ICA 学习解混矩阵 W，把相关观测旋转缩放成统计独立且非 Gaussian 的源信号`,
    objects: [
      { rows: 4, cols: 5, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$n\times m$ 混合信号` },
      { rows: 4, cols: 4, color: "roleOrange", label: String.raw`$W$`, shape: String.raw`$n\times n$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$\hat S=WX$`, shape: String.raw`$n\times m$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$\log p_{S_i}$`, shape: String.raw`$n\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\ell(W)$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\leftarrow\times$`, String.raw`$=$`, String.raw`$\operatorname{independence}$`, String.raw`$+\log|\det W|$`],
    axes: String.raw`$n$ 是源/传感器轴，$m$ 是时间或样本轴；方阵 W 只混合源轴，保留样本轴。`,
    semantics: String.raw`$X$ 是观测混合，$S$ 是潜在独立源，$W$ 是可学习解混矩阵。`,
    mechanism: String.raw`边缘非 Gaussian 对数密度鼓励独立源，$\log|\det W|$ 修正线性变量变换造成的体积变化。`,
    identity: "ICA 的线性解混与似然",
  }),
  makePipeline({
    id: "p23-bellman-value-iteration",
    formula: String.raw`$Q(s,a)=R(s,a)+\gamma\sum_{s'}P_{sa}(s')V(s'),
      \qquad V_{\mathrm{new}}(s)=\max_a Q(s,a)$`,
    stage: String.raw`Bellman 备份先对下一状态轴求期望，再在动作轴上取最大值更新每个状态价值`,
    objects: [
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$P_a$`, shape: String.raw`$|\mathcal S|\times|\mathcal S|$` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$V$`, shape: String.raw`$|\mathcal S|\times1$` },
      { rows: 4, cols: 3, color: "roleViolet", label: String.raw`$Q$`, shape: String.raw`$|\mathcal S|\times|\mathcal A|$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$V_{\mathrm{new}}$`, shape: String.raw`$|\mathcal S|\times1$` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$\pi(s)$`, shape: String.raw`$|\mathcal S|\times1$ 动作 ID` },
    ],
    operators: [String.raw`$\times$`, String.raw`$+R$`, String.raw`$\max_{\mathcal A}$`, String.raw`$\arg\max_{\mathcal A}$`],
    axes: String.raw`转移矩阵的列轴是下一状态 $s'$；期望收缩 $s'$，最大化/选择再消去动作轴。`,
    semantics: String.raw`$Q$ 是连续价值分数，$V$ 是每状态最优分数，$\pi$ 是离散动作 ID。`,
    mechanism: String.raw`价值迭代反复应用 Bellman 最优算子；折扣 $\gamma<1$ 使其成为压缩映射并收敛到唯一不动点。`,
    identity: "Bellman 备份的期望与动作归约",
  }),
  makePipeline({
    id: "p24-fitted-value-iteration",
    formula: String.raw`$y_i=\max_a\!\left[R(s_i,a)+\gamma\frac1M
      \sum_{j=1}^M V_\theta(s'_{ij})\right],\qquad
      \theta^+=\arg\min_\theta\sum_i(V_\theta(s_i)-y_i)^2$`,
    stage: String.raw`拟合价值迭代用模拟下一状态构造 Bellman 监督目标，再把目标回归到函数近似器`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$S$`, shape: String.raw`$m\times d$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$S'_{a,j}$`, shape: String.raw`$m\times A\times M\times d$` },
      { rows: 3, cols: 4, color: "roleViolet", label: String.raw`$V_\theta(S')$`, shape: String.raw`$m\times A\times M$` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$y$`, shape: String.raw`$m\times1$` },
      { rows: 3, cols: 1, color: "roleGray", label: String.raw`$\theta^+$`, shape: String.raw`$p\times1$` },
    ],
    operators: [String.raw`$\xrightarrow{\text{simulate}}$`, String.raw`$\xrightarrow{V_\theta}$`, String.raw`$\operatorname{mean}_M,\max_A$`, String.raw`$\xrightarrow{\text{regress}}$`],
    axes: String.raw`$A$ 是动作轴，$M$ 是模拟样本轴，$d$ 是状态维度，$p$ 是价值函数参数维度。`,
    semantics: String.raw`$S'$ 是模型产生的随机下一状态，$y$ 是停止梯度的 Bellman 回归目标。`,
    mechanism: String.raw`先沿模拟轴估计期望，再沿动作轴取最大；回归误差、采样误差和模型偏差会分别累积。`,
    identity: "连续状态下的拟合价值迭代",
  }),
  makePipeline({
    id: "p25-distribution-deployment-feedback",
    formula: String.raw`$P_{\mathrm{train}}(x,y)\ne P_{\mathrm{deploy}}(x,y),
      \qquad D_{t+1}\sim P(x,y\mid \hat y_t,\text{policy}_t)$`,
    stage: String.raw`部署不是训练的终点：模型决策改变谁被观察和如何产生标签，从而反过来塑造下一轮数据`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$D_{\mathrm{train}}$`, shape: String.raw`$m\times n$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`群体指标`, shape: String.raw`$G\times M$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$\hat y$`, shape: String.raw`$m\times1$ 决策` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`行为/选择 $S$`, shape: String.raw`$m\times1$` },
      { rows: 5, cols: 3, color: "roleGray", label: String.raw`$D_{t+1}$`, shape: String.raw`$m'\times n$` },
    ],
    operators: [String.raw`$\xrightarrow{\text{audit}}$`, String.raw`$\xrightarrow{\text{deploy}}$`, String.raw`$\longrightarrow$`, String.raw`$\xrightarrow{\text{collect}}$`],
    axes: String.raw`$G$ 是群体切片轴，$M$ 是指标轴；新数据的样本数 $m'$ 与训练集 $m$ 不必相同。`,
    semantics: String.raw`预测是模型输出，选择变量 S 表示是否被观察/干预，下一轮数据是受策略影响的条件分布样本。`,
    mechanism: String.raw`总体指标可能掩盖群体差异；若不记录选择机制与部署策略，反馈循环会被误判为自然数据分布。`,
    identity: "部署分布偏移与反馈循环",
  }),
  makePipeline({
    id: "p26-lqr-state-control",
    formula: String.raw`$x_{t+1}=A_tx_t+B_tu_t,\qquad
      u_t=K_tx_t,\qquad V_t(x)=x^\top\Phi_tx$`,
    stage: String.raw`LQR 用线性反馈把当前状态映射为控制量，再通过动力系统推进到下一状态`,
    objects: [
      { rows: 4, cols: 1, color: "roleTeal", label: String.raw`$x_t$`, shape: String.raw`$n\times1$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$K_t$`, shape: String.raw`$p\times n$` },
      { rows: 3, cols: 1, color: "roleViolet", label: String.raw`$u_t$`, shape: String.raw`$p\times1$` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$B_t$`, shape: String.raw`$n\times p$` },
      { rows: 4, cols: 1, color: "roleTeal", label: String.raw`$x_{t+1}$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\leftarrow\times$`, String.raw`$=$`, String.raw`$\times$`, String.raw`$+A_tx_t$`],
    axes: String.raw`$n$ 是状态维度，$p$ 是控制维度；$K_t$ 把状态轴映射到控制轴，$B_t$ 再映回状态轴。`,
    semantics: String.raw`$x_t$ 是系统状态，$u_t$ 是控制输入，$K_t$ 是由 Riccati 递推得到的反馈增益。`,
    mechanism: String.raw`动态规划保持二次价值函数形式；对控制量配方后得到线性最优策略，并从终点向前递推 $\Phi_t$。`,
    identity: "LQR 的状态反馈与动力学传播",
  }),
  makePipeline({
    id: "p27-kalman-predict-update",
    formula: String.raw`$\hat x^-_t=A\hat x_{t-1}+Bu_{t-1},\quad
      K_t=P^-_tC^\top(CP^-_tC^\top+R)^{-1},\quad
      \hat x_t=\hat x^-_t+K_t(y_t-C\hat x^-_t)$`,
    stage: String.raw`Kalman Filter 先用动力学预测，再把观测创新按不确定性自适应加权回状态空间`,
    objects: [
      { rows: 4, cols: 1, color: "roleTeal", label: String.raw`$\hat x^-_t$`, shape: String.raw`$n\times1$` },
      { rows: 3, cols: 1, color: "roleCoral", label: String.raw`$r_t=y_t-C\hat x^-_t$`, shape: String.raw`$p\times1$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$K_t$`, shape: String.raw`$n\times p$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$K_tr_t$`, shape: String.raw`$n\times1$` },
      { rows: 4, cols: 1, color: "roleTeal", label: String.raw`$\hat x_t$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\xrightarrow{y-C\hat x^-}$`, String.raw`$\leftarrow\times$`, String.raw`$=$`, String.raw`$+\hat x^-_t$`],
    axes: String.raw`$n$ 是隐藏状态维度，$p$ 是观测维度；$K_t$ 把观测空间创新映射回状态空间。`,
    semantics: String.raw`$r_t$ 是创新，$S_t$ 是创新协方差，$K_t$ 是根据预测与观测不确定性计算的增益。`,
    mechanism: String.raw`观测噪声大时增益减小，更信任预测；预测不确定性大时增益增大，更依赖当前观测。`,
    identity: "Kalman Filter 的预测—创新—更新",
  }),
  makePipeline({
    id: "p28-multichannel-convolution",
    formula: String.raw`$Y_{i,j,c_o}=\sum_{u,v,c_i}
      X_{i+u,j+v,c_i}W_{u,v,c_i,c_o},\qquad
      n_{\mathrm{out}}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1$`,
    stage: String.raw`多通道卷积在局部空间窗口和输入通道上同时收缩，并为每个输出通道生成一张特征图`,
    objects: [
      { rows: 5, cols: 5, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$H\times W\times C_{\mathrm{in}}$` },
      { rows: 3, cols: 3, color: "roleOrange", label: String.raw`$W_{:,:,:,c_o}$`, shape: String.raw`$k_h\times k_w\times C_{\mathrm{in}}$` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`局部乘积`, shape: String.raw`$k_h\times k_w\times C_{\mathrm{in}}$` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$Y_{i,j,c_o}$`, shape: String.raw`标量` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$Y$`, shape: String.raw`$H_o\times W_o\times C_{\mathrm{out}}$` },
    ],
    operators: [String.raw`$\operatorname{extract}$`, String.raw`$\odot$`, String.raw`$\sum_{u,v,c_i}$`, String.raw`$\operatorname{slide}_{i,j,c_o}$`],
    axes: String.raw`$u,v$ 是局部核空间轴，$c_i$ 是输入通道轴，三者被收缩；$i,j,c_o$ 保留在输出。`,
    semantics: String.raw`卷积核是共享参数；一个输出元素是局部块与单个输出通道滤波器的内积。`,
    mechanism: String.raw`Stride 决定滑动步长，Padding 决定边界可见范围；参数共享使参数量不随图像尺寸增长。`,
    identity: "多通道卷积的局部收缩",
  }),
);

diagrams.push(
  makePipeline({
    id: "p04-logistic-irls",
    formula: String.raw`$p=\sigma(X\theta),\quad W=\operatorname{diag}(p_i(1-p_i)),
      \quad \theta^+=\theta-(X^\top WX)^{-1}X^\top(p-y)$`,
    stage: String.raw`IRLS 把 Logistic 回归的局部曲率编码为逐样本对角权重，再解一个加权最小二乘步`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$p=\sigma(X\theta)$`, shape: String.raw`$m\times1$` },
      { kind: "diag", rows: 5, cols: 5, color: "roleOrange", label: String.raw`$W$`, shape: String.raw`$m\times m$` },
      { rows: 3, cols: 3, color: "roleCoral", label: String.raw`$X^\top WX$`, shape: String.raw`$n\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\Delta\theta$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\xrightarrow{\theta,\sigma}$`, String.raw`$\xrightarrow{p(1-p)}$`, String.raw`$\xrightarrow{X^\top(\cdot)X}$`, String.raw`$\xrightarrow{\operatorname{solve}}$`],
    axes: String.raw`样本概率和曲率权重沿 $m$ 对齐；两次与 X 收缩后得到参数空间中的 $n\times n$ Hessian。`,
    semantics: String.raw`$p_i$ 是概率，$W_{ii}$ 是局部曲率而不是样本标签，$\Delta\theta$ 是 Newton 修正量。`,
    mechanism: String.raw`边界附近 $p_i\approx0.5$ 的样本权重大；极有把握的样本曲率小，对 Newton 步影响较弱。`,
    identity: "Logistic 回归的 IRLS 结构",
  }),
  makePipeline({
    id: "p05-softmax-class-axis",
    formula: String.raw`$Z=XW,\qquad P_{ik}=\frac{e^{Z_{ik}}}{\sum_{j=1}^K e^{Z_{ij}}},
      \qquad \sum_kP_{ik}=1$`,
    stage: String.raw`Softmax 只沿类别轴 K 归一化；每个样本独立得到一行类别概率`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$W$`, shape: String.raw`$n\times K$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$Z$`, shape: String.raw`$m\times K$ logits` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$\operatorname{LSE}(Z_i)$`, shape: String.raw`$m\times1$` },
      { rows: 5, cols: 4, color: "roleCoral", label: String.raw`$P$`, shape: String.raw`$m\times K$ 概率` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$\operatorname{reduce}_K$`, String.raw`$\exp(Z-\operatorname{LSE})$`],
    axes: String.raw`$m$ 是样本轴，$n$ 是输入特征轴，$K$ 是互斥类别轴；归一化只消去并广播回 K。`,
    semantics: String.raw`$Z$ 是未归一化 logit，LSE 是每个样本的标量归一化量，P 是类别概率矩阵。`,
    mechanism: String.raw`先减每行最大值再计算 log-sum-exp，可避免指数溢出且不改变最终概率。`,
    identity: "Softmax 的类别轴归一化",
  }),
  makePipeline({
    id: "p06-covariance-gaussian",
    formula: String.raw`$X_c=X-\mathbf1_m\mu^\top,\qquad
      \Sigma=\frac1mX_c^\top X_c,\qquad \Sigma=\Sigma^\top\succeq0$`,
    stage: String.raw`协方差先中心化每个特征，再沿样本轴聚合所有特征对的共同变化`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 1, cols: 4, color: "roleOrange", label: String.raw`$\mu^\top$`, shape: String.raw`$1\times n$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$X_c$`, shape: String.raw`$m\times n$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$X_c^\top$`, shape: String.raw`$n\times m$` },
      { rows: 4, cols: 4, color: "roleCoral", label: String.raw`$\Sigma$`, shape: String.raw`$n\times n$` },
    ],
    operators: [String.raw`$-\operatorname{broadcast}_m$`, String.raw`$=$`, String.raw`$\operatorname{transpose}$`, String.raw`$\times X_c/m$`],
    axes: String.raw`$m$ 是样本轴，$n$ 是随机变量/特征轴；乘积收缩 m，保留两个特征轴形成方阵。`,
    semantics: String.raw`$\mu$ 是特征均值，$X_c$ 是中心化观测，$\Sigma_{jk}$ 衡量特征 j 与 k 的共同变化。`,
    mechanism: String.raw`$\Sigma$ 自动对称半正定；对角线是方差，非对角线是协方差。`,
    identity: "中心化数据到协方差矩阵",
  }),
  makePipeline({
    id: "p07-naive-bayes-log-score",
    formula: String.raw`$\log p(y=k\mid x)=\mathrm{const}+\log\phi_k+
      \sum_{j=1}^n\log p(x_j\mid y=k)$`,
    stage: String.raw`Naive Bayes 在条件独立假设下，把特征似然沿特征轴相加为每个类别的 log-score`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$\log p(x_j\mid y=k)$`, shape: String.raw`$K\times n$ 参数` },
      { rows: 5, cols: 3, color: "roleViolet", label: String.raw`局部 log-likelihood`, shape: String.raw`$m\times K\times n$` },
      { rows: 5, cols: 3, color: "roleCoral", label: String.raw`$S$`, shape: String.raw`$m\times K$` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$\hat y$`, shape: String.raw`$m\times1$ 类别 ID` },
    ],
    operators: [String.raw`$\operatorname{lookup}$`, String.raw`$\operatorname{broadcast}$`, String.raw`$\sum_n+\log\phi$`, String.raw`$\arg\max_K$`],
    axes: String.raw`$m$ 是样本轴，$n$ 是特征轴，$K$ 是类别轴；特征贡献求和后只保留 m 与 K。`,
    semantics: String.raw`条件概率参数是分布表，S 是连续类别分数，预测是离散类别 ID。`,
    mechanism: String.raw`使用 log-domain 把概率连乘变成求和；Laplace 平滑避免任一未见事件把整类概率变成零。`,
    identity: "Naive Bayes 的特征轴 log-score",
  }),
  makePipeline({
    id: "p08-svm-dual-gram",
    formula: String.raw`$\max_{\alpha\ge0}\ \mathbf1^\top\alpha-\frac12\alpha^\top
      \bigl((yy^\top)\odot(XX^\top)\bigr)\alpha,\qquad y^\top\alpha=0$`,
    stage: String.raw`SVM 对偶只通过样本 Gram 矩阵出现特征，标签外积再为相同/不同类别赋予符号`,
    objects: [
      { rows: 5, cols: 5, color: "roleTeal", label: String.raw`$G=XX^\top$`, shape: String.raw`$m\times m$` },
      { rows: 5, cols: 5, color: "roleCoral", label: String.raw`$yy^\top$`, shape: String.raw`$m\times m$` },
      { rows: 5, cols: 5, color: "roleViolet", label: String.raw`$Q$`, shape: String.raw`$m\times m$` },
      { rows: 5, cols: 1, color: "roleOrange", label: String.raw`$\alpha$`, shape: String.raw`$m\times1$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\mathcal L_D$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\odot$`, String.raw`$=$`, String.raw`$\times$`, String.raw`$\alpha^\top(\cdot),\ \sum$`],
    axes: String.raw`两个 m 轴都索引训练样本；Q 与 alpha 收缩一次得到向量，再收缩一次得到标量。`,
    semantics: String.raw`G 是样本内积，Q 是带标签符号的二次项，alpha 是非负对偶变量。`,
    mechanism: String.raw`把 G 替换为任意合法 Kernel Gram 矩阵即可非线性化，而无需显式构造高维特征。`,
    identity: "SVM 对偶中的带标签 Gram 矩阵",
  }),
  makePipeline({
    id: "p11-ridge-regularization",
    formula: String.raw`$\hat\theta_\lambda=(X^\top X+\lambda I)^{-1}X^\top y$`,
    stage: String.raw`Ridge 在特征 Gram 矩阵对角线上统一增加 lambda，抬高小特征值并稳定求解`,
    objects: [
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$X^\top X$`, shape: String.raw`$n\times n$` },
      { kind: "diag", rows: 4, cols: 4, color: "roleOrange", label: String.raw`$\lambda I$`, shape: String.raw`$n\times n$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$X^\top X+\lambda I$`, shape: String.raw`$n\times n$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$X^\top y$`, shape: String.raw`$n\times1$` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$\hat\theta_\lambda$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$+$`, String.raw`$=$`, String.raw`$\operatorname{solve}$`, String.raw`$\longrightarrow$`],
    axes: String.raw`所有对象都位于 n 维参数空间；正则项不引入新轴，只修改方阵对角线。`,
    semantics: String.raw`lambda 是超参数，I 是恒等算子，theta 是收缩后的参数估计。`,
    mechanism: String.raw`Ridge 将每个特征方向的有效特征值从 sigma 增至 sigma+lambda，降低方差但引入偏差。`,
    identity: "Ridge 正则化的对角谱平移",
  }),
  makePipeline({
    id: "p12-generalization-error-decomposition",
    formula: String.raw`$R(\hat h)-R(h_{\mathrm{Bayes}})
      =\underbrace{R(h^\star_{\mathcal H})-R(h_{\mathrm{Bayes}})}_{\text{近似误差}}
      +\underbrace{R(\hat h)-R(h^\star_{\mathcal H})}_{\text{估计误差}}$`,
    stage: String.raw`总超额风险被拆成假设类表达能力不足与有限样本选择不准两种来源`,
    objects: [
      { rows: 1, cols: 1, color: "roleTeal", label: String.raw`$R(h_{\mathrm{Bayes}})$`, shape: String.raw`不可约基准` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$R(h^\star_{\mathcal H})$`, shape: String.raw`类内最优` },
      { rows: 1, cols: 1, color: "roleViolet", label: String.raw`$R(\hat h)$`, shape: String.raw`学习结果` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`近似误差`, shape: String.raw`标量` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`估计误差`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\xrightarrow{\mathcal H}$`, String.raw`$\xrightarrow{m\text{ samples}}$`, String.raw`$-$`, String.raw`$+$`],
    axes: String.raw`这些量均是分布上的标量风险；样本数 m 与假设类复杂度通过误差界影响估计项。`,
    semantics: String.raw`Bayes 风险是理论下限，类内最优不可直接观测，hat h 是 ERM 实际输出。`,
    mechanism: String.raw`扩大模型类通常降低近似误差却提高估计难度；更多数据主要压低估计误差。`,
    identity: "近似误差与估计误差分解",
  }),
  makePipeline({
    id: "p13-adaboost-weight-update",
    formula: String.raw`$\alpha_t=\frac12\log\frac{1-\varepsilon_t}{\varepsilon_t},\qquad
      w_i^{t+1}\propto w_i^t e^{-\alpha_t y_i h_t(x_i)}$`,
    stage: String.raw`AdaBoost 根据弱分类器错误率确定投票权，再提高错分样本在下一轮的权重`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$w^{(t)}$`, shape: String.raw`$m\times1$ 概率` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$h_t(X)$`, shape: String.raw`$m\times1,\ \{-1,+1\}$` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$\mathbf1[h_t\ne y]$`, shape: String.raw`$m\times1$ 布尔` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$\alpha_t$`, shape: String.raw`标量` },
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$w^{(t+1)}$`, shape: String.raw`$m\times1$ 概率` },
    ],
    operators: [String.raw`$\odot$`, String.raw`$\operatorname{compare}_y$`, String.raw`$\sum_m\to\varepsilon_t$`, String.raw`$\operatorname{reweight+normalize}$`],
    axes: String.raw`所有逐样本对象共享 m 轴；错误率沿 m 归约为标量，更新后再归一化回概率向量。`,
    semantics: String.raw`w 是样本分布，错误掩码是布尔量，alpha 是弱学习器投票强度。`,
    mechanism: String.raw`错分样本因指数项获得更大权重；若错误率接近 1/2，alpha 接近零，该学习器贡献很小。`,
    identity: "AdaBoost 的错分重加权",
  }),
  makePipeline({
    id: "p14-multilayer-shape-flow",
    formula: String.raw`$A^{[0]}\xrightarrow{W^{[1]}}A^{[1]}
      \xrightarrow{W^{[2]}}A^{[2]},\qquad
      W^{[l]}:(n_{l-1}\times m)\to(n_l\times m)$`,
    stage: String.raw`每一层只改变通道轴 $n_l$，批次轴 $m$ 从输入到输出始终保持`,
    objects: [
      { rows: 3, cols: 5, color: "roleTeal", label: String.raw`$A^{[0]}$`, shape: String.raw`$n_0\times m$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$A^{[1]}$`, shape: String.raw`$n_1\times m$` },
      { rows: 2, cols: 5, color: "roleCoral", label: String.raw`$A^{[2]}$`, shape: String.raw`$n_2\times m$` },
    ],
    operators: [String.raw`$\xrightarrow{\ W^{[1]},\,b^{[1]},\,\phi^{[1]}\ }$`, String.raw`$\xrightarrow{\ W^{[2]},\,b^{[2]},\,\phi^{[2]}\ }$`],
    axes: String.raw`n0、n1、n2 是逐层通道数，m 是共享批次轴；相邻层的共同通道边必须同长。`,
    semantics: String.raw`激活矩阵按列存样本，权重矩阵只在线性变换时收缩前一层通道。`,
    mechanism: String.raw`深度来自多次“线性变换+非线性”；若省略激活，多层线性矩阵可合并为单层。`,
    identity: "多层神经网络的通道形状流",
  }),
  makePipeline({
    id: "p15-roc-threshold-sweep",
    formula: String.raw`$\hat y_{t,i}=\mathbf1[s_i\ge t],\qquad
      \mathrm{ROC}(t)=(\mathrm{FPR}(t),\mathrm{TPR}(t))$`,
    stage: String.raw`阈值扫描把同一组连续分数变成 T 组预测，再为每个阈值计算一个 ROC 坐标`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$s$`, shape: String.raw`$m\times1$ 分数` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$t$`, shape: String.raw`$T\times1$ 阈值` },
      { rows: 4, cols: 5, color: "roleGray", label: String.raw`$\hat Y$`, shape: String.raw`$T\times m$ 布尔` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$(TP,FP,FN,TN)$`, shape: String.raw`$T\times4$` },
      { rows: 4, cols: 2, color: "roleCoral", label: String.raw`$(FPR,TPR)$`, shape: String.raw`$T\times2$` },
    ],
    operators: [String.raw`$\operatorname{broadcast}$`, String.raw`$\ge$`, String.raw`$\operatorname{count}_m$`, String.raw`$\operatorname{ratios}$`],
    axes: String.raw`T 是阈值轴，m 是样本轴；计数消去 m，却保留每个阈值的结果。`,
    semantics: String.raw`s 是连续排序分数，hat Y 是阈值化布尔矩阵，ROC 坐标是比率而非概率校准。`,
    mechanism: String.raw`AUC 衡量排序能力；它不指定实际阈值，也不直接表达类别不平衡下的业务代价。`,
    identity: "ROC 曲线的阈值轴扫描",
  }),
  makePipeline({
    id: "p16-vjp-chain-rule",
    formula: String.raw`$dZ^{[l]}=dA^{[l]}\odot\phi'(Z^{[l]}),\qquad
      dA^{[l-1]}=(W^{[l]})^\top dZ^{[l]}$`,
    stage: String.raw`反向传播是向量—Jacobian 乘积：先过逐元素激活 Jacobian，再过线性层转置`,
    objects: [
      { rows: 4, cols: 5, color: "roleCoral", label: String.raw`$dA^{[l]}$`, shape: String.raw`$n_l\times m$` },
      { rows: 4, cols: 5, color: "roleGray", label: String.raw`$\phi'(Z^{[l]})$`, shape: String.raw`$n_l\times m$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$dZ^{[l]}$`, shape: String.raw`$n_l\times m$` },
      { rows: 3, cols: 5, color: "roleTeal", label: String.raw`$dA^{[l-1]}$`, shape: String.raw`$n_{l-1}\times m$` },
    ],
    operators: [String.raw`$\odot$`, String.raw`$=$`, String.raw`$\xrightarrow{\ (W^{[l]})^\top\times\ }$`],
    axes: String.raw`激活反向保持 $n_l$ 与 $m$；线性反向收缩 $n_l$，输出前一层通道 $n_{l-1}$ 与批次 $m$。`,
    semantics: String.raw`$dA$ 是上游协向量，激活导数是逐元素局部 Jacobian 的对角表示，$dZ$ 是中间梯度。`,
    mechanism: String.raw`框架通常不构造完整 Jacobian，而是按计算图逆序直接计算 VJP，节省大量内存。`,
    identity: "反向传播的 VJP 链式法则",
  }),
  makePipeline({
    id: "p19-kmeans-hard-assignment",
    formula: String.raw`$c_i=\arg\min_k\|x_i-\mu_k\|^2,\qquad
      \mu_k^+=\frac{\sum_i\mathbf1[c_i=k]x_i}{\sum_i\mathbf1[c_i=k]}$`,
    stage: String.raw`K-means 先形成样本到中心的距离矩阵，再离散选择最近中心并按簇归约更新均值`,
    objects: [
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$D_{ik}$`, shape: String.raw`$m\times K$ 距离` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$c$`, shape: String.raw`$m\times1$ 类别 ID` },
      { rows: 5, cols: 4, color: "roleOrange", label: String.raw`$M_{ik}=\mathbf1[c_i=k]$`, shape: String.raw`$m\times K$ 布尔` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$M^\top X$`, shape: String.raw`$K\times d$` },
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$\mu^+$`, shape: String.raw`$K\times d$` },
    ],
    operators: [String.raw`$\arg\min_K$`, String.raw`$\operatorname{onehot}_K$`, String.raw`$\times X$`, String.raw`$\div N_k$`],
    axes: String.raw`m 是样本轴，K 是簇轴，d 是特征轴；更新时 M 转置后收缩样本轴。`,
    semantics: String.raw`D 是连续距离，c 是离散簇 ID，M 是等价 one-hot 掩码，三者必须明确区分。`,
    mechanism: String.raw`分配步固定中心最小化 c，更新步固定 c 最小化 mu；两步都不增大失真目标。`,
    identity: "K-means 的硬分配与中心更新",
  }),
  makePipeline({
    id: "p20-factor-analysis-covariance",
    formula: String.raw`$x=\mu+\Lambda z+\epsilon,\quad z\sim\mathcal N(0,I_k),
      \quad\epsilon\sim\mathcal N(0,\Psi),\quad
      \operatorname{Cov}(x)=\Lambda\Lambda^\top+\Psi$`,
    stage: String.raw`因子分析用低维共同因子解释相关结构，再用对角噪声补充每个观测维度的独立方差`,
    objects: [
      { rows: 4, cols: 2, color: "roleOrange", label: String.raw`$\Lambda$`, shape: String.raw`$d\times k$` },
      { rows: 2, cols: 5, color: "roleTeal", label: String.raw`$Z$`, shape: String.raw`$k\times m$` },
      { rows: 4, cols: 5, color: "roleViolet", label: String.raw`$\Lambda Z$`, shape: String.raw`$d\times m$` },
      { kind: "diag", rows: 4, cols: 4, color: "roleCoral", label: String.raw`$\Psi$`, shape: String.raw`$d\times d$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$\Lambda\Lambda^\top+\Psi$`, shape: String.raw`$d\times d$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$+\epsilon$`, String.raw`$\xrightarrow{\operatorname{Cov}}$`],
    axes: String.raw`k 是隐因子轴，d 是观测轴，m 是样本轴；通常 k 远小于 d。`,
    semantics: String.raw`Lambda 是载荷矩阵，Z 是潜在因子得分，Psi 是对角特有噪声协方差。`,
    mechanism: String.raw`低秩项建模跨维相关，对角项允许各观测维独立噪声；这比 PCA 的纯投影模型更具生成解释。`,
    identity: "因子分析的低秩加对角协方差",
  }),
  makePipeline({
    id: "p21-pca-covariance-eigen",
    formula: String.raw`$\Sigma=\frac1mX_c^\top X_c=U\Lambda U^\top,\qquad
      U_k=[u_1,\ldots,u_k]$`,
    stage: String.raw`PCA 对中心化数据的协方差做特征分解，并按特征值从大到小选择主方向`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$X_c$`, shape: String.raw`$m\times d$` },
      { rows: 4, cols: 5, color: "roleTeal", label: String.raw`$X_c^\top$`, shape: String.raw`$d\times m$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$\Sigma$`, shape: String.raw`$d\times d$` },
      { kind: "diag", rows: 4, cols: 4, color: "roleOrange", label: String.raw`$\Lambda$`, shape: String.raw`$d\times d$` },
      { rows: 4, cols: 2, color: "roleCoral", label: String.raw`$U_k$`, shape: String.raw`$d\times k$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\div m$`, String.raw`$\xrightarrow{\operatorname{eigh}}$`, String.raw`$\operatorname{top}k$`],
    axes: String.raw`m 是样本轴，d 是原特征轴，k 是保留方向数；协方差必须画成 d×d 方阵。`,
    semantics: String.raw`$\Lambda$ 对角元是各主方向方差，$U$ 列向量是正交特征方向，$U_k$ 是截断基。`,
    mechanism: String.raw`按最大特征值选择方向等价于最大化投影方差；数值实现也可直接对 $X_c$ 做 SVD。`,
    identity: "PCA 的协方差特征分解",
  }),
  makePipeline({
    id: "p22-rl-interaction-loop",
    formula: String.raw`$a_t\sim\pi(\cdot\mid s_t),\qquad
      s_{t+1}\sim P(\cdot\mid s_t,a_t),\qquad
      G_t=\sum_{k\ge0}\gamma^kr_{t+k}$`,
    stage: String.raw`强化学习的数据不是固定表格，而是策略与环境交互后按时间顺序产生的轨迹`,
    objects: [
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$S_t$`, shape: String.raw`$B\times T\times d_s$` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$A_t$`, shape: String.raw`$B\times T$ 动作 ID` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$R_t$`, shape: String.raw`$B\times T$` },
      { rows: 4, cols: 3, color: "roleViolet", label: String.raw`$S_{t+1}$`, shape: String.raw`$B\times T\times d_s$` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$G_t$`, shape: String.raw`$B\times T$` },
    ],
    operators: [String.raw`$\xrightarrow{\pi}$`, String.raw`$\xrightarrow{P,R}$`, String.raw`$+$`, String.raw`$\xrightarrow{\operatorname{scan}_{\gamma,T}}$`],
    axes: String.raw`B 是轨迹批次，T 是时间轴，ds 是状态特征；回报沿未来时间做折扣扫描而非无序平均。`,
    semantics: String.raw`动作是离散 ID 或连续控制，奖励是即时标量，回报是依赖未来的累计随机变量。`,
    mechanism: String.raw`策略改变访问到的状态分布，因此探索与利用不能像监督学习那样假设数据独立同分布。`,
    identity: "强化学习的策略—环境交互轨迹",
  }),
  makePipeline({
    id: "p23-policy-iteration",
    formula: String.raw`$(I-\gamma P_\pi)V^\pi=R_\pi,\qquad
      \pi^+(s)=\arg\max_a\left[R(s,a)+\gamma P_aV^\pi\right]$`,
    stage: String.raw`策略迭代交替精确/近似评估当前策略，再用动作价值逐状态改进策略`,
    objects: [
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$P_\pi$`, shape: String.raw`$S\times S$` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$R_\pi$`, shape: String.raw`$S\times1$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$V^\pi$`, shape: String.raw`$S\times1$` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$Q^\pi$`, shape: String.raw`$S\times A$` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$\pi^+$`, shape: String.raw`$S\times1$ 动作 ID` },
    ],
    operators: [String.raw`$\operatorname{solve}$`, String.raw`$\longrightarrow$`, String.raw`$\xrightarrow{R+\gamma P_aV}$`, String.raw`$\arg\max_A$`],
    axes: String.raw`S 是状态轴，A 是动作轴；策略评估只保留状态价值，策略改进临时展开动作轴。`,
    semantics: String.raw`V 与 Q 是价值分数，pi 是每状态的离散动作选择；不能把 argmax 结果当作价值。`,
    mechanism: String.raw`每次贪心改进都不降低策略价值；有限 MDP 中反复评估与改进最终到达最优策略。`,
    identity: "策略迭代的评估与改进",
  }),
  makePipeline({
    id: "p24-empirical-transition-model",
    formula: String.raw`$\hat P_a(s,s')=\frac{N(s,a,s')}{\sum_{\tilde s}N(s,a,\tilde s)},
      \qquad \sum_{s'}\hat P_a(s,s')=1$`,
    stage: String.raw`经验模型把转移三元组计数按起始状态—动作分组，再沿下一状态轴归一化`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$(s,a,s')$`, shape: String.raw`$m\times3$ ID` },
      { rows: 4, cols: 4, color: "roleOrange", label: String.raw`$N_a$`, shape: String.raw`$S\times S$ 计数` },
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$N(s,a)$`, shape: String.raw`$S\times1$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$\hat P_a$`, shape: String.raw`$S\times S$ 概率` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$\hat P_aV$`, shape: String.raw`$S\times1$` },
    ],
    operators: [String.raw`$\operatorname{scatter\_count}$`, String.raw`$\sum_{s'}$`, String.raw`$\operatorname{row\ normalize}$`, String.raw`$\times V$`],
    axes: String.raw`经验转移矩阵的行是当前状态，列是下一状态；每个动作有一张 S×S 矩阵。`,
    semantics: String.raw`原始三元组是离散 ID，N 是整数计数，P 是行归一化概率，三者不是同一种对象。`,
    mechanism: String.raw`未见状态—动作的分母为零，必须显式选择平滑、回退模型或探索策略。`,
    identity: "采样转移到经验 MDP 模型",
  }),
  makePipeline({
    id: "p26-riccati-recursion",
    formula: String.raw`$K_t=-(R_t+B_t^\top\Phi_{t+1}B_t)^{-1}B_t^\top\Phi_{t+1}A_t$`,
    stage: String.raw`Riccati 反向递推先形成控制空间 Hessian，再解出从状态到控制的反馈增益`,
    objects: [
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$\Phi_{t+1}$`, shape: String.raw`$n\times n$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$B_t$`, shape: String.raw`$n\times p$` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`$R+B^\top\Phi B$`, shape: String.raw`$p\times p$` },
      { rows: 3, cols: 4, color: "roleCoral", label: String.raw`$B^\top\Phi A$`, shape: String.raw`$p\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$K_t$`, shape: String.raw`$p\times n$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$\xrightarrow{B^\top(\cdot)B+R}$`, String.raw`$\operatorname{solve}$`, String.raw`$-$`],
    axes: String.raw`n 是状态轴，p 是控制轴；控制 Hessian 必须是 p×p，反馈增益从 n 映射到 p。`,
    semantics: String.raw`Phi 是下一时刻价值曲率，R 是控制代价，K 是最优线性反馈矩阵。`,
    mechanism: String.raw`实际实现解线性系统而非显式求逆；随后把最优控制代回二次型得到新的 $\Phi_t$。`,
    identity: "Riccati 递推中的反馈增益",
  }),
  makePipeline({
    id: "p27-kalman-covariance-update",
    formula: String.raw`$S_t=CP_t^-C^\top+R,\quad
      K_t=P_t^-C^\top S_t^{-1},\quad
      P_t=(I-K_tC)P_t^-$`,
    stage: String.raw`Kalman 协方差更新把状态不确定性投影到观测空间，再通过增益削减可被观测解释的部分`,
    objects: [
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$P_t^-$`, shape: String.raw`$n\times n$` },
      { rows: 3, cols: 4, color: "roleOrange", label: String.raw`$C$`, shape: String.raw`$p\times n$` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`$S_t$`, shape: String.raw`$p\times p$` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$K_t$`, shape: String.raw`$n\times p$` },
      { rows: 4, cols: 4, color: "roleTeal", label: String.raw`$P_t$`, shape: String.raw`$n\times n$` },
    ],
    operators: [String.raw`$\xrightarrow{C(\cdot)C^\top+R}$`, String.raw`$=$`, String.raw`$\operatorname{solve}$`, String.raw`$\xrightarrow{(I-KC)(\cdot)}$`],
    axes: String.raw`n 是状态维度，p 是观测维度；S 位于观测空间，K 把观测创新映回状态空间。`,
    semantics: String.raw`Pminus 是预测协方差，S 是创新协方差，P 是吸收观测后的后验协方差。`,
    mechanism: String.raw`更新只降低被观测到方向的不确定性；Joseph 形式可在有限精度下更好保持对称半正定。`,
    identity: "Kalman Filter 的协方差传播",
  }),
  makePipeline({
    id: "p28-im2col-convolution",
    formula: String.raw`$Y_{\mathrm{col}}=X_{\mathrm{col}}W_{\mathrm{col}},\qquad
      (N_p\times K)(K\times C_{\mathrm{out}})\to N_p\times C_{\mathrm{out}},
      \quad K=k_hk_wC_{\mathrm{in}}$`,
    stage: String.raw`im2col 把每个局部感受野展平为一行，使多通道卷积变成标准矩阵乘法`,
    objects: [
      { rows: 5, cols: 5, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$H\times W\times C_{\mathrm{in}}$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$X_{\mathrm{col}}$`, shape: String.raw`$N_p\times K$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$W_{\mathrm{col}}$`, shape: String.raw`$K\times C_{\mathrm{out}}$` },
      { rows: 5, cols: 3, color: "roleCoral", label: String.raw`$Y_{\mathrm{col}}$`, shape: String.raw`$N_p\times C_{\mathrm{out}}$` },
      { rows: 4, cols: 4, color: "roleViolet", label: String.raw`$Y$`, shape: String.raw`$H_o\times W_o\times C_{\mathrm{out}}$` },
    ],
    operators: [String.raw`$\longrightarrow$`, String.raw`$\times$`, String.raw`$=$`, String.raw`$\longrightarrow$`],
    axes: String.raw`Np=HoWo 是输出位置轴，K 是局部空间与输入通道的合并收缩轴，Cout 是输出通道轴。`,
    semantics: String.raw`Xcol 是重复展开的局部块矩阵，Wcol 是展平滤波器，Ycol 是未恢复空间布局的输出。`,
    mechanism: String.raw`实现可借助高效 GEMM；代价是显式 im2col 可能复制输入并增加临时内存。`,
    identity: "卷积的 im2col 矩阵乘法",
  }),
  makePipeline({
    id: "concept-gradient-descent-update",
    formula: String.raw`$\hat y=X\theta,\quad r=\hat y-y,\quad
      g=X^\top r,\quad \theta^{(t+1)}=\theta^{(t)}-\alpha g$`,
    stage: String.raw`一次批量梯度下降：前向预测、计算残差、聚合参数梯度，再更新同形参数`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta^{(t)}$`, shape: String.raw`$n\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$r=X\theta-y$`, shape: String.raw`$m\times1$` },
      { rows: 3, cols: 1, color: "roleCoral", label: String.raw`$g=X^\top r$`, shape: String.raw`$n\times1$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta^{(t+1)}$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$-y$`, String.raw`$X^\top\times$`, String.raw`$-\alpha g$`],
    axes: String.raw`$m$ 是样本轴，$n$ 是参数轴；$X^\top r$ 消去样本轴，得到与参数完全同形的梯度。`,
    semantics: String.raw`$r$ 是逐样本有符号误差，$g$ 是参数空间的上升方向，$\alpha$ 是步长而非模型参数。`,
    mechanism: String.raw`Batch 每步归约全部样本；SGD 只取一行，Mini-batch 取一组行，但四段计算链保持相同。`,
    identity: "梯度下降的一次完整参数更新",
  }),
  makePipeline({
    id: "concept-logistic-likelihood",
    formula: String.raw`$z=X\theta,\quad p=\sigma(z),\quad
      \ell_i=-y_i\log p_i-(1-y_i)\log(1-p_i)$`,
    stage: String.raw`逻辑回归把线性分数变成 Bernoulli 概率，再逐样本计算负对数似然`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$\theta$`, shape: String.raw`$n\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$z=X\theta$`, shape: String.raw`$m\times1$ logits` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$p=\sigma(z)$`, shape: String.raw`$m\times1,\ (0,1)$` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$\ell$`, shape: String.raw`$m\times1$，非负实数` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$\sigma$`, String.raw`$\operatorname{BCE}_y$`],
    axes: String.raw`$n$ 在矩阵乘法中收缩；后续 Sigmoid 与 BCE 都逐样本作用，始终保留 $m$ 轴。`,
    semantics: String.raw`$z$ 是无界分数，$p$ 是概率，$y$ 是二值标签，$\ell$ 是非负损失；四者不能混作同一对象。`,
    mechanism: String.raw`训练时直接使用 logits 版 BCE，避免先算极小概率再取对数造成数值下溢。`,
    identity: "Logistic Regression 的似然计算链",
  }),
  makePipeline({
    id: "concept-perceptron-update",
    formula: String.raw`$\hat y_i=\operatorname{sign}(w^\top x_i),\qquad
      w^+=w+\eta y_i x_i\quad\text{if }y_iw^\top x_i\le0$`,
    stage: String.raw`感知机先产生连续 margin，再形成错分布尔量；只有错分样本触发参数位移`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times n$` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$w$`, shape: String.raw`$n\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$s=Xw$`, shape: String.raw`$m\times1$ 分数` },
      { rows: 5, cols: 1, color: "roleGray", label: String.raw`$M=\mathbf1[ys\le0]$`, shape: String.raw`$m\times1$ 布尔` },
      { rows: 3, cols: 1, color: "roleCoral", label: String.raw`$\Delta w$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$\times$`, String.raw`$=$`, String.raw`$\operatorname{compare}_y$`, String.raw`$X^\top(My)\eta$`],
    axes: String.raw`$m$ 是在线样本轴，$n$ 是特征轴；错误掩码筛选样本后，$X^\top$ 把更新聚合回参数轴。`,
    semantics: String.raw`$s$ 是连续分数，$M$ 是布尔触发器，$\hat y$ 是离散类别，$\Delta w$ 是参数增量。`,
    mechanism: String.raw`单样本在线版本一次只处理一行；预测正确时更新为零，错分时把法向量朝正确类别方向推。`,
    identity: "感知机的错分触发更新",
  }),
  makePipeline({
    id: "concept-perceptron-mistake-bound",
    formula: String.raw`$y_i(u^\top x_i)\ge\gamma,\ \|x_i\|\le R
      \quad\Longrightarrow\quad M\le\left(\frac R\gamma\right)^2$`,
    stage: String.raw`可分数据上的错误上界来自两条夹逼：朝正确方向线性进步，而参数范数至多平方根增长`,
    objects: [
      { rows: 1, cols: 1, color: "roleTeal", label: String.raw`$\gamma$`, shape: String.raw`最小几何间隔` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$M\gamma$`, shape: String.raw`正确方向进展下界` },
      { rows: 1, cols: 1, color: "roleViolet", label: String.raw`$\|w_M\|$`, shape: String.raw`参数范数` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$R\sqrt M$`, shape: String.raw`范数增长上界` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$(R/\gamma)^2$`, shape: String.raw`错误次数上界` },
    ],
    operators: [String.raw`$\times M$`, String.raw`$\le u^\top w_M\le$`, String.raw`$\le$`, String.raw`$\Longrightarrow M\le$`],
    axes: String.raw`这些量都是标量界；$R$ 与 $\gamma$ 必须使用同一特征空间中的范数和距离定义。`,
    semantics: String.raw`$M$ 是离散错误计数，$\gamma$ 是可分间隔，$R$ 是样本半径；该结论不是概率保证。`,
    mechanism: String.raw`间隔越大或样本半径越小，上界越紧；不可分数据不满足前提，需要容错或在线损失界。`,
    identity: "感知机错误上界的两条夹逼",
  }),
  makePipeline({
    id: "concept-tree-split-impurity",
    formula: String.raw`$\Delta I=I(S)-\frac{|S_L|}{|S|}I(S_L)
      -\frac{|S_R|}{|S|}I(S_R)$`,
    stage: String.raw`一次候选切分把父节点样本路由到左右子集，并用样本数加权比较切分前后的不纯度`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$S$`, shape: String.raw`$m\times(d+1)$ 样本` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$(j,t)$`, shape: String.raw`特征 ID 与阈值` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`$S_L$`, shape: String.raw`$m_L\times(d+1)$` },
      { rows: 2, cols: 3, color: "roleCoral", label: String.raw`$S_R$`, shape: String.raw`$m_R\times(d+1)$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\Delta I$`, shape: String.raw`标量增益` },
    ],
    operators: [String.raw`$\operatorname{choose}$`, String.raw`$x_j\le t$`, String.raw`$x_j>t$`, String.raw`$\operatorname{score}$`],
    axes: String.raw`$m_L+m_R=m$；左右子集完整分割父节点样本，不允许遗漏或重复路由。`,
    semantics: String.raw`$(j,t)$ 是离散特征选择与连续阈值，$I$ 可取 Gini、Entropy 或回归平方误差。`,
    mechanism: String.raw`贪心训练枚举候选切分并最大化 $\Delta I$；局部最优切分不保证整棵树全局最优。`,
    identity: "决策树的加权不纯度下降",
  }),
  makePipeline({
    id: "concept-tree-pruning",
    formula: String.raw`$R_\alpha(T)=R(T)+\alpha|T_{\mathrm{leaf}}|,\qquad
      T^\star_\alpha=\arg\min_{T\subseteq T_0}R_\alpha(T)$`,
    stage: String.raw`代价复杂度剪枝在训练误差与叶节点数量之间取舍，再用验证数据选择复杂度`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$T_0$`, shape: String.raw`充分生长的树` },
      { rows: 4, cols: 3, color: "roleViolet", label: String.raw`$T_1$`, shape: String.raw`较小子树` },
      { rows: 3, cols: 2, color: "roleCoral", label: String.raw`$T_2$`, shape: String.raw`更小子树` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$R_\alpha(T_k)$`, shape: String.raw`候选得分向量` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$T^\star$`, shape: String.raw`选中子树 ID` },
    ],
    operators: [String.raw`$\operatorname{prune}$`, String.raw`$\operatorname{prune}$`, String.raw`$\operatorname{score}_\alpha$`, String.raw`$\arg\min_k$`],
    axes: String.raw`候选子树共享同一训练根树；叶节点数随剪枝单调下降，但经验误差通常上升。`,
    semantics: String.raw`$\alpha$ 是复杂度惩罚，候选得分是连续标量，最终输出是一个离散子树选择。`,
    mechanism: String.raw`$\alpha=0$ 偏向大树；增大 $\alpha$ 会选择更小树，最终应在独立验证集上确定。`,
    identity: "决策树的代价复杂度剪枝",
  }),
  makePipeline({
    id: "concept-gradient-boosting-residual",
    formula: String.raw`$r_i^{(t)}=-\left.\frac{\partial\ell(y_i,F(x_i))}
      {\partial F(x_i)}\right|_{F=F_{t-1}},\quad
      F_t=F_{t-1}+\nu\rho_t h_t$`,
    stage: String.raw`Gradient Boosting 在函数输出空间计算负梯度，再训练弱学习器拟合这一修正方向`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$F_{t-1}(X)$`, shape: String.raw`$m\times1$ 分数` },
      { rows: 5, cols: 1, color: "roleCoral", label: String.raw`$r^{(t)}$`, shape: String.raw`$m\times1$ 伪残差` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$h_t(X)$`, shape: String.raw`$m\times1$` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$\rho_t$`, shape: String.raw`标量步长` },
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$F_t(X)$`, shape: String.raw`$m\times1$ 分数` },
    ],
    operators: [String.raw`$-\nabla_F\ell_y$`, String.raw`$\operatorname{fit}$`, String.raw`$\operatorname{line\ search}$`, String.raw`$+\nu\rho_t h_t$`],
    axes: String.raw`所有预测和伪残差共享样本轴 $m$；线搜索沿 $m$ 聚合损失后得到标量步长。`,
    semantics: String.raw`伪残差是连续负梯度，不一定等于 $y-\hat y$；$h_t$ 是新弱学习器，$\nu$ 是 shrinkage。`,
    mechanism: String.raw`每轮只拟合当前函数空间下降方向；小学习率配合更多轮数通常更稳，但训练更慢。`,
    identity: "Gradient Boosting 的函数空间负梯度",
  }),
  makePipeline({
    id: "concept-vc-shattering",
    formula: String.raw`$\operatorname{VC}(\mathcal H)=\max\{m:\Pi_{\mathcal H}(m)=2^m\}$`,
    stage: String.raw`VC 维要求同一假设类能够实现一组 m 个点的全部二进制标记，而不是只实现某一种标记`,
    objects: [
      { rows: 4, cols: 2, color: "roleTeal", label: String.raw`$X_m$`, shape: String.raw`$m\times d$ 点集` },
      { rows: 4, cols: 4, color: "roleGray", label: String.raw`$Y$`, shape: String.raw`$2^m\times m$ 全部标签` },
      { rows: 4, cols: 3, color: "roleViolet", label: String.raw`$\mathcal H|_{X_m}$`, shape: String.raw`实现的标签集合` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$\Pi_{\mathcal H}(m)$`, shape: String.raw`离散计数` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$\mathrm{VC}(\mathcal H)$`, shape: String.raw`最大可打散点数` },
    ],
    operators: [String.raw`$\operatorname{enumerate}$`, String.raw`$\operatorname{fit}_h$`, String.raw`$|\cdot|$`, String.raw`$\max_m$`],
    axes: String.raw`$m$ 是点数，$d$ 是输入维度；标签表的行轴枚举 $2^m$ 种二进制标记。`,
    semantics: String.raw`$Y$ 是离散标签组合，增长函数是可实现组合数，VC 维是整数容量指标。`,
    mechanism: String.raw`找到一组可打散的 m 点给出下界；证明任意 m+1 点都无法全部打散才给出上界。`,
    identity: "VC 维的全部标记可实现条件",
  }),
  makePipeline({
    id: "concept-map-prior",
    formula: String.raw`$\theta_{\mathrm{MAP}}
      =\arg\min_\theta\frac1{2\sigma^2}\|y-X\theta\|^2
      +\frac1{2\tau^2}\|\theta\|^2$`,
    stage: String.raw`Gaussian 似然与零均值 Gaussian 先验相加，恰好得到 Ridge 的数据项与参数惩罚`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$y$`, shape: String.raw`$m\times1$` },
      { rows: 5, cols: 1, color: "roleViolet", label: String.raw`$X\theta$`, shape: String.raw`$m\times1$` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$-\log p(y\mid\theta)$`, shape: String.raw`标量数据代价` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$-\log p(\theta)$`, shape: String.raw`标量先验代价` },
      { rows: 3, cols: 1, color: "roleGray", label: String.raw`$\theta_{\mathrm{MAP}}$`, shape: String.raw`$n\times1$` },
    ],
    operators: [String.raw`$-$`, String.raw`$\|\cdot\|^2/(2\sigma^2)$`, String.raw`$+\|\theta\|^2/(2\tau^2)$`, String.raw`$\arg\min_\theta$`],
    axes: String.raw`残差位于 $m$ 维观测空间，参数先验位于 $n$ 维参数空间；两个范数最终都归约为标量。`,
    semantics: String.raw`$\sigma^2$ 是观测噪声方差，$\tau^2$ 是先验尺度，$\lambda=\sigma^2/\tau^2$。`,
    mechanism: String.raw`正则化不仅是数值技巧：它对应关于参数大小的概率假设，但先验是否合理仍需验证。`,
    identity: "Gaussian 先验到 Ridge MAP",
  }),
  makePipeline({
    id: "concept-gmm-em-updates",
    formula: String.raw`$\gamma_{ik}=p(z_i=k\mid x_i),\quad
      N_k=\sum_i\gamma_{ik},\quad
      \mu_k^+=\frac1{N_k}\sum_i\gamma_{ik}x_i$`,
    stage: String.raw`GMM 的 E 步生成样本—成分责任度，M 步沿样本轴做软加权归约并更新参数`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times d$` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$\gamma$`, shape: String.raw`$m\times K$ 概率` },
      { rows: 4, cols: 1, color: "roleOrange", label: String.raw`$N$`, shape: String.raw`$K\times1$ 软计数` },
      { rows: 4, cols: 3, color: "roleCoral", label: String.raw`$\gamma^\top X$`, shape: String.raw`$K\times d$` },
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$\mu^+$`, shape: String.raw`$K\times d$` },
    ],
    operators: [String.raw`$\operatorname{posterior}$`, String.raw`$\sum_m$`, String.raw`$\gamma^\top\times X$`, String.raw`$\div N_k$`],
    axes: String.raw`$m$ 是样本轴，$d$ 是特征轴，$K$ 是混合成分轴；M 步收缩 $m$ 并保留 $K,d$。`,
    semantics: String.raw`$\gamma_{ik}\in[0,1]$ 且每行和为 1；$N_k$ 是软计数，不是整数样本个数。`,
    mechanism: String.raw`均值、协方差和混合权重都使用同一责任度；若某 $N_k$ 过小，协方差可能退化。`,
    identity: "GMM 的责任度与加权参数更新",
  }),
  makePipeline({
    id: "concept-jensen-elbo-gap",
    formula: String.raw`$\log p(x)=\mathcal L(q,\theta)
      +\mathrm{KL}\!\left(q(z)\,\|\,p(z\mid x;\theta)\right)$`,
    stage: String.raw`ELBO 与证据之间的缺口恰好是非负 KL；E 步令辅助分布贴近真实后验并闭合缺口`,
    objects: [
      { rows: 4, cols: 3, color: "roleTeal", label: String.raw`$q(z)$`, shape: String.raw`$m\times K$ 辅助分布` },
      { rows: 4, cols: 3, color: "roleViolet", label: String.raw`$p(z\mid x;\theta)$`, shape: String.raw`$m\times K$ 后验` },
      { rows: 1, cols: 1, color: "roleCoral", label: String.raw`$\mathrm{KL}(q\|p)$`, shape: String.raw`非负标量` },
      { rows: 1, cols: 1, color: "roleOrange", label: String.raw`$\mathcal L(q,\theta)$`, shape: String.raw`标量下界` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\log p(x)$`, shape: String.raw`标量证据` },
    ],
    operators: [String.raw`$\operatorname{compare}$`, String.raw`$\sum q\log(q/p)$`, String.raw`$+$`, String.raw`$=$`],
    axes: String.raw`$m$ 是观测轴，$K$ 是隐状态轴；KL 对两轴求和后成为标量缺口。`,
    semantics: String.raw`$q$ 是可选辅助分布，后验由当前参数决定，ELBO 是可优化下界而非另一个似然。`,
    mechanism: String.raw`E 步取 $q=p(z\mid x;\theta)$ 令 KL 为零；M 步固定 q 提高 ELBO，因此观测似然不下降。`,
    identity: "ELBO 与证据之间的 KL 缺口",
  }),
  makePipeline({
    id: "concept-factor-posterior",
    formula: String.raw`$z\mid x\sim\mathcal N\!\left(
      \Lambda^\top(\Lambda\Lambda^\top+\Psi)^{-1}(x-\mu),
      I-\Lambda^\top(\Lambda\Lambda^\top+\Psi)^{-1}\Lambda\right)$`,
    stage: String.raw`因子后验先在观测空间衡量残差，再由载荷矩阵转回低维潜因子空间`,
    objects: [
      { rows: 5, cols: 1, color: "roleTeal", label: String.raw`$x-\mu$`, shape: String.raw`$d\times1$` },
      { rows: 5, cols: 5, color: "roleViolet", label: String.raw`$\Sigma_x^{-1}$`, shape: String.raw`$d\times d$` },
      { rows: 3, cols: 5, color: "roleOrange", label: String.raw`$\Lambda^\top$`, shape: String.raw`$k\times d$` },
      { rows: 3, cols: 1, color: "roleCoral", label: String.raw`$E[z\mid x]$`, shape: String.raw`$k\times1$` },
      { rows: 3, cols: 3, color: "roleGray", label: String.raw`$\operatorname{Cov}(z\mid x)$`, shape: String.raw`$k\times k$` },
    ],
    operators: [String.raw`$\xrightarrow{\Sigma_x^{-1}\times}$`, String.raw`$\times$`, String.raw`$=$`, String.raw`$\operatorname{condition}$`],
    axes: String.raw`$d$ 是观测维度，$k\ll d$ 是因子维度；$\Lambda^\top$ 收缩观测轴并输出潜在轴。`,
    semantics: String.raw`后验均值是每个样本的因子坐标，后验协方差表达给定观测后仍剩余的不确定性。`,
    mechanism: String.raw`EM 的 E 步需要一阶矩 $E[z\mid x]$ 与二阶矩 $E[zz^\top\mid x]$，不能只做点估计。`,
    identity: "因子分析的 Gaussian 条件后验",
  }),
  makePipeline({
    id: "concept-ica-change-of-variables",
    formula: String.raw`$s=Wx,\qquad
      p_X(x)=p_S(Wx)\,|\det W|,\qquad
      \ell(W)=\sum_i\sum_j\log p_j(w_j^\top x_i)+m\log|\det W|$`,
    stage: String.raw`ICA 用解混矩阵恢复独立源；变量变换的 Jacobian 行列式负责体积缩放与可逆性`,
    objects: [
      { rows: 5, cols: 4, color: "roleTeal", label: String.raw`$X$`, shape: String.raw`$m\times d$ 混合观测` },
      { rows: 4, cols: 4, color: "roleOrange", label: String.raw`$W$`, shape: String.raw`$d\times d$ 解混矩阵` },
      { rows: 5, cols: 4, color: "roleViolet", label: String.raw`$S=XW^\top$`, shape: String.raw`$m\times d$ 源估计` },
      { rows: 5, cols: 4, color: "roleCoral", label: String.raw`$\log p_j(S_{ij})$`, shape: String.raw`$m\times d$` },
      { rows: 1, cols: 1, color: "roleGray", label: String.raw`$\ell(W)$`, shape: String.raw`标量` },
    ],
    operators: [String.raw`$\times W^\top$`, String.raw`$=$`, String.raw`$\log p_j$`, String.raw`$\sum$`],
    axes: String.raw`$m$ 是样本轴，$d$ 同时是观测通道与源通道；可逆 W 保持维数但改变坐标与体积。`,
    semantics: String.raw`$S$ 是连续源估计，源密度按分量独立分解，$|\det W|$ 是 Jacobian 体积因子。`,
    mechanism: String.raw`若遗漏行列式项，缩放 W 会虚假提高源密度；Gaussian 源还存在旋转不可辨识性。`,
    identity: "ICA 的变量变换与 Jacobian",
  }),
  makePipeline({
    id: "concept-finite-horizon-backup",
    formula: String.raw`$V_T(s)=0,\qquad
      V_t(s)=\max_a\left[R_t(s,a)+\gamma\sum_{s'}P_t(s'|s,a)V_{t+1}(s')\right]$`,
    stage: String.raw`有限时域动态规划从终点价值开始逆时间递推，每一步只依赖下一时刻价值`,
    objects: [
      { rows: 4, cols: 1, color: "roleGray", label: String.raw`$V_T$`, shape: String.raw`$|\mathcal S|\times1$` },
      { rows: 4, cols: 1, color: "roleViolet", label: String.raw`$V_{T-1}$`, shape: String.raw`$|\mathcal S|\times1$` },
      { rows: 4, cols: 1, color: "roleTeal", label: String.raw`$V_{t+1}$`, shape: String.raw`$|\mathcal S|\times1$` },
      { rows: 4, cols: 3, color: "roleOrange", label: String.raw`$Q_t$`, shape: String.raw`$|\mathcal S|\times|\mathcal A|$` },
      { rows: 4, cols: 1, color: "roleCoral", label: String.raw`$V_t$`, shape: String.raw`$|\mathcal S|\times1$` },
    ],
    operators: [String.raw`$\operatorname{backup}_{T-1}$`, String.raw`$\cdots$`, String.raw`$\mathrm E_{s'}+R_t$`, String.raw`$\max_a$`],
    axes: String.raw`状态轴贯穿所有时刻；转移期望消去下一状态轴，动作最大化再消去动作轴。`,
    semantics: String.raw`$V_t$ 是随剩余时间变化的价值向量，$Q_t$ 是状态—动作表，最优策略通常也依赖 t。`,
    mechanism: String.raw`计算方向与真实时间相反：先确定终点条件，再逐步向前恢复每个时刻的最优决策。`,
    identity: "有限时域 Bellman 的逆时间递推",
  }),
  makePipeline({
    id: "concept-ddp-local-quadratic",
    formula: String.raw`$Q_x=\ell_x+f_x^\top V_x',\quad
      Q_u=\ell_u+f_u^\top V_x',\quad
      \delta u^\star=k+K\delta x,\quad k=-Q_{uu}^{-1}Q_u$`,
    stage: String.raw`DDP 沿名义轨迹局部二次化代价与动力学，反向求控制修正，再正向生成新轨迹`,
    objects: [
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$(\bar x_t,\bar u_t)$`, shape: String.raw`$T\times(n+p)$ 名义轨迹` },
      { rows: 3, cols: 3, color: "roleViolet", label: String.raw`$Q_{xx},Q_{ux},Q_{uu}$`, shape: String.raw`局部二次块` },
      { rows: 3, cols: 1, color: "roleOrange", label: String.raw`$k_t$`, shape: String.raw`$p\times1$ 前馈` },
      { rows: 3, cols: 4, color: "roleCoral", label: String.raw`$K_t$`, shape: String.raw`$p\times n$ 反馈` },
      { rows: 5, cols: 3, color: "roleTeal", label: String.raw`$(x_t^+,u_t^+)$`, shape: String.raw`$T\times(n+p)$ 新轨迹` },
    ],
    operators: [String.raw`$\operatorname{local\ model}$`, String.raw`$\operatorname{backward}$`, String.raw`$+$`, String.raw`$\operatorname{rollout}$`],
    axes: String.raw`$T$ 是时间轴，$n$ 是状态轴，$p$ 是控制轴；$K_t$ 把状态偏差映射为控制偏差。`,
    semantics: String.raw`$k_t$ 是开环前馈修正，$K_t$ 是局部反馈增益，二者来自控制 Hessian 的线性求解。`,
    mechanism: String.raw`反向通道计算局部策略，正向通道用真实非线性动力学 rollout；线搜索与正则化保证改进稳定。`,
    identity: "DDP 的局部二次反向—正向循环",
  }),
);

function renderTex(diagram) {
  return `${preamble}
\\begin{document}
\\begin{tikzpicture}[x=1cm,y=1cm,background rectangle/.style={fill=white},show background rectangle]
${diagram.body}
\\end{tikzpicture}
\\end{document}
`;
}

const requested = new Set(process.argv.slice(2));
const selected =
  requested.size === 0 ? diagrams : diagrams.filter(({ id }) => requested.has(id));

if (selected.length === 0) {
  throw new Error(`No matching diagram id. Available: ${diagrams.map(({ id }) => id).join(", ")}`);
}

for (const diagram of selected) {
  const texPath = join(sourceDir, `${diagram.id}.tex`);
  writeFileSync(texPath, renderTex(diagram), "utf8");
  execFileSync(tectonic, ["--outdir", outputDir, texPath], {
    cwd: sourceDir,
    stdio: "inherit",
  });
  const pdfPath = join(outputDir, `${diagram.id}.pdf`);
  const pngPath = join(outputDir, `${diagram.id}.png`);
  execFileSync("sips", ["-s", "format", "png", pdfPath, "--out", pngPath], {
    stdio: "ignore",
  });
  execFileSync("sips", ["-Z", "2200", pngPath], { stdio: "ignore" });
  console.log(`generated ${diagram.id}`);
}

writeFileSync(
  join(outputDir, "manifest.json"),
  `${JSON.stringify(
    {
      generator: "src/scripts/generate-cs229-tikz-diagrams.mjs",
      renderer: "Tectonic + TikZ",
      diagrams: diagrams.map(({ id }) => ({
        id,
        source: `src/visuals/tikz/cs229/${id}.tex`,
        pdf: `public/images/notes/cs229/tikz/${id}.pdf`,
        png: `public/images/notes/cs229/tikz/${id}.png`,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);
