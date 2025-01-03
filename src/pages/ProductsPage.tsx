import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useProducts } from "../hooks/useProducts";
import ProductList from "../components/ProductList";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import apiClient from "../api";
import { Category } from "../types";

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const { data: user, isLoading: userLoading } = useUser(email);
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts(user?.id || 0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    quantity: 0,
    minimalThreshold: 0,
    categoryId: "",
    userId: user?.id || 0,
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddProduct = async () => {
    try {
       await apiClient.post("/api/products", newProduct);
      refetchProducts();
      setProductModalOpen(false);
      setNewProduct({
        name: "",
        description: "",
        quantity: 0,
        minimalThreshold: 0,
        categoryId: "",
        userId: user?.id || 0,
      });
    } catch (error) {
      console.error("Failed to add product", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await apiClient.post("/categories", { name: newCategoryName });
      setCategories((prevCategories) => [...prevCategories, response.data]);
      setCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to add category", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await apiClient.delete(`/api/products/${productId}`);
      refetchProducts(); // Refetch products after deletion
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  if (userLoading || productsLoading) {
    return (
      <Container sx={{ textAlign: "center", marginTop: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          padding: 2,
          borderRadius: 2,
          marginBottom: 4,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Products for {email}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setProductModalOpen(true)}>
          Add Product
        </Button>
      </Box>
      {products && (
        <ProductList
          products={products}
          onDelete={handleDeleteProduct}
          categories={categories} // Pass categories to ProductList
          onEditSuccess={refetchProducts} // Pass refetchProducts for refreshing the list after editing
        />
      )}

      {/* Add Product Modal */}
      <Dialog open={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Fill in the details to add a new product.</DialogContentText>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            type="number"
            label="Quantity"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value, 10) })}
          />
          <TextField
            fullWidth
            margin="dense"
            type="number"
            label="Minimal Threshold"
            value={newProduct.minimalThreshold}
            onChange={(e) => setNewProduct({ ...newProduct, minimalThreshold: parseInt(e.target.value, 10) })}
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Category"
            value={newProduct.categoryId}
            onChange={(e) => {
              if (e.target.value === "add_new") {
                setCategoryModalOpen(true);
              } else {
                setNewProduct({ ...newProduct, categoryId: e.target.value });
              }
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
            <MenuItem value="add_new">Add New Category</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddProduct} color="primary" variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddCategory} color="primary" variant="contained">
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsPage;
