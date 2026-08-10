import {
  favoriteCategoryById,
  type FavoriteCategory,
  type FavoriteItem,
} from '../../data/favoriteCategories'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import type { RosterGroup } from '../../data/types'

export type FavoriteItemOverlap = {
  item: FavoriteItem
  residentCount: number
  residentSlugs: string[]
}

export type FavoriteCategoryOverlap = {
  category: FavoriteCategory
  residentCount: number
  residentSlugs: string[]
  items: FavoriteItemOverlap[]
}

export const getRosterGroupScopeKey = (
  snapshotId: string,
  regionId: string,
) => `${snapshotId}:${regionId}`

export const getAvailableGroupNumber = (groups: RosterGroup[]) => {
  const usedNames = new Set(groups.map((group) => group.name.toLowerCase()))
  let groupNumber = 1

  while (usedNames.has(`group ${groupNumber}`)) {
    groupNumber += 1
  }

  return groupNumber
}

export const makeRosterGroup = (groups: RosterGroup[]): RosterGroup => {
  const groupNumber = getAvailableGroupNumber(groups)

  return {
    groupId: crypto.randomUUID(),
    name: `Group ${groupNumber}`,
    pokemonSlugs: [],
  }
}

export const getGroupFavoriteOverlaps = (
  pokemon: RegionRosterPokemon[],
): FavoriteCategoryOverlap[] => {
  const categoryResidents = new Map<string, Set<string>>()
  const itemResidents = new Map<string, Set<string>>()

  pokemon.forEach((resident) => {
    const residentItemIds = new Set<string>()

    resident.favorites.forEach((favorite) => {
      const category = favoriteCategoryById.get(favorite.favoriteId)
      if (!category || category.kind === 'none') return

      const residents = categoryResidents.get(category.favoriteId) ?? new Set()
      residents.add(resident.slug)
      categoryResidents.set(category.favoriteId, residents)

      category.items.forEach((item) => residentItemIds.add(item.itemId))
    })

    residentItemIds.forEach((itemId) => {
      const residents = itemResidents.get(itemId) ?? new Set()
      residents.add(resident.slug)
      itemResidents.set(itemId, residents)
    })
  })

  return Array.from(categoryResidents.entries())
    .flatMap(([favoriteId, residentSlugs]): FavoriteCategoryOverlap[] => {
      const category = favoriteCategoryById.get(favoriteId)
      if (!category || residentSlugs.size < 2) return []

      const items = category.items
        .flatMap((item): FavoriteItemOverlap[] => {
          const residents = itemResidents.get(item.itemId)
          if (!residents || residents.size < 2) return []

          return [
            {
              item,
              residentCount: residents.size,
              residentSlugs: Array.from(residents),
            },
          ]
        })
        .sort(
          (left, right) =>
            right.residentCount - left.residentCount ||
            left.item.sourceOrder - right.item.sourceOrder ||
            left.item.itemName.localeCompare(right.item.itemName),
        )

      return [
        {
          category,
          residentCount: residentSlugs.size,
          residentSlugs: Array.from(residentSlugs),
          items,
        },
      ]
    })
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.category.sourceOrder - right.category.sourceOrder ||
        left.category.name.localeCompare(right.category.name),
    )
}
