interface KDTree<T> {
  item: T
  left?: KDTree<T>
  right?: KDTree<T>
}
function kdt<T>(
  items: T[],
  pointSelector: (item: T) => number[],
  depth: number,
  k?: number
): KDTree<T> {
  if (k === undefined) {
    if (items.length === 0) {
      throw Error('unable to count dimensions')
    }
    const [firstItem] = items
    const firstPoint = pointSelector(firstItem)
    k = firstPoint.length
  }

  const axis = depth % k
  items.sort((a, b) => pointSelector(a)[axis] - pointSelector(b)[axis])

  const medianIndex = (items.length / 2) | 0

  const leftItems = items.slice(0, medianIndex)
  const rightItems = items.slice(medianIndex + 1)

  return {
    item: items[medianIndex],
    left: leftItems.length > 0 ? kdt(leftItems, pointSelector, depth + 1, k) : undefined,
    right: rightItems.length > 0 ? kdt(rightItems, pointSelector, depth + 1, k) : undefined
  }
}

const distance = (a: number[], b: number[]) => {
  return a.reduce((dist, v, i) => dist + Math.pow(b[i] - v, 2), 0)
}

const nearest = <T>(
  p: number[],
  candidate1: T,
  candidate2: T,
  pointSelector: (item: T) => number[]
) =>
  distance(p, pointSelector(candidate1)) < distance(p, pointSelector(candidate2))
    ? candidate1
    : candidate2

function nearestNeighbor<T>(
  kdTree: KDTree<T>,
  point: number[],
  pointSelector: (item: T) => number[],
  depth: number
): T {
  let best = kdTree.item
  const k = point.length
  const axis = depth % k

  const [subtree, otherSubtree] =
    point[axis] < pointSelector(kdTree.item)[axis]
      ? [kdTree.left, kdTree.right]
      : [kdTree.right, kdTree.left]

  // Try to find a nearer neighbor in the subtree that contains the point.
  if (subtree) {
    best = nearest(
      point,
      best,
      nearestNeighbor(subtree, point, pointSelector, depth + 1),
      pointSelector
    )
  }

  // Try to find a nearer neighbor in the subtree that does *not* contain the point.
  // This is only possible if the splitting plane is closer to the point than the current best
  // candidate.
  if (otherSubtree) {
    const splittingPlaneDistance = Math.pow(point[axis] - pointSelector(kdTree.item)[axis], 2)
    if (splittingPlaneDistance < distance(point, pointSelector(best))) {
      best = nearest(
        point,
        best,
        nearestNeighbor(otherSubtree, point, pointSelector, depth + 1),
        pointSelector
      )
    }
  }

  return best
}

export function createKDTree<T>(items: T[], pointSelector: (item: T) => number[]) {
  const tree = kdt(items, pointSelector, 0)
  return {
    nearestNeighbor(point: number[]) {
      return nearestNeighbor(tree, point, pointSelector, 0)
    }
  }
}
