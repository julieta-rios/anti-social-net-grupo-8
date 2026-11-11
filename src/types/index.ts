export interface User {
  id: number;
  nickName: string;
  email: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PostImage {
  id: number;
  url: string;
  PostId: number;
}

export interface Comment {
  id: number;
  content: string;
  PostId: number;
  UserId: number;
  User: User;
  createdAt: string;
}

export interface Post {
  id: number;
  description: string;
  UserId: number;
  User: User;
  Tags: Tag[];
  createdAt: string;
  updatedAt?: string;
}

interface PostConComentarios extends Post {
    cantidadComentarios: number;
    imagen?: string;
}