import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/backend/flows",
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

export async function getSwaggerData(page: number = 1, pageSize: number = 10) {
  try {
    const response = await axiosInstance.get<PaginatedSwaggerResponse>("", {
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

export async function getDataById(_id: string) {
  const url = `/${_id}`;
  return axiosInstance.get<any>(url);
}

export async function fetchSwaggerTransform(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.get<SwaggerTransformResponse[]>(
      `/transform/${id}`,
      {
        params: {
          file: formData,
        },
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(`Error fetching Swagger transform data: ${error.message}`);
  }
}

export async function updateData(_id: string, swaggerJson: object) {
  const url = `/${_id}`;
  return axiosInstance.put<{ message: string }>(url, swaggerJson);
}

export async function deleteData(_id: string) {
  const url = `/${_id}`;
  return axiosInstance.delete<any>(url);
}

/** As of now, we don't have to call this api from the frontend. This will internally be called from the backend */
export async function uploadSwaggerFile(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post<any>(`/u/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(`Error uploading Swagger file: ${error.message}`);
  }
}
