import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCTS_KEY = 'pro_products';

export interface Criterion {
  id: string;
  name: string;
  score: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUri: string | null;
  criteria: Criterion[];
  overallScore: number;
  createdAt: string;
  notes: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await AsyncStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<void> => {
  const products = await getProducts();
  const existing = products.findIndex(p => p.id === product.id);
  if (existing >= 0) {
    products[existing] = product;
  } else {
    products.unshift(product);
  }
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const deleteProduct = async (id: string): Promise<void> => {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
};

export const calcOverall = (criteria: Criterion[]): number => {
  if (!criteria.length) return 0;
  const sum = criteria.reduce((acc, c) => acc + c.score, 0);
  return Math.round((sum / criteria.length) * 10) / 10;
};
