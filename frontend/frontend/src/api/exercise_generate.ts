import axios from 'axios'

// 定义请求参数类型
export interface ExerciseGenerateRequest {
  content: string
  title: string
  count: number
  types: number[]
}

// 定义响应数据类型
export interface ExerciseGenerateResponse {
  code: number
  data: string // 后端返回的JSON字符串
  message?: string
}

// 题目类型枚举
export enum ExerciseType {
  CHOICE = 1,    // 选择题
  FILL = 2,      // 填空题
  ESSAY = 3      // 简答题
}

// 题目类型映射
export const typeMapping = {
  'choice': ExerciseType.CHOICE,
  'fill': ExerciseType.FILL,
  'essay': ExerciseType.ESSAY
}

// 习题生成API
export const generateExercises = async (params: ExerciseGenerateRequest): Promise<ExerciseGenerateResponse> => {
  try {
    const response = await axios.post('/api/exercise/generate', params)
    return response.data
  } catch (error) {
    console.error('习题生成失败:', error)
    throw error
  }
}

// 工具函数：将前端类型转换为后端类型
export const convertTypeToBackend = (frontendType: string): number => {
  return typeMapping[frontendType] || ExerciseType.CHOICE
}

// 工具函数：解析后端返回的JSON字符串
export const parseExerciseData = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('解析习题数据失败:', error)
    return null
  }
}