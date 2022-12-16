import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HyS } from 'src/app/model/hys';
import { HySService } from 'src/app/service/hys.service';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-hys',
  templateUrl: './hys.component.html',
  styleUrls: ['./hys.component.css']
})

export class HySComponent implements OnInit {
  seccion: string;
  skill: string;
  nivel: number;

  hys: HyS[] = [];
  hysE: HyS = null;
  id: number;

  displayCreate = 'none';
  displayEdit = 'none';
  displayDelete = 'none';

  constructor(private hysS: HySService, private tokenService: TokenService, private router: Router) { }

  isLogged = false;
  
  frontEndShow = false; 
  backEndShow = false;
  toolsShow = false;
  /****************************** INICIO ******************************/

  ngOnInit(): void {
    this.cargarHyS();
    if (this.tokenService.getToken()) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }
  }

  cargarHyS(): void {
    this.hysS.lista().subscribe(
      data => {
        this.hys = data;
      }
    );
  }


  /****************************** MODAL CREAR ******************************/

  openModalCreate(): void {
    this.clearModalCreate();
    this.displayCreate = 'block';
  }

  onCloseModalCreate(): void {
    this.displayCreate = 'none';
    this.clearModalCreate();
  }

  onCreate(): void {
    const hys = new HyS(this.seccion, this.skill, (this.seccion != "Soft Skills") ? this.nivel : 0);

    this.hysS.save(hys).subscribe(
      data => {
        this.router.navigate(['']);
        this.cargarHyS();
      }, err => {
        alert("Error al guardar HyS");
        this.router.navigate(['']);
      }
    );
    this.onCloseModalCreate();
  }

  clearModalCreate(): void {
    this.seccion = '';
    this.skill = '';
    this.nivel = 0;

    document.getElementById('seccionHySC').classList.remove('is-invalid');
    document.getElementById('skillHySC').classList.remove('is-invalid');
  }


  /****************************** MODAL EDITAR ******************************/

  openModalEdit(id?: number): void {
    this.id = id;
    this.hysS.detail(id).subscribe(
      data => {
        this.hysE = data;
      }, err => {
        alert("Error al obtener HyS");
        this.router.navigate(['']);
      }
    );
    this.displayEdit = 'block';
  }

  onCloseModalEdit(): void {
    this.displayEdit = 'none';
  }

  onUpdate(): void {
    const hys = new HyS(this.hysE.seccion, this.hysE.skill, (this.hysE.seccion != "Soft Skills") ? this.hysE.nivel : 0);
    this.hysS.update(this.id, hys).subscribe(
      data => {
        this.router.navigate(['']);
        this.cargarHyS();
      }, err => {
        alert("Error al modificar HyS");
        this.router.navigate(['']);
      }
    );
    this.onCloseModalEdit();
  }

  /****************************** MODAL ELIMINAR ******************************/

  openModalDelete(id?: number): void {
    this.id = id;
    this.displayDelete = 'block';
  }

  onCloseModalDelete(): void {
    this.displayDelete = 'none';
  }

  onDelete(): void {
    if (this.id != undefined) {
      this.hysS.delete(this.id).subscribe(
        data => {
          this.cargarHyS();
        }, err => {
          alert("Error al eliminar HyS");
        }
      );
    }
    this.onCloseModalDelete();
  }

}

