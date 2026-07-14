import { visit } from 'unist-util-visit'

export default function rehypeImagePolicy() {
  return (tree: unknown) => {
    visit(tree as any, 'element', (node: any) => {
      if (node.tagName !== 'img') return

      node.properties = {
        ...node.properties,
        decoding: node.properties?.decoding || 'async',
        loading: node.properties?.loading || 'lazy',
        referrerpolicy: node.properties?.referrerpolicy || 'no-referrer'
      }
    })
  }
}
