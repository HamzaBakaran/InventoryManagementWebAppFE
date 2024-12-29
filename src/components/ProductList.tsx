import React from "react";
import Grid from "@mui/material/Grid";
import { Product, Category } from "../types";
import ProductCard from "./ProductCard";
import Typography from "@mui/material/Typography";

interface ProductListProps {
  products: Product[];
  onDelete: (productId: number) => void; // Callback for deleting a product
  categories: Category[]; // Categories for the dropdown
  onEditSuccess: () => void; // Callback for refreshing the product list after editing
}

const ProductList: React.FC<ProductListProps> = ({ products, onDelete, categories, onEditSuccess }) => {
  const groupedProducts = products.reduce((groups, product) => {
    if (!groups[product.categoryId]) {
      groups[product.categoryId] = {
        categoryName: product.categoryName,
        products: [],
      };
    }
    groups[product.categoryId].products.push(product);
    return groups;
  }, {} as Record<number, { categoryName: string; products: Product[] }>);

  return (
    <div>
      {Object.entries(groupedProducts).map(([categoryId, { categoryName, products }]) => (
        <div key={categoryId}>
          <Typography variant="h5" sx={{ margin: 2 }}>
            {categoryName}
          </Typography>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onDelete={onDelete}
                  categories={categories} // Pass categories to ProductCard
                  onEditSuccess={onEditSuccess} // Pass the refresh callback
                />
              </Grid>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
