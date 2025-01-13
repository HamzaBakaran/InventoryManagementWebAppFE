import React from "react";
import Grid from "@mui/material/Grid";
import { Product, Category } from "../types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onDelete: (productId: number) => void;
  categories: Category[];
  onEditSuccess: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onDelete, categories, onEditSuccess }) => {
  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard
            product={product}
            onDelete={onDelete}
            categories={categories}
            onEditSuccess={onEditSuccess}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
