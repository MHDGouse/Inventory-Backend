import Sales from '../modules/sales.js';
import Product from '../modules/Produt.js';
import mongoose from 'mongoose';

/**
 * Get overall analytics summary with key performance indicators
 */
export const getAnalyticsSummary = async (req, res) => {
  const filters = req.query;
  
  try {
    // Build MongoDB query from filters
    const query = buildFilterQuery(filters);
    
    // Get all sales that match the filters
    const sales = await Sales.find(query).populate('product');
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given filters' });
    }
    
    // Calculate summary metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + (sale.totalPrice - (sale.product.costPrice * sale.quantity)), 0);
    const totalTransactions = sales.length;
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const averageOrderValue = totalRevenue / totalTransactions;
    const profitMargin = (totalProfit / totalRevenue) * 100;
    
    res.json({
      totalRevenue,
      totalProfit,
      totalTransactions,
      totalItemsSold,
      averageOrderValue,
      profitMargin
    });
  } catch (error) {
    console.error('Error in getAnalyticsSummary:', error);
    res.status(500).json({ message: 'Error fetching analytics summary', error: error.message });
  }
};

/**
 * Get performance metrics for all products
 */
export const getProductAnalytics = async (req, res) => {
  const filters = req.query;
  
  try {
    // Build MongoDB query from filters
    const query = buildFilterQuery(filters);
    
    // Get all sales that match the filters
    const sales = await Sales.find(query).populate('product');
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given filters' });
    }
    
    // Group sales by product
    const productMap = {};
    
    sales.forEach(sale => {
      const productId = sale.product._id.toString();
      
      if (!productMap[productId]) {
        productMap[productId] = {
          productId: productId,
          productName: sale.name || sale.product.name,
          category: sale.product.category || 'Uncategorized',
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        };
      }
      
      productMap[productId].quantitySold += sale.quantity;
      productMap[productId].revenue += sale.totalPrice;
      productMap[productId].profit += sale.totalPrice - (sale.product.costPrice * sale.quantity);
    });
    
    // Calculate additional metrics and convert to array
    const productAnalytics = Object.values(productMap).map(product => {
      product.profitMargin = (product.profit / product.revenue) * 100;
      product.averagePrice = product.revenue / product.quantitySold;
      return product;
    });
    
    res.json(productAnalytics);
  } catch (error) {
    console.error('Error in getProductAnalytics:', error);
    res.status(500).json({ message: 'Error fetching product analytics', error: error.message });
  }
};

/**
 * Returns performance metrics grouped by product category
 */
export const getCategoryAnalytics = async (req, res) => {
  const filters = req.query;
  
  try {
    // Build MongoDB query from filters
    const query = buildFilterQuery(filters);
    
    // Get all sales that match the filters
    const sales = await Sales.find(query).populate('product');
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given filters' });
    }
    
    // Group sales by category
    const categoryMap = {};
    let totalRevenue = 0;
    
    sales.forEach(sale => {
      const category = sale.product.category || 'Uncategorized';
      totalRevenue += sale.totalPrice;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          totalProducts: new Set(),
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        };
      }
      
      categoryMap[category].totalProducts.add(sale.product._id.toString());
      categoryMap[category].quantitySold += sale.quantity;
      categoryMap[category].revenue += sale.totalPrice;
      categoryMap[category].profit += sale.totalPrice - (sale.product.costPrice * sale.quantity);
    });
    
    // Calculate additional metrics and convert to array
    const categoryAnalytics = Object.values(categoryMap).map(category => {
      category.totalProducts = category.totalProducts.size;
      category.profitMargin = (category.profit / category.revenue) * 100;
      category.marketShare = (category.revenue / totalRevenue) * 100;
      return category;
    });
    
    res.json(categoryAnalytics);
  } catch (error) {
    console.error('Error in getCategoryAnalytics:', error);
    res.status(500).json({ message: 'Error fetching category analytics', error: error.message });
  }
};

/**
 * Returns time-based analytics data for trend visualization
 */
export const getTimeSeriesData = async (req, res) => {
  const { period = 'daily' } = req.params;
  const filters = req.query;
  
  try {
    // Build MongoDB query from filters
    const query = buildFilterQuery(filters);
    
    // Get all sales that match the filters
    const sales = await Sales.find(query).populate('product').sort({ saleDate: 1 });
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given filters' });
    }
    
    // Group sales by date according to the specified period
    const timeSeriesMap = {};
    
    sales.forEach(sale => {
      let dateKey;
      const saleDate = new Date(sale.saleDate || sale.createdAt);
      
      if (period === 'daily') {
        dateKey = saleDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'weekly') {
        // Get the first day of the week (Sunday)
        const firstDay = new Date(saleDate);
        const day = saleDate.getDay();
        firstDay.setDate(saleDate.getDate() - day);
        dateKey = firstDay.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        dateKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!timeSeriesMap[dateKey]) {
        timeSeriesMap[dateKey] = {
          date: dateKey,
          revenue: 0,
          profit: 0,
          transactions: 0,
          itemsSold: 0
        };
      }
      
      timeSeriesMap[dateKey].revenue += sale.totalPrice;
      timeSeriesMap[dateKey].profit += sale.totalPrice - (sale.product.costPrice * sale.quantity);
      timeSeriesMap[dateKey].transactions += 1;
      timeSeriesMap[dateKey].itemsSold += sale.quantity;
    });
    
    // Convert to array and sort by date
    const timeSeriesData = Object.values(timeSeriesMap).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    res.json(timeSeriesData);
  } catch (error) {
    console.error('Error in getTimeSeriesData:', error);
    res.status(500).json({ message: 'Error fetching time series data', error: error.message });
  }
};

/**
 * Returns top-performing products sorted by revenue
 */
export const getTopPerformingProducts = async (req, res) => {
  const { limit = 10 } = req.params;
  const filters = req.query;
  
  try {
    // Build MongoDB query from filters
    const query = buildFilterQuery(filters);
    
    // Get all sales that match the filters
    const sales = await Sales.find(query).populate('product');
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given filters' });
    }
    
    // Group sales by product
    const productMap = {};
    
    sales.forEach(sale => {
      const productId = sale.product._id.toString();
      
      if (!productMap[productId]) {
        productMap[productId] = {
          productId: productId,
          productName: sale.name || sale.product.name,
          category: sale.product.category || 'Uncategorized',
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        };
      }
      
      productMap[productId].quantitySold += sale.quantity;
      productMap[productId].revenue += sale.totalPrice;
      productMap[productId].profit += sale.totalPrice - (sale.product.costPrice * sale.quantity);
    });
    
    // Calculate additional metrics, convert to array, and sort by revenue
    const productAnalytics = Object.values(productMap)
      .map(product => {
        product.profitMargin = (product.profit / product.revenue) * 100;
        product.averagePrice = product.revenue / product.quantitySold;
        return product;
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));
    
    res.json(productAnalytics);
  } catch (error) {
    console.error('Error in getTopPerformingProducts:', error);
    res.status(500).json({ message: 'Error fetching top performing products', error: error.message });
  }
};

/**
 * Returns profit trend comparison between current and previous periods
 */
export const getProfitTrends = async (req, res) => {
  const filters = req.query;
  
  try {
    // Get comparison periods
    const { current, previous } = getComparisonPeriods(filters);
    
    // Get current period data
    const currentQuery = buildFilterQuery(current);
    const currentSales = await Sales.find(currentQuery).populate('product');
    const currentProfit = currentSales.reduce((sum, sale) => 
      sum + (sale.totalPrice - (sale.product.costPrice * sale.quantity)), 0);
    
    // Get previous period data
    const previousQuery = buildFilterQuery(previous);
    const previousSales = await Sales.find(previousQuery).populate('product');
    const previousProfit = previousSales.reduce((sum, sale) => 
      sum + (sale.totalPrice - (sale.product.costPrice * sale.quantity)), 0);
    
    // Calculate percentage change
    const percentageChange = calculatePercentageChange(previousProfit, currentProfit);
    
    res.json({
      currentPeriod: currentProfit,
      previousPeriod: previousProfit,
      percentageChange
    });
  } catch (error) {
    console.error('Error in getProfitTrends:', error);
    res.status(500).json({ message: 'Error fetching profit trends', error: error.message });
  }
};

/**
 * Compares analytics between two periods with percentage changes
 */
export const getComparisonData = async (req, res) => {
  const { currentFilters, previousFilters } = req.body;
  
  try {
    // If no previous filters provided, auto calculate them
    const periods = previousFilters ? 
      { current: currentFilters, previous: previousFilters } : 
      getComparisonPeriods(currentFilters);
    
    // Get current period data
    const currentQuery = buildFilterQuery(periods.current);
    const currentSales = await Sales.find(currentQuery).populate('product');
    
    // Get previous period data
    const previousQuery = buildFilterQuery(periods.previous);
    const previousSales = await Sales.find(previousQuery).populate('product');
    
    // Calculate metrics for both periods
    const currentMetrics = calculateMetrics(currentSales);
    const previousMetrics = calculateMetrics(previousSales);
    
    // Calculate percentage changes
    const percentageChanges = {
      revenue: calculatePercentageChange(previousMetrics.totalRevenue, currentMetrics.totalRevenue),
      profit: calculatePercentageChange(previousMetrics.totalProfit, currentMetrics.totalProfit),
      transactions: calculatePercentageChange(previousMetrics.totalTransactions, currentMetrics.totalTransactions),
      itemsSold: calculatePercentageChange(previousMetrics.totalItemsSold, currentMetrics.totalItemsSold),
    };
    
    res.json({
      current: currentMetrics,
      previous: previousMetrics,
      percentageChanges
    });
  } catch (error) {
    console.error('Error in getComparisonData:', error);
    res.status(500).json({ message: 'Error fetching comparison data', error: error.message });
  }
};

// --- Utility Functions ---

/**
 * Builds a MongoDB query object from the provided filters
 */
function buildFilterQuery(filters = {}) {
  const query = {};
  
  // Date range filters
  if (filters.startDate || filters.endDate) {
    query.saleDate = {};
    
    if (filters.startDate) {
      query.saleDate.$gte = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1); // Include the end date
      query.saleDate.$lt = endDate;
    }
  }
  
  // Sale type filter
  if (filters.saleType && filters.saleType !== 'all') {
    query.customerType = filters.saleType === 'wholesale' ? 'shopkeeper' : 'normal';
  }
  
  // Product and category filters require aggregation or additional queries
  // These are handled in the individual controller functions
  
  return query;
}

/**
 * Calculates comparison periods based on current filters
 */
function getComparisonPeriods(filters = {}) {
  const current = { ...filters };
  const previous = { ...filters };
  
  if (current.startDate && current.endDate) {
    const startDate = new Date(current.startDate);
    const endDate = new Date(current.endDate);
    const duration = endDate - startDate;
    
    previous.startDate = new Date(startDate - duration).toISOString().split('T')[0];
    previous.endDate = new Date(startDate - 1).toISOString().split('T')[0];
  } else {
    // Default to last 30 days vs previous 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    current.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    current.endDate = today.toISOString().split('T')[0];
    
    previous.startDate = sixtyDaysAgo.toISOString().split('T')[0];
    previous.endDate = thirtyDaysAgo.toISOString().split('T')[0];
  }
  
  return { current, previous };
}

/**
 * Calculates basic metrics from sales data
 */
function calculateMetrics(sales) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalProfit = sales.reduce((sum, sale) => 
    sum + (sale.totalPrice - (sale.product.costPrice * sale.quantity)), 0);
  const totalTransactions = sales.length;
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  return {
    totalRevenue,
    totalProfit,
    totalTransactions,
    totalItemsSold,
    averageOrderValue,
    profitMargin
  };
}

/**
 * Calculates percentage change between two values
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}
