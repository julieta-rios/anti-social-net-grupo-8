export interface User {
  _id: string;
  id?: string;
  nickName: string;
  email?: string;
}

export interface Tag {
  _id: string;
  id?: string;
  nombre: string;
  name?: string;
}

export interface PostImage {
  _id: string;
  id?: string;
  url: string;
  postId?: string;
}

export interface Comment {
  _id: string;
  id?: string;
  contenido?: string;
  content?: string;
  text?: string;
  userId: User | string;
  postId: string;
  visible?: boolean;
  createdAt?: string;
}

export interface Post {
  _id: string;
  id?: string;
  descripcion?: string;
  description?: string;
  userId?: User | string;
  images?: PostImage[];
  tags?: Tag[];
  comentarios?: Comment[];
  comments?: Comment[];
  createdAt?: string;
}