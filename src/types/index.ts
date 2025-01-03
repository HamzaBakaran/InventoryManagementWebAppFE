export interface User {
    id: number;
    email: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    quantity: number;
    minimalThreshold: number;
    categoryId: number;
    categoryName: string; 
  }
  
  
  export interface Category {
    id: number;
    name: string;
  }
  