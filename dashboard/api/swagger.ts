import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: '/backend/swagger_api',
});


interface PaginatedSwaggerResponse {
  files: any[]; // Replace 'any' with the actual type of 'files' if known.
  page: number;
  page_size: number;
  total: number;
}


interface SwaggerTransformResponse {
  _id: string;
  methods: {
    description: string;
    method: string;
    operationId: string;
    parameters: {
      description: string;
      explode: boolean;
      in: string;
      name: string;
      required: boolean;
      schema: {
        default: string;
        enum: string[];
        type: string;
      };
    }[];
    path: string;
    summary: string;
    tags: string[];
  }[];
}


type MultipartPayload = {
  id: string; // Replace with the actual type
  file: File; // Assuming you are dealing with File objects for multipart file upload
};

export async function getSwaggerData(page: number = 1, pageSize: number = 10): Promise<AxiosResponse<PaginatedSwaggerResponse>> {
  try {
    const response = await axiosInstance.get('', {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(`Error fetching Swagger data: ${error.message}`);
  }
}

export async function getDataById(_id: string): Promise<AxiosResponse<any>> {
  const url = `/${_id}`;
  return axiosInstance.get(url);
}

export async function fetchSwaggerTransform(id: string, file: File): Promise<AxiosResponse<SwaggerTransformResponse[]>> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.get(`/transform/${id}`, {
      params: {
        file: formData,
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(`Error fetching Swagger transform data: ${error.message}`);
  }
}

export async function updateData(_id: string, swaggerJson: object): Promise<AxiosResponse<{message: string}>> {
  const url = `/${_id}`;
  return axiosInstance.put(url, swaggerJson);
}

export async function deleteData(_id: string): Promise<AxiosResponse<any>> {
  const url = `/${_id}`;
  return axiosInstance.delete(url);
}


/** As of now, we don't have to call this api from the frontend. This will internally be called from the backend */
export async function uploadSwaggerFile(id: string, file: File): Promise<AxiosResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post(`/u/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(`Error uploading Swagger file: ${error.message}`);
  }
}