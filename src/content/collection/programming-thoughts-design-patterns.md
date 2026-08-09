---
title: '编程思想与设计模式 46 讲'
title_en: 'Programming Thought and Design Patterns'
description: '把 12 小时 B 站课程重构为 46 篇独立精讲：设计原则、单例、工厂族、原型、建造者与结构型模式。'
description_en: 'A 46-part practical course about design principles, creation patterns, structural patterns, and engineering trade-offs.'
repository: 'https://www.bilibili.com/video/BV1Xv4y1T7by/'
courseIntro: '原课程由 B 站 UP 主“老赵Net”发布，从高内聚、低耦合与 SOLID 类原则开始，再进入单例、工厂、原型、建造者和七种结构型模式。本站按 B 站 P1–P46 一一对应，并为每讲补充真实案例、HTML/SVG 图解、可运行代码、反例和练习。'
courseStats:
  - value: '46'
    label: '逐节精讲页面'
  - value: '12h+'
    label: '原课程内容'
  - value: '7'
    label: '核心设计原则'
  - value: '11'
    label: '设计模式族'
courseModules:
  - phase: 'P1–P16'
    title: '从坏味道到设计原则'
    description: '高内聚、低耦合、单一职责、开放封闭、依赖倒置、里氏替换、接口隔离、迪米特与合成复用。重点不是记定义，而是用变化原因找到模块边界。'
    topics: ['Cohesion', 'Coupling', 'SOLID', 'Composition', 'Change Axis']
    href: '/notes/programming-thoughts/course#design-foundations'
    source: 'https://www.bilibili.com/video/BV1Xv4y1T7by/?p=1'
    status: 'ready'
  - phase: 'P17–P21'
    title: '单例与全局状态'
    description: '比较饿汉、懒汉、静态内部类和枚举方案，分析线程安全、反射、序列化、测试隔离和生命周期问题。'
    topics: ['Singleton', 'Lazy Init', 'Thread Safety', 'Reflection']
    href: '/notes/programming-thoughts/course#singleton'
    source: 'https://www.bilibili.com/video/BV1Xv4y1T7by/?p=17'
    status: 'ready'
  - phase: 'P22–P28'
    title: '简单工厂、工厂方法与抽象工厂'
    description: '通过文档解析器、任务流程和数据库产品族区分三类工厂，理解“集中分支”“延迟创建”和“保证产品族一致性”三个不同意图。'
    topics: ['Simple Factory', 'Factory Method', 'Abstract Factory', 'Registry']
    href: '/notes/programming-thoughts/course#factory'
    source: 'https://www.bilibili.com/video/BV1Xv4y1T7by/?p=22'
    status: 'ready'
  - phase: 'P29–P33'
    title: '原型与建造者'
    description: '从复杂模板复制进入深浅拷贝，再用建造者解决可选参数、分步构造、不可变对象和统一校验。'
    topics: ['Prototype', 'Deep Copy', 'Builder', 'Invariant']
    href: '/notes/programming-thoughts/course#creation'
    source: 'https://www.bilibili.com/video/BV1Xv4y1T7by/?p=29'
    status: 'ready'
  - phase: 'P34–P46'
    title: '结构型模式'
    description: '适配器、装饰器、代理、外观、桥接、组合与享元。通过接口转换、职责叠加、访问控制、子系统入口、双维度变化、树结构和状态共享理解各自边界。'
    topics: ['Adapter', 'Decorator', 'Proxy', 'Facade', 'Bridge', 'Composite', 'Flyweight']
    href: '/notes/programming-thoughts/course#structural'
    source: 'https://www.bilibili.com/video/BV1Xv4y1T7by/?p=34'
    status: 'ready'
heroImage: {src: '../../assets/programming-thoughts-cover.svg', alt: '编程思想与设计模式 46 讲课程封面', width: 1200, height: 630}
bloglist: []
---
