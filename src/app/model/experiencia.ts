export class Experiencia {
    id? : number;
    logo : string;
    empresa : string;
    pDesde : string;
    pHasta : string;
    puesto : string;
    descripcion : string;

    constructor(logo: string, empresa: string, pDesde: string, pHasta: string, puesto: string,  descripcion: string){
        this.logo = logo;
        this.empresa = empresa;
        this.pDesde = pDesde;
        this.pHasta = pHasta;
        this.puesto = puesto;
        this.descripcion = descripcion;
    }
}
