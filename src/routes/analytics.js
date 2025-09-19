import express from "express";
const router = express.Router();

import { 
  getAnalyticsSummary,
  getProductAnalytics,
  getCategoryAnalytics,
  getTimeSeriesData,
  getTopPerformingProducts,
  getProfitTrends,
  getComparisonData
} from "../controllers/analytics.js";

// Get analytics summary
router.get("/summary", getAnalyticsSummary);

// Get product analytics
router.get("/products", getProductAnalytics);

// Get category analytics
router.get("/categories", getCategoryAnalytics);

// Get time series data
router.get("/timeseries/:period", getTimeSeriesData);

// Get top performing products
router.get("/top-products/:limit?", getTopPerformingProducts);

// Get profit trends
router.get("/profit-trends", getProfitTrends);

// Get comparison data
router.post("/comparison", getComparisonData);

export default router;
