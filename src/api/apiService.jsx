import axiosInstance from "./axiosInstance";

/**
 * API call for user login.
 * @param {string} username - User's username.
 * @param {string} password - User's password.
 * @param {string} shopId - Selected shop ID.
 * @returns {Promise<Object>} - Login response data.
 */
export const login = async (username, password, shopId) => {
  const response = await axiosInstance.post("auth/login", {
    username,
    password,
    shopId,
  });
  return response.data;
};

/**
 * API call to log out the user.
 * @returns {Promise<void>} - Resolves when the user is logged out.
 */
export const logoutUser = async () => {
  try {
    await axiosInstance.post("auth/logout");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Handle session expiration
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("dayStarted");
      window.location.reload(); // Optionally, reload the page to reset the app state
    } else {
      throw error; // Rethrow other errors
    }
  }
};

/**
 * API call to fetch branches.
 * @returns {Promise<Array>} - Response with branch data.
 */
export const fetchBranches = async () => {
  const response = await axiosInstance.get("shops");
  return response.data;
};

/**
 * API call to fetch companies.
 * @returns {Promise<Array>} - Response with company data.
 */
export const fetchCompanies = async () => {
  const response = await axiosInstance.get("companies");
  return response.data;
};

/**
 * API call to check daily balance.
 * @param {string} companyId - Company ID.
 * @param {string} shopId - Shop ID.
 * @param {string} date - Current date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - Response from the API if the daily balance exists.
 * @throws {Error} - Throws an error if no daily balance entry is found.
 */
export const checkDailyBalance = async (companyId, shopId, date) => {
  try {
    const response = await axiosInstance.get(
      `POS/daily-balance/get/${companyId}/${shopId}/${date}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("No daily balance entry found for the specified date.");
      throw new Error("No daily balance entry found for the specified date.");
    }
    throw error; // Rethrow other errors
  }
};

/**
 * API call to start the day with a given cash amount.
 * @param {Object} data - The data to start the day with.
 * @param {string} data.companyId - Company ID.
 * @param {string} data.shopId - Shop ID.
 * @param {string} data.createdBy - User ID.
 * @param {number} data.startAmount - Cash amount for the start of the day.
 * @returns {Promise<Object>} - Response from the API when starting the day.
 */
export const startDay = async (data) => {
  try {
    const response = await axiosInstance.post(
      "POS/daily-balance/day-start",
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error starting the day:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

/**
 * API call to fetch selling types.
 * @returns {Promise<Array>} - Response with selling type data.
 */
export const fetchSellingTypes = async () => {
  const response = await axiosInstance.get("sellingTypes");
  return response.data;
};

/**
 * API call to fetch categories.
 * @returns {Promise<Array>} - List of categories.
 */
export const fetchCategories = async () => {
  const response = await axiosInstance.get("categories");
  return response.data;
};

/**
 * API call to fetch product.
 * @returns {Promise<Array>} - List of product.
 */
export const fetchProducts = async () => {
  const response = await axiosInstance.get("products/get-products-with-prices");
  return response.data;
};

/**
 * API call to register a new customer.
 * @param {Object} customerData - Customer data to be sent in the request.
 * @returns {Promise<Object>} - Response with the created customer details.
 */
export const registerCustomer = async (customerData) => {
  try {
    const response = await axiosInstance.post(
      "/customers/new-customer",
      customerData
    );
    return response.data;
  } catch (error) {
    console.error("Error registering customer:", error);
    throw error; // Propagate the error to handle it in the calling function
  }
};

/**
 * API call to fetch customer.
 * @returns {Promise<Array>} - List of customer.
 */
export const fetchCustomerById = async () => {
  const response = await axiosInstance.get("/customers");
  return response.data;
};

/**
 * API call to create a new order.
 * @param {Object} orderData - Order data to be sent in the request.
 * @returns {Promise<Object>} - Response with the created order details.
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post("orders/create-new", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error; // Propagate the error to handle it in the calling function
  }
};

/**
 * API call to fetch orders.
 * @returns {Promise<Array>} - List of orders.
 */
export const fetchOrders = async () => {
  try {
    const response = await axiosInstance.get("orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * API call to fetch order by ID.
 * @param {string} orderId - ID of the order to fetch.
 * @returns {Promise<Object>} - Order details.
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * API call to fetch product stock.
 * @returns {Promise<Array>} - List of products with stock details.
 */
export const fetchProductsStock = async () => {
  try {
    const response = await axiosInstance.get("/products/product-stock/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching product stock:", error);
    throw error;
  }
};
