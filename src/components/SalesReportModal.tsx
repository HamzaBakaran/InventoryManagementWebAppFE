import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { getSalesSummary } from "../api/reports";

interface SalesReportModalProps {
  open: boolean;
  onClose: () => void;
}

const SalesReportModal: React.FC<SalesReportModalProps> = ({ open, onClose }) => {
  const [reportData, setReportData] = useState<[number, string, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);

      getSalesSummary()
        .then((data) => setReportData(data))
        .catch((err) => {
          console.error("Failed to fetch sales report:", err);
          setError("Failed to fetch sales report. Please try again later.");
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sales Report</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Category ID</strong></TableCell>
                <TableCell><strong>Category Name</strong></TableCell>
                <TableCell><strong>Total Items Sold</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map(([categoryId, categoryName, totalSold]) => (
                <TableRow key={categoryId}>
                  <TableCell>{categoryId}</TableCell>
                  <TableCell>{categoryName}</TableCell>
                  <TableCell>{totalSold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalesReportModal;
