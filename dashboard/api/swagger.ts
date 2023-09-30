import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: '/backend/swagger_api',
});

// Define a type for the multipart request payload
type MultipartPayload = {
  id: string; // Replace with the actual type
  file: File; // Assuming you are dealing with File objects for multipart file upload
};

// Example function for the "/u/<swagger_url>" GET route
export async function getSwaggerData(swaggerUrl: string): Promise<AxiosResponse<any>> {
  const url = `/u/${swaggerUrl}`;
  return axiosInstance.get(url);
}

// Example function for the "/b/<id>" POST route (multipart request)
export async function postMultipartData(id: string, formData: MultipartPayload): Promise<AxiosResponse<any>> {
  const url = `/b/${id}`;
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Example function for the "/<_id>" GET route
export async function getDataById(_id: string): Promise<AxiosResponse<any>> {
  const url = `/${_id}`;
  return axiosInstance.get(url);
}

// Example function for the "/transform/<_id>" GET route
export async function getTransformedData(_id: string): Promise<AxiosResponse<any>> {
  const url = `/transform/${_id}`;
  return axiosInstance.get(url);
}

// Example function for the "/<_id>" PUT route
export async function updateData(_id: string, swaggerJson: object): Promise<AxiosResponse<any>> {
  const url = `/${_id}`;
  return axiosInstance.put(url, swaggerJson);
}

// Example function for the "/<_id>" DELETE route
export async function deleteData(_id: string): Promise<AxiosResponse<any>> {
  const url = `/${_id}`;
  return axiosInstance.delete(url);
}
