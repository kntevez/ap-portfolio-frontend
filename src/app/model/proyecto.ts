export class Proyecto {
    id? : number;
    captura : string;
    nombre : string;
    link : string;
    creacion : string;
    lenguajes : string;
    descripcion : string;

    constructor(captura: string, nombre: string, link: string, creacion: string, lenguajes: string, descripcion: string){
        this.captura = captura;
        this.nombre = nombre;
        this.link = link;
        this.creacion = creacion;
        this.lenguajes = lenguajes;
        this.descripcion = descripcion;
    }
}
