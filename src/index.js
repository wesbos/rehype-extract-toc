const rank = require('hast-util-heading-rank')
const toString = require('hast-util-to-string')
const visit = require('unist-util-visit')

function attacher() {
  return transformer

  function transformer(tree, vfile) {
    const headings = []

    visit(tree, 'element', onHeading)

    vfile.data.toc = createTree(headings)

    function onHeading(node) {
      const level = rank(node)

      if (level != null) {
        const heading = {
          depth: level,
          value: toString(node),
          id: node.properties && node.properties.id,
        }

        headings.push(heading)
      }
    }

    function createTree(headings) {
      const root = { depth: 0 }
      const parents = []
      let previous = root

      headings.forEach((heading) => {
        if (heading.depth > previous.depth) {
          if (previous.children === undefined) {
            previous.children = []
          }
          parents.push(previous)
        } else if (heading.depth < previous.depth) {
          while (parents[parents.length - 1].depth >= heading.depth) {
            parents.pop()
          }
        }

        parents[parents.length - 1].children.push(heading)
        previous = heading
      })

      return root.children
    }
  }
}

module.exports = attacher