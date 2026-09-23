export type ShapeType = 'rect' | 'circle' | 'text';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  fill: string;
}

export interface RectShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  width?: number;
}

export type Shape = RectShape | CircleShape | TextShape;

export interface CanvasData {
  _id?: string;
  name: string;
  shapes: Shape[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CanvasMetadata {
  _id: string;
  name: string;
  shapeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
