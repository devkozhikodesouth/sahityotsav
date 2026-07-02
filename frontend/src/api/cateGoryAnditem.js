import axios from "./axios";

export const baseUrl = import.meta.env.VITE_BASE_URL

async function getCategory() {
  const response = await axios.get(`${baseUrl}/getcategoryname`);
  return response.data;
}
async function addCategory(categoryName) {
  const response = await axios.post(`${baseUrl}/addcategoryname`, {
    categoryName,
  });
  return response.data;
}
async function editCategory(categoryId, categoryName) {
  const response = await axios.put(`${baseUrl}/editcategoryname`, {
    categoryId,
    categoryName,
  });
  return response.data;
}

async function deleteCategory(categoryId) {
  const response = await axios.delete(
    `${baseUrl}/deletecategoryname/${categoryId}`
  );
  return response.data;
}

async function getItem(id) {
  const response = await axios.get(`${baseUrl}/getitemname/${id}`);
  return response.data;
}

async function getPublishedItem(id) {
  const response = await axios.get(`${baseUrl}/getpublisheditemname/${id}`);
  return response.data;
}

async function addItem(categoryId, itemName) {
  const response = await axios.post(`${baseUrl}/additemname`, {
    categoryId,
    itemName,
  });
  return response.data;
}
async function deleteItem(itemId) {
  const response = await axios.delete(`${baseUrl}/deleteitemname/${itemId}`);
  return response.data;
}

async function editItem(itemId, itemName, categoryId) {
  const response = await axios.put(`${baseUrl}/edititemname`, {
    itemId,
    itemName,
    categoryId,
  });
  return response.data;
}
export {
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  getItem,
  getPublishedItem,
  addItem,
  deleteItem,
  editItem,
};
