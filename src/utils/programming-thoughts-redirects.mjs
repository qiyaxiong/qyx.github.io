const groups = {
  'change-cohesion-coupling-srp': ['programming-thoughts-introduction', 'high-cohesion', 'low-coupling', 'single-responsibility-principle'],
  'open-closed-principle-evolution': ['open-closed-principle-definition', 'open-closed-principle-abstraction', 'open-closed-principle-boundaries'],
  'dependency-inversion-di-contracts': ['dependency-inversion-principle', 'dependency-inversion-with-di', 'liskov-substitution-principle', 'interface-segregation-principle'],
  'object-boundaries-demeter-composition': ['law-of-demeter-boundaries', 'law-of-demeter-refactoring', 'composition-over-inheritance', 'composition-reuse-practice'],
  'patterns-and-singleton-lifecycle': ['design-patterns-introduction', 'eager-lazy-singleton', 'singleton-reflection-problem', 'singleton-reflection-defense', 'static-holder-singleton', 'singleton-tradeoffs'],
  'simple-factory-method-registry': ['simple-factory', 'factory-method', 'reflection-driven-factory'],
  'abstract-factory-product-family': ['abstract-factory-introduction', 'abstract-factory-implementation', 'database-family-abstract-factory', 'abstract-factory-case-wrapup'],
  'prototype-copy-registry': ['prototype-pattern-basics', 'deep-shallow-copy', 'prototype-pattern-practice'],
  'builder-object-invariants': ['builder-pattern-basics', 'builder-pattern-practice'],
  'adapter-anticorruption-layer': ['adapter-pattern-theory', 'adapter-pattern-practice'],
  'decorator-middleware-pipeline': ['decorator-pattern-theory', 'decorator-pattern-practice'],
  'proxy-access-facade': ['proxy-pattern-theory', 'proxy-pattern-practice', 'facade-pattern'],
  'bridge-independent-dimensions': ['bridge-pattern-theory', 'bridge-pattern-practice'],
  'composite-recursive-tree': ['composite-pattern-theory', 'composite-pattern-practice'],
  'flyweight-state-memory': ['flyweight-pattern-theory', 'flyweight-pattern-practice']
}

export const programmingThoughtsLegacySlugs = Object.values(groups).flat().map(
  (slug) => `programming-thoughts/course/${slug}`
)

export const programmingThoughtsRedirects = Object.fromEntries(
  Object.entries(groups).flatMap(([chapter, slugs]) => slugs.map((slug) => [
    `/notes/programming-thoughts/course/${slug}`,
    `/notes/programming-thoughts/course/${chapter}`
  ]))
)
