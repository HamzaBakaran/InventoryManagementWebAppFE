import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { Product, Category } from "../types";
import apiClient from "../api";

interface ProductCardProps {
  product: Product;
  onDelete: (id: number) => void;
  categories: Category[]; // Categories for the dropdown
  onEditSuccess: () => void; // Callback to refresh the product list after editing
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, categories, onEditSuccess }) => {
  const { id, name, description, minimalThreshold } = product;
  const [quantity, setQuantity] = useState(product.quantity);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  const handleUpdateQuantity = async (newQuantity: number) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/api/products/${id}/quantity`, null, {
        params: { quantity: newQuantity },
      });

      if (response.data.message) {
        setWarning(response.data.message);
      }

      const updatedQuantity = response.data.product?.quantity ?? response.data.quantity;
      setQuantity(updatedQuantity);
    } catch (error) {
      console.error("Failed to update quantity", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/api/products/${id}`);
      onDelete(id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/api/products/${id}`, editedProduct);
      onEditSuccess(); // Notify parent to refresh the product list
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update product", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = () => handleUpdateQuantity(quantity + 1);
  const handleDecrease = () => {
    if (quantity > 0) handleUpdateQuantity(quantity - 1);
  };

  const handleWarningClose = () => {
    setWarning(null);
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const openEditModal = () => {
    setEditedProduct(product); // Prefill modal with the current product data
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  return (
    <>
      <Card sx={{ maxWidth: 345, margin: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            Minimal Threshold: {minimalThreshold}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
            <Button size="small" color="primary" onClick={handleDecrease} disabled={loading || quantity <= 0}>
              -
            </Button>
            <TextField
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onBlur={() => handleUpdateQuantity(quantity)}
              variant="outlined"
              size="small"
              sx={{ width: "60px", mx: 1 }}
            />
            <Button size="small" color="primary" onClick={handleIncrease} disabled={loading}>
              +
            </Button>
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" onClick={openEditModal} disabled={loading}>
            Edit
          </Button>
          <Button size="small" color="secondary" onClick={openDeleteDialog} disabled={loading}>
            Delete
          </Button>
        </CardActions>
      </Card>

      {/* Snackbar for displaying warnings */}
      <Snackbar open={!!warning} autoHideDuration={6000} onClose={handleWarningClose}>
        <Alert onClose={handleWarningClose} severity="warning" sx={{ width: "100%" }}>
          {warning}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="secondary" disabled={loading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            value={editedProduct.description}
            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            type="number"
            label="Quantity"
            value={editedProduct.quantity}
            onChange={(e) => setEditedProduct({ ...editedProduct, quantity: Number(e.target.value) })}
          />
          <TextField
            fullWidth
            margin="dense"
            type="number"
            label="Minimal Threshold"
            value={editedProduct.minimalThreshold}
            onChange={(e) => setEditedProduct({ ...editedProduct, minimalThreshold: Number(e.target.value) })}
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Category"
            value={editedProduct.categoryId}
            onChange={(e) => setEditedProduct({ ...editedProduct, categoryId: Number(e.target.value) })}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditProduct} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
