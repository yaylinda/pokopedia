import regionHomePlanJson from '../../data/region-home-plan.json'

export type RegionPlanPokemon = {
  pokopiaNumber: number
  pokopiaNumberDisplay: string
  pokemonId: number
  pokemonIdDisplay: string
  slug: string
  name: string
  imageUrl: string
  detailUrl: string
  idealHabitat: {
    id: string
    name: string
  }
  favorites: {
    id: string
    name: string
    kind: string
  }[]
  specialties: {
    slug: string
    name: string
  }[]
  litterItem: {
    id: string
    name: string
  } | null
  assignmentKind: string
  regionFit: {
    score: number
    favoriteMatches: {
      id: string
      name: string
      weight: number
    }[]
    specialtyMatches: {
      slug: string
      name: string
      weight: number
    }[]
    bestAlternative: {
      regionId: string
      regionName: string
      score: number
    }
  }
}

export type RegionPlanHouse = {
  houseId: string
  name: string
  size: number
  compatibilityScore: number | null
  primaryIdealHabitat: {
    name: string
    count: number
  }
  sharedFavorites: {
    name: string
    count: number
  }[]
  sharedSpecialties: {
    name: string
    count: number
  }[]
  sharedLitterItems: {
    name: string
    count: number
  }[]
  explanation: string
  pokemon: RegionPlanPokemon[]
}

export type RegionPlanRegion = {
  regionId: string
  name: string
  identity: string
  sourceUrl: string
  pokemonCount: number
  homeCount: number
  homeSizeCounts: Record<string, number>
  idealHabitatCounts: Record<string, number>
  houses: RegionPlanHouse[]
}

export type RegionHomePlan = {
  generatedAt: string
  pokemonCount: number
  regionCount: number
  homeCount: number
  methodology: {
    goal: string
    regionAssignment: string[]
    homeGrouping: string[]
    caveat: string
  }
  regions: RegionPlanRegion[]
}

export const regionHomePlan = regionHomePlanJson as unknown as RegionHomePlan
