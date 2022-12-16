export class HyS {
    id?: number;
    seccion : string;
    skill : string;
    nivel : number;

    constructor(seccion: string, skill: string, nivel: number){
        this.seccion = seccion;
        this.skill = skill;
        this.nivel = nivel;
    }
}
