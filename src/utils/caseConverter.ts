/**
 * Utilitários para converter entre snake_case e camelCase
 */

/**
 * Converte uma string de snake_case para camelCase
 * Exemplo: "user_id" -> "userId"
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte uma string de camelCase para snake_case
 * Exemplo: "userId" -> "user_id"
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Tipo para valores primitivos e objetos simples
 */
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

type JSONObject = {
  [key: string]: JSONValue;
};

type JSONArray = Array<JSONValue>;

/**
 * Converte todas as chaves de um objeto de snake_case para camelCase
 */
export function convertKeysToCamel<T>(obj: JSONObject): T;
export function convertKeysToCamel<T>(obj: JSONArray): T;
export function convertKeysToCamel<T>(obj: JSONObject | JSONArray): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null && !Array.isArray(item)
        ? convertKeysToCamel(item as JSONObject)
        : item
    ) as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  const result: JSONObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      const value = obj[key];

      // Recursivamente converter objetos aninhados
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[camelKey] = convertKeysToCamel(value as JSONObject);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
            ? convertKeysToCamel(item as JSONObject)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }
  }

  return result as T;
}

/**
 * Converte todas as chaves de um objeto de camelCase para snake_case
 */
export function convertKeysToSnake<T>(obj: JSONObject): T;
export function convertKeysToSnake<T>(obj: JSONArray): T;
export function convertKeysToSnake<T>(obj: JSONObject | JSONArray): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null && !Array.isArray(item)
        ? convertKeysToSnake(item as JSONObject)
        : item
    ) as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  const result: JSONObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      const value = obj[key];

      // Recursivamente converter objetos aninhados
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[snakeKey] = convertKeysToSnake(value as JSONObject);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
            ? convertKeysToSnake(item as JSONObject)
            : item
        );
      } else {
        result[snakeKey] = value;
      }
    }
  }

  return result as T;
}
