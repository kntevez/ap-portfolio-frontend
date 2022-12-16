import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Experiencia } from 'src/app/model/experiencia';
import { ExperienciaService } from 'src/app/service/experiencia.service';
import { TokenService } from 'src/app/service/token.service';
import { Storage, ref, getDownloadURL, deleteObject, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-experiencia',
  templateUrl: './experiencia.component.html',
  styleUrls: ['./experiencia.component.css']
})

export class ExperienciaComponent implements OnInit {
  empresa: string;
  pDesde: string;
  pHasta: string;
  puesto: string;
  descripcion: string;
  actualidad: boolean;

  experiencia: Experiencia[] = [];
  experienciaE: Experiencia = null;
  id: number;

  dateNow = this.formatDate(new Date());

  displayCreate = 'none';
  displayEdit = 'none';
  displayDelete = 'none';

  constructor(private experienciaS: ExperienciaService, private tokenService: TokenService, private router: Router, private storage: Storage) { }

  isLogged = false;
  orderAsc = false;

  logo = false;
  changeImg = false;
  urlImgEmpty = "https://firebasestorage.googleapis.com/v0/b/portfolio-knt.appspot.com/o/imagenes%2FlogoEmpty.png?alt=media&token=ec24c961-2c7b-42e8-a55d-963a659df552";
  urlImg: string;
  previsualizacion: string;
  archivoCapturado: any;

  /****************************** INICIO ******************************/

  ngOnInit(): void {
    this.cargarExperiencia();
    if (this.tokenService.getToken()) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }
  }

  order() {
    if (!this.orderAsc) {
      this.orderAsc = true;
      this.cargarExperiencia();
    } else {
      this.orderAsc = false;
      this.cargarExperiencia();
    }
  }

  cargarExperiencia(): void {
    this.experienciaS.lista().subscribe(
      data => {
        this.experiencia = data;

        if (!this.orderAsc) {
          this.experiencia.sort((x, y) => +new Date(y.pDesde) - + new Date(x.pDesde));
        } else {
          this.experiencia.sort((x, y) => +new Date(x.pDesde) - + new Date(y.pDesde));
        }
      }
    );
  }

  formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0')
      ].join('-')
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
    // Se ejecuta si tiene img
    if (this.logo == true) {
      const starsRef = ref(this.storage, 'imagenes/experiencia/logo_' + (this.experiencia.slice(-1)[0].id + 1));

      getDownloadURL(starsRef)
        .then((url) => {
          this.urlImg = url;
          const experiencia = new Experiencia(this.urlImg, this.empresa, this.pDesde, (this.actualidad == true) ? "Actualidad" : this.pHasta, this.puesto, this.descripcion);
          this.experienciaS.save(experiencia).subscribe(
            data => {
              this.router.navigate(['']);
              this.cargarExperiencia();
            }, err => {
              alert("Error al guardar experiencia");
              this.router.navigate(['']);
            }
          );
          this.onCloseModalCreate();
        })

        .catch((error) => {
          console.log(error);
          alert("Error al guardar experiencia");
          this.router.navigate(['']);
          this.onCloseModalCreate();
        });
    } else {
      // Se ejecuta si no tiene img
      const experiencia = new Experiencia(this.urlImgEmpty, this.empresa, this.pDesde, (this.actualidad == true) ? "Actualidad" : this.pHasta, this.puesto, this.descripcion);
      this.experienciaS.save(experiencia).subscribe(
        data => {
          this.router.navigate(['']);
          this.cargarExperiencia();
        }, err => {
          alert("Error al guardar experiencia");
          this.router.navigate(['']);
        }
      );
      this.onCloseModalCreate();
    }
  }

  clearModalCreate(): void {
    this.logo = false;
    this.empresa = '';
    this.pDesde = '';
    this.pHasta = '';
    this.puesto = '';
    this.descripcion = '';
    this.actualidad = false;

    document.getElementById('logoExpC').classList.remove('is-invalid');
    document.getElementById('empresaExpC').classList.remove('is-invalid');
    document.getElementById('pDesdeExpC').classList.remove('is-invalid');
    document.getElementById('pHastaExpC').classList.remove('is-invalid');
    document.getElementById('puestoExpC').classList.remove('is-invalid');
    document.getElementById('descripcionExpC').classList.remove('is-invalid');
  }


  /****************************** MODAL EDITAR ******************************/

  openModalEdit(id?: number): void {
    this.id = id;

    this.experienciaS.details(id).subscribe(
      data => {
        this.experienciaE = data;

        // Verifica si el elemento tiene img o no 
        if (this.experienciaE.logo != this.urlImgEmpty) {
          this.logo = true;
        } else {
          this.logo = false;
        }

        this.experienciaE.pHasta == 'Actualidad' ? this.actualidad = true : this.actualidad = false;
      }, err => {
        this.onCloseModalEdit();
        alert("Error al obtener experiencia");
        this.router.navigate(['']);
      }
    );
    this.displayEdit = 'block';
  }

  onCloseModalEdit(): void {
    this.displayEdit = 'none';
    this.actualidad = false;
    this.changeImg = false;
  }

  onUpdate(): void {
    // Se ejecuta si se cambió de img
    if (this.changeImg == true && this.logo == true) {
      const starsRef = ref(this.storage, 'imagenes/experiencia/logo_' + this.id);

      // Obtiene URL de nueva img y lo registra en el elemento
      getDownloadURL(starsRef)
        .then((url) => {
          this.urlImg = url;
          const experiencia = new Experiencia(this.urlImg, this.experienciaE.empresa, this.experienciaE.pDesde, (this.actualidad == true) ? "Actualidad" : this.experienciaE.pHasta, this.experienciaE.puesto, this.experienciaE.descripcion);
          this.experienciaS.update(this.id, experiencia).subscribe(
            data => {
              // Si tenía img la elimina de Firebase 
              if (this.logo == false) {
                const desertRef = ref(this.storage, 'imagenes/experiencia/logo_' + this.id);
                deleteObject(desertRef).then(() => {
                }).catch((error) => {
                  alert("Error al eliminar imagen");
                  this.router.navigate(['']);
                });
              }
              this.router.navigate(['']);
              this.cargarExperiencia();
            }, err => {
              alert("Error al editar experiencia");
              this.router.navigate(['']);
            }
          );
          this.onCloseModalEdit();
        })

        .catch((error) => {
          console.log(error);
          alert("Error al editar experiencia");
          this.router.navigate(['']);
          this.onCloseModalEdit();
        });
    } else {
      // Se ejecuta si no tiene img o no se cambió img
      const experiencia = new Experiencia(this.logo ? this.experienciaE.logo : this.urlImgEmpty, this.experienciaE.empresa, this.experienciaE.pDesde, (this.actualidad == true) ? "Actualidad" : this.experienciaE.pHasta, this.experienciaE.puesto, this.experienciaE.descripcion);
      this.experienciaS.update(this.id, experiencia).subscribe(
        data => {
          // Si tenía img la elimina de Firebase 
          if (this.logo == false && this.changeImg == true) {
            const desertRef = ref(this.storage, 'imagenes/experiencia/logo_' + this.id);
            deleteObject(desertRef).then(() => {
            }).catch((error) => {
              alert("Error al eliminar imagen");
              this.router.navigate(['']);
            });
          }
          this.router.navigate(['']);
          this.cargarExperiencia();
        }, err => {
          alert("Error al editar experiencia");
          this.router.navigate(['']);
        }
      );
      this.onCloseModalEdit();
    }
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
    // Verifica si tiene img y la elimina de Firebase
    this.experienciaS.details(this.id).subscribe(
      data => {
        this.experienciaE = data;
        if (this.experienciaE.logo != this.urlImgEmpty) {
          const desertRef = ref(this.storage, 'imagenes/experiencia/logo_' + this.id);
          deleteObject(desertRef).then(() => {
          }).catch((error) => {
            alert("Error al eliminar imagen");
          });
        }
      }, err => {
      }
    );

    // Elimina elemento 
    if (this.id != undefined) {
      this.experienciaS.delete(this.id).subscribe(
        data => {
          this.cargarExperiencia();
        }, err => {
          alert("Error al eliminar experiencia");
        }
      );
    }

    this.onCloseModalDelete();
  }


  /****************************** FUNCIONES ******************************/

  uploadImage($event: any): void {
    const file = $event.target.files[0];

    // Si se crea elemento, toma el último ID de la lista y sube img
    if (this.displayCreate != 'none') {
      const name = "imagenes/experiencia/logo_" + (this.experiencia.slice(-1)[0].id + 1);
      const imgRef = ref(this.storage, name);
      uploadBytes(imgRef, file)
        .then(response => { })
        .catch(error => console.log(error)
        );
    }

    // Si se edita elemento, toma el ID correspondiente y sube img
    if (this.displayEdit != 'none') {
      const name = "imagenes/experiencia/logo_" + this.id;
      const imgRef = ref(this.storage, name);
      uploadBytes(imgRef, file)
        .then(response => { })
        .catch(error => console.log(error)
        );
    }

    // Captura img
    this.archivoCapturado = $event.target.files[0];
    this.extraerBase64(this.archivoCapturado).then((imagen: any) => {
      this.logo = true;
      this.changeImg = true;
      this.previsualizacion = imagen.base;
    });
  }

  // Base 64
  extraerBase64 = async ($event: any) => new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };

      reader.onerror = error => {
        resolve({
          base: null
        });
      };
    } catch (e) {
      return null;
    }
  });

}




