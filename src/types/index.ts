export interface User {
  _id: string;
  nickName: string;
}

export interface Tag {
  _id: string;
  nombre: string;
}

export interface PostImage {
  _id: string;
  url: string;
}

export interface Post {
    _id: string;
    descripcion: string;
    images: PostImage[];
    tags: Tag[];
    comentarios?: Comment[];
    createdAt: string;
}

export interface Comment {
  _id: string;
  contenido: string;
  userId: User;
  postId: string;
  createdAt: string;
}