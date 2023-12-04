import axios from "axios";
import { baseUrl } from "./base-url";

const instance = axios.create({
  baseURL: baseUrl + "/backend/swagger_api",
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
type SwaggerType = {
  _id: string;
  meta: {
    bot_id: string;
  };
  bot_id: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  paths: {};
};
type Schema = {
  default?: string;
  enum?: string[];
  items?: {
    type: string;
  };
  format?: string;
  type: string;
};

type Parameter = {
  description: string;
  explode?: boolean;
  in: string;
  name: string;
  required?: boolean;
  schema: Schema;
};

type Method = {
  description: string;
  method: string;
  operationId: string;
  parameters?: Parameter[];
  path: string;
  summary: string;
  tags: string[];
};

export async function getSwaggerData(page: number = 1, pageSize: number = 10) {
  try {
    return await instance.get<PaginatedSwaggerResponse>("", {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error: any) {
    throw new Error(`Error fetching Swagger data: ${error.message}`);
  }
}

export async function getDataById(_id: string) {
  const url = `/${_id}`;
  return instance.get<any>(url);
}

export async function fetchSwaggerTransform(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instance.get<SwaggerTransformResponse[]>(
      `/transform/${id}`,
      {
        params: {
          file: formData,
        },
      },
    );
    return response;
  } catch (error: any) {
    throw new Error(`Error fetching Swagger transform data: ${error.message}`);
  }
}

export async function updateData(_id: string, swaggerJson: object) {
  const url = `/${_id}`;
  return instance.put<{ message: string }>(url, swaggerJson);
}

export async function deleteData(_id: string) {
  const url = `/${_id}`;
  return instance.delete<any>(url);
}

export const getTrasnformedSwagger = (id: string) => {
  return instance.get<
    [
      {
        _id: string;
        methods: Method[];
      },
    ]
  >(`/transform/${id}`);
};
// http://localhost:8888/backend/swagger_api/get/b/:bot_id
export const getSwaggerByBotId = async (bot_id: string) => {
  return await instance.get<SwaggerType>(`/get/b/${bot_id}`);
};
export const getSwaggerfromSwaggerUrl = async (swagger_url: string) => {
  return await instance.get<SwaggerType>(swagger_url);
};

/** As of now, we don't have to call this api from the frontend. This will internally be called from the backend */
export async function uploadSwaggerFile(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instance.post<any>(`/u/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(`Error uploading Swagger file: ${error.message}`);
  }
}
