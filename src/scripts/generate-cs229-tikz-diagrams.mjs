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
