import type { FavoriteCategoryItem } from '../data/pokopia'
import { formatter } from '../utils/format'

export type FavoriteWithItems = {
  name: string
  kind: string
  itemCount: number
  items: FavoriteCategoryItem[]
}

export const favoriteItemCountLabel = (favorite: FavoriteWithItems) =>
  favorite.kind === 'flavor'
    ? `${formatter.format(favorite.itemCount)} flavor items`
    : `${formatter.format(favorite.itemCount)} items`
