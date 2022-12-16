export class Educacion {
    id?: number;
    logo : string;
    instituto : string;
    pDesde : string;
    pHasta : string;
    estudio : string;
    descripcion : string;

    constructor(logo: string, instituto: string, pDesde: string, pHasta: string, estudio: string,  descripcion: string){
        this.logo = logo;
        this.instituto = instituto;
        this.pDesde = pDesde;
        this.pHasta = pHasta;
        this.estudio = estudio;
        this.descripcion = descripcion;
    }
}
