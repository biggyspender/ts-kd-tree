import { createKDTree } from '../src/ts-kd-tree'
import { range } from 'blinq'

interface Item {
  x: number
  y: number
}
describe('test', () => {
  it('finds items', () => {
    const items: Item[] = range(0, 100)
      .selectMany(y => range(0, 100).select(x => ({ x, y })))
      .toArray()
    // console.log(items)
    const tree = createKDTree(items, i => [i.x, i.y])
    const points = range(0, 100)
      .selectMany(y =>
        range(0, 100).select(x => ({ point: [x + 0.4, y - 0.4], expected: { x, y } }))
      )
      .toArray()
    for (const { point, expected } of points) {
      expect(tree.nearestNeighbor(point)).toEqual(expected)
    }
  })
  it('throws on empty', () => {
    const items: Item[] = []
    const ps = (i: Item) => [i.x, i.y]
    expect(() => createKDTree(items, ps)).toThrow()
  })
})
