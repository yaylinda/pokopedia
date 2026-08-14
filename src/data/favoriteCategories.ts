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

export const favoriteItemById = new Map<string, FavoriteItem>()
export const favoriteCategoriesByItemId = new Map<string, FavoriteCategory[]>()

favoriteCategories.forEach((category) => {
  category.items.forEach((item) => {
    if (!favoriteItemById.has(item.itemId)) {
      favoriteItemById.set(item.itemId, item)
    }

    const categories = favoriteCategoriesByItemId.get(item.itemId) ?? []
    categories.push(category)
    favoriteCategoriesByItemId.set(item.itemId, categories)
  })
})

export const favoriteCategoryIdsByItemId = new Map(
  Array.from(favoriteCategoriesByItemId, ([itemId, categories]) => [
    itemId,
    categories.map((category) => category.favoriteId),
  ]),
)
