import React, { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useProducts } from "../hooks/useProducts";
import ProductList from "../components/ProductList";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import apiClient from "../api";
import { Category } from "../types";
import SalesReportModal from "../components/SalesReportModal";

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: user } = useUser(email);


  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
    quantity: "",
    categoryId: "",
    sortBy: "name",
    order: "asc",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const { data: products, isLoading: productsLoading, refetch } = useProducts(user?.id || 0, debouncedFilters);

  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    quantity: 0,
    minimalThreshold: 0,
    categoryId: "",
    userId: user?.id || 0,
  });

  // Fetch categories on component mount
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

  // Ensure userId is correctly set in the new product
  useEffect(() => {
    if (user?.id) {
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        userId: user.id,
      }));
    }
  }, [user]);

  // Debounce updates to filters
  const debouncedUpdateFilters = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 300),
    []
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    debouncedUpdateFilters(updatedFilters); // Update debounced filters
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    debouncedUpdateFilters(updatedFilters); // Update debounced filters
  };

  useEffect(() => {
    return () => {
      debouncedUpdateFilters.cancel(); // Cleanup debounce on unmount
    };
  }, [debouncedUpdateFilters]);

  const handleAddProduct = async () => {
    setIsLoading(true);
    setSuccessMessage(""); // Clear previous messages
    try {
      await apiClient.post("/api/products", newProduct);
      refetch();
      setSuccessMessage("Product added successfully!");
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setIsLoading(true);
    setSuccessMessage(""); // Clear previous messages
    try {
      const response = await apiClient.post("/categories", { name: newCategoryName });
      const newCategory = response.data;
  
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        categoryId: newCategory.id, // Automatically select the new category
      }));
      setSuccessMessage("Category added successfully!");
      setCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to add category", error);
      alert("Failed to add category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount or when successMessage changes
    }
  }, [successMessage]);
  
  

  return (
    <>
    {/* Global Loader */}
    {isLoading && (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 2000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    )}

    {/* Success Message */}
    {successMessage && (
      <Box
        sx={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#4caf50",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          zIndex: 2000,
        }}
      >
        <Typography>{successMessage}</Typography>
      </Box>
    )}
    
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold", textAlign: "center" }}>
        Products for {email}
      </Typography>

      {/* Add Product Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}>
        <Button variant="contained" onClick={() => setProductModalOpen(true)}>
          Add Product
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setReportModalOpen(true)}>
          Generate Report
        </Button>
      </Box>

      {/* Filtering Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          marginBottom: 3,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          size="small"
          value={filters.name}
          onChange={handleFilterChange}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          name="description"
          label="Description"
          variant="outlined"
          size="small"
          value={filters.description}
          onChange={handleFilterChange}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          name="quantity"
          label="Quantity"
          variant="outlined"
          size="small"
          type="number"
          value={filters.quantity}
          onChange={handleFilterChange}
          sx={{ flex: 1, minWidth: 150 }}
        />
        <TextField
          name="categoryId"
          label="Category"
          variant="outlined"
          size="small"
          select
          value={filters.categoryId}
          onChange={handleFilterChange}
          sx={{ flex: 1, minWidth: 200 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="sortBy"
          label="Sort By"
          variant="outlined"
          size="small"
          select
          value={filters.sortBy}
          onChange={handleSortChange}
          sx={{ flex: 1, minWidth: 150 }}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="description">Description</MenuItem>
          <MenuItem value="quantity">Quantity</MenuItem>
          <MenuItem value="categoryId">Category</MenuItem>
        </TextField>
        <TextField
          name="order"
          label="Order"
          variant="outlined"
          size="small"
          select
          value={filters.order}
          onChange={handleSortChange}
          sx={{ flex: 1, minWidth: 150 }}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </TextField>
      </Box>

      {/* Product List */}
      <Box sx={{ position: "relative" }}>
        {productsLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {products && (
          <ProductList
            products={products}
            onDelete={() => refetch()}
            categories={categories}
            onEditSuccess={refetch}
          />
        )}
      </Box>

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
            <MenuItem
              value="add_new"
              sx={{
                color: "#1976d2", // Custom color for the "Add New Category" option
                fontWeight: "bold",
              }}
            >
              Add New Category
            </MenuItem>
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
            {/* Sales Report Modal */}
            <SalesReportModal
        open={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </Container>
    </>
  );
};

export default ProductsPage;
