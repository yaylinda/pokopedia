import favoriteCategoriesJson from '../../data/favorite-categories.json'

export type FavoriteItem = {
  sourceOrder: number
  itemId: string
  itemSlug: string
  itemName: string
  detailUrl: string | null
  pictureUrl: string | null
  pictureAlt: string
  description: string | null
}

export type FavoriteCategory = {
  sourceOrder: number
  favoriteId: string
  slug: string
  name: string
  kind: string
  detailUrl: string | null
  itemCount: number
  items: FavoriteItem[]
}

const catalog = favoriteCategoriesJson as {
  favoriteCategories: FavoriteCategory[]
}

export const favoriteCategories = catalog.favoriteCategories

export const favoriteCategoryById = new Map(
  favoriteCategories.map((category) => [category.favoriteId, category]),
)
