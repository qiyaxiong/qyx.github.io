export interface Cs229ReaderSection {
  id: string
  zh: string
  en: string
  page: number
}

export interface Cs229ReaderConfig {
  storageKey: string
  sourceTitle: string
  sourceRepositoryUrl: string
  sourceDocumentUrl: string
  pdfUrl: string
  pageStart: number
  pageEnd: number
  sections: Cs229ReaderSection[]
}

const readerConfigs: Record<string, Cs229ReaderConfig> = {
  'cs229/course/linear-regression': {
    storageKey: 'cs229-reader-linear-regression',
    sourceTitle: 'CS229 Lecture Notes 1 · Supervised Learning',
    sourceRepositoryUrl:
      'https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf',
    sourceDocumentUrl:
      'https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf',
    pdfUrl:
      'https://raw.githubusercontent.com/maxim5/cs229-2018-autumn/main/notes/cs229-notes1.pdf',
    pageStart: 1,
    pageEnd: 15,
    sections: [
      {
        id: '先建立问题：监督学习到底在学什么',
        zh: '监督学习问题',
        en: 'Supervised learning',
        page: 1
      },
      {
        id: '线性假设：从特征到预测',
        zh: '线性假设',
        en: 'Linear hypothesis',
        page: 3
      },
      {
        id: '最小二乘损失：为什么是平方',
        zh: '最小二乘损失',
        en: 'Least squares cost',
        page: 4
      },
      {
        id: 'lms-与梯度下降：参数怎样一步步更新',
        zh: 'LMS 与梯度下降',
        en: 'LMS algorithm',
        page: 4
      },
      {
        id: '正规方程：不迭代直接求解',
        zh: '正规方程',
        en: 'Normal equations',
        page: 7
      },
      {
        id: '概率解释：平方损失从哪里来',
        zh: '概率与似然解释',
        en: 'Probabilistic interpretation',
        page: 11
      },
      {
        id: '局部加权线性回归：一个模型不必覆盖所有位置',
        zh: '局部加权回归',
        en: 'Locally weighted regression',
        page: 13
      },
      {
        id: '本章闭环：从公式到实现',
        zh: '本章闭环',
        en: 'Chapter checklist',
        page: 15
      }
    ]
  }
}

export function getCs229ReaderConfig(path: string): Cs229ReaderConfig | undefined {
  return readerConfigs[path]
}
