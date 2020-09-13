
export interface ICategories {
  [category: string]: { id: number, subCategories: ISubCategory }
}

interface ISubCategory {
  [category: string]: { id: number }
}
