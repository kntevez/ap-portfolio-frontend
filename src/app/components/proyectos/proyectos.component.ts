import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Proyecto } from 'src/app/model/proyecto';
import { ProyectosService } from 'src/app/service/proyectos.service';
import { TokenService } from 'src/app/service/token.service';
import { Storage, ref, getDownloadURL, deleteObject, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.css']
})

export class ProyectosComponent implements OnInit {
  nombre: string;
  link: string;
  creacion: string;
  lenguajes: string;
  descripcion: string;

  proyecto: Proyecto[] = [];
  proyectoE: Proyecto = null;
  id: number;

  dateNow = this.formatDate(new Date());

  displayCreate = 'none';
  displayEdit = 'none';
  displayDelete = 'none';

  constructor(private proyectosS: ProyectosService, private tokenService: TokenService, private router: Router, private storage: Storage) { }

  isLogged = false;
  orderAsc = false;

  captura = false;
  changeImg = false;
  urlImgEmpty = "https://firebasestorage.googleapis.com/v0/b/portfolio-knt.appspot.com/o/imagenes%2FcapturaEmpty.png?alt=media&token=c0ac099e-0732-4f17-8e22-78c71178337d";
  urlImg: string;
  previsualizacion: string;
  archivoCapturado: any;


  /****************************** INICIO ******************************/

  ngOnInit(): void {
    this.cargarProyectos();
    if (this.tokenService.getToken()) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }
  }

  order() {
    if (!this.orderAsc) {
      this.orderAsc = true;
      this.cargarProyectos();
    } else {
      this.orderAsc = false;
      this.cargarProyectos();
    }
  }

  cargarProyectos(): void {
    this.proyectosS.lista().subscribe(
      data => {
        this.proyecto = data;

        if (!this.orderAsc) {
          this.proyecto.sort((x, y) => +new Date(y.creacion) - + new Date(x.creacion));
        } else {
          this.proyecto.sort((x, y) => +new Date(x.creacion) - + new Date(y.creacion));
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
if (this.captura == true) {
  const starsRef = ref(this.storage, 'imagenes/proyectos/captura_' + (this.proyecto.slice(-1)[0].id + 1));

  getDownloadURL(starsRef)
    .then((url) => {
      this.urlImg = url;
        const proyecto = new Proyecto(this.urlImg, this.nombre, this.link, this.creacion, this.lenguajes, this.descripcion);
        this.proyectosS.save(proyecto).subscribe(
        data => {
          this.router.navigate(['']);
          this.cargarProyectos();
        }, err => {
          alert("Error al guardar proyecto");
          this.router.navigate(['']);
        }
      );
      this.onCloseModalCreate();
    })

    .catch((error) => {
      console.log(error);
      alert("Error al guardar proyecto");
      this.router.navigate(['']);
      this.onCloseModalCreate();
    });
} else {
  // Se ejecuta si no tiene img
    const proyecto = new Proyecto(this.urlImgEmpty, this.nombre, this.link, this.creacion, this.lenguajes, this.descripcion);
    this.proyectosS.save(proyecto).subscribe(
    data => {
      this.router.navigate(['']);
      this.cargarProyectos();
    }, err => {
      alert("Error al guardar proyecto");
      this.router.navigate(['']);
    }
  );
  this.onCloseModalCreate();
}
  }

  clearModalCreate(): void {
    this.captura = false;
    this.nombre = '';
    this.link = '';
    this.creacion = '';
    this.lenguajes = '';
    this.descripcion = '';

    document.getElementById('capturaProC').classList.remove('is-invalid');
    document.getElementById('nombreProC').classList.remove('is-invalid');
    document.getElementById('linkProC').classList.remove('is-invalid');
    document.getElementById('creacionProC').classList.remove('is-invalid');
    document.getElementById('lenguajesProC').classList.remove('is-invalid');
    document.getElementById('descripcionProC').classList.remove('is-invalid');
  }


  /****************************** MODAL EDITAR ******************************/

  openModalEdit(id?: number): void {
    this.id = id;
    this.proyectosS.details(id).subscribe(
      data => {
        this.proyectoE = data;

                // Verifica si el elemento tiene img o no 
                if (this.proyectoE.captura != this.urlImgEmpty) {
                  this.captura = true;
                } else {
                  this.captura = false;
                }

      }, err => {
        this.onCloseModalEdit();
        alert("Error al obtener proyecto");
        this.router.navigate(['']);
      }
    );
    this.displayEdit = 'block';
  }

  onCloseModalEdit(): void {
    this.displayEdit = 'none';
    this.changeImg = false;
  }

  onUpdate(): void {
// Se ejecuta si se cambió de img
    if (this.changeImg == true && this.captura == true) {
      const starsRef = ref(this.storage, 'imagenes/proyectos/captura_' + this.id);

      // Obtiene URL de nueva img y lo registra en el elemento
      getDownloadURL(starsRef)
        .then((url) => {
          this.urlImg = url;
          this.proyectoE.captura = this.urlImg;
          this.proyectosS.update(this.id, this.proyectoE).subscribe(
            data => {
              // Si tenía img la elimina de Firebase 
              if (this.captura == false) {
                const desertRef = ref(this.storage, 'imagenes/proyectos/captura_' + this.id);
                deleteObject(desertRef).then(() => {
                }).catch((error) => {
                  alert("Error al eliminar captura");
                  this.router.navigate(['']);
                });
              }
              this.router.navigate(['']);
              this.cargarProyectos();
            }, err => {
              alert("Error al editar proyecto");
              this.router.navigate(['']);
            }
          );
          this.onCloseModalEdit();
        })

        .catch((error) => {
          console.log(error);
          alert("Error al editar proyecto");
          this.router.navigate(['']);
          this.onCloseModalEdit();
        });
    } else {
      // Se ejecuta si no tiene img o no se cambió img
      if (this.captura == true){
        this.proyectoE.captura = this.proyectoE.captura;
      } else {
        this.proyectoE.captura = this.urlImgEmpty;
      }
      this.proyectosS.update(this.id, this.proyectoE).subscribe(
        data => {
          // Si tenía img la elimina de Firebase 
          if (this.captura == false && this.changeImg == true) {
            const desertRef = ref(this.storage, 'imagenes/proyectos/captura_' + this.id);
            deleteObject(desertRef).then(() => {
            }).catch((error) => {
              alert("Error al eliminar captura");
              this.router.navigate(['']);
            });
          }
          this.router.navigate(['']);
          this.cargarProyectos();
        }, err => {
          alert("Error al editar proyecto");
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
this.proyectosS.details(this.id).subscribe(
  data => {
    this.proyectoE = data;
    if (this.proyectoE.captura != this.urlImgEmpty) {
      const desertRef = ref(this.storage, 'imagenes/proyectos/captura_' + this.id);
      deleteObject(desertRef).then(() => {
      }).catch((error) => {
        alert("Error al eliminar captura");
      });
    }
  }, err => {
  }
);

// Elimina elemento 
    if (this.id != undefined) {
      this.proyectosS.delete(this.id).subscribe(
        data => {
          this.cargarProyectos();
        }, err => {
          alert("Error al eliminar proyecto");
        }
      )
    }
    this.onCloseModalDelete();
  }

  
    /****************************** FUNCIONES ******************************/

    uploadImage($event: any): void {
      const file = $event.target.files[0];
  
      // Si se crea elemento, toma el último ID de la lista y sube img
      if (this.displayCreate != 'none') {
        const name = "imagenes/proyectos/captura_" + (this.proyecto.slice(-1)[0].id + 1);
        const imgRef = ref(this.storage, name);
        uploadBytes(imgRef, file)
          .then(response => { })
          .catch(error => console.log(error)
          );
      }
  
      // Si se edita elemento, toma el ID correspondiente y sube img
      if (this.displayEdit != 'none') {
        const name = "imagenes/proyectos/captura_" + this.id;
        const imgRef = ref(this.storage, name);
        uploadBytes(imgRef, file)
          .then(response => { })
          .catch(error => console.log(error)
          );
      }
  
      // Captura img
      this.archivoCapturado = $event.target.files[0];
      this.extraerBase64(this.archivoCapturado).then((imagen: any) => {
        this.captura = true;
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
