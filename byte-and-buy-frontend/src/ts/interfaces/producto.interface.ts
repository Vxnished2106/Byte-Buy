export interface productoData {
  producto_id: number;
  producto_nombre: string;
  producto_descripcion: string;
  producto_categoria: string;
  producto_etiquetas:string[]
  producto_descuento: number;
  producto_impuesto: number;
  producto_imagen: File | string; //Imagen o url de imagen existente
  producto_banner: File | string; //Imagen o url de imagen existente
  producto_estado: boolean;
}
