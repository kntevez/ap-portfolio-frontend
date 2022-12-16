export class AcercaDe{
    id?: number;
    foto: string;
    nombre: string;
    titulo: string;
    descripcion: string;

    constructor(foto: string, nombre: string, titulo: string, descripcion: string){
        this.foto = foto;
        this.nombre = nombre;
        this.titulo = titulo;
        this.descripcion = descripcion;
    }
}
