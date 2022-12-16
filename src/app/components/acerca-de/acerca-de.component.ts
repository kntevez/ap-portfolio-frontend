import { Component, OnInit } from '@angular/core';
import { Storage, ref, getDownloadURL, deleteObject, uploadBytes } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { AcercaDe } from 'src/app/model/acerca-de';
import { AcercaDeService } from 'src/app/service/acerca-de.service';
import { TokenService } from 'src/app/service/token.service';

import { } from '@angular/fire/storage';

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.component.html',
  styleUrls: ['./acerca-de.component.css']
})

export class AcercaDeComponent implements OnInit {
  acercaDe: AcercaDe[] = [];
  acercaDeE: AcercaDe = null;
  displayEdit = 'none';
  id: number;

  constructor(private acercaDeS: AcercaDeService, private tokenService: TokenService, private router: Router, private storage: Storage) { }

  isLogged = false;

  img = false;
  changeImg = false;
  urlImgEmpty = "https://firebasestorage.googleapis.com/v0/b/portfolio-knt.appspot.com/o/imagenes%2FfotoEmpty.png?alt=media&token=65dd1dee-9d65-4dbd-8033-99757e99d4db";
  urlImg: string;
  previsualizacion: string;
  archivoCapturado: any;

  ngOnInit(): void {
    this.cargarAcercaDe();
    if (this.tokenService.getToken()) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }
  }

  cargarAcercaDe(): void {
    this.acercaDeS.lista().subscribe(
      data => {
        this.acercaDe = data;
      }
    );
  }

  openModalEdit(id?: number): void {
    this.id = id;

    this.acercaDeS.detail(id).subscribe(
      data => {
        this.acercaDeE = data;

        // Verifica si el elemento tiene img o no 
        if (this.acercaDeE.foto != this.urlImgEmpty) {
          this.img = true;
        } else {
          this.img = false;
        }
      }, err => {
        this.onCloseModalEdit();
        alert("Error al obtener información");
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
    if (this.changeImg == true && this.img == true) {
      const starsRef = ref(this.storage, 'imagenes/acercaDe/foto_' + this.id);

      // Obtiene URL de nueva img y lo registra en el elemento
      getDownloadURL(starsRef)
        .then((url) => {
          this.urlImg = url;
          this.acercaDeE.foto = this.urlImg;
          this.acercaDeS.update(this.id, this.acercaDeE).subscribe(
            data => {
              // Si tenía img la elimina de Firebase 
              if (this.img == false) {
                const desertRef = ref(this.storage, 'imagenes/acercaDe/foto_' + this.id);
                deleteObject(desertRef).then(() => {
                }).catch((error) => {
                  alert("Error al editar información");
                  this.router.navigate(['']);
                });
              }
              this.router.navigate(['']);
              this.cargarAcercaDe();
            }, err => {
              alert("Error al editar información");
              this.router.navigate(['']);
            }
          );
          this.onCloseModalEdit();
        })

        .catch((error) => {
          console.log(error);
          alert("Error al editar información");
          this.router.navigate(['']);
          this.onCloseModalEdit();
        });
    } else {
      // Se ejecuta si no tiene img o no se cambió img
      if (this.img == true){
        this.acercaDeE.foto = this.acercaDeE.foto;
      } else {
        this.acercaDeE.foto = this.urlImgEmpty;
      }
      this.acercaDeS.update(this.id, this.acercaDeE).subscribe(
        data => {
          // Si tenía img la elimina de Firebase 
          if (this.img == false && this.changeImg == true) {
            const desertRef = ref(this.storage, 'imagenes/acercaDe/foto_' + this.id);
            deleteObject(desertRef).then(() => {
            }).catch((error) => {
              alert("Error al editar información");
              this.router.navigate(['']);
            });
          }
          this.router.navigate(['']);
          this.cargarAcercaDe();
        }, err => {
          alert("Error al editar información");
          this.router.navigate(['']);
        }
      );
      this.onCloseModalEdit();
    }
  }

  delete(id?: number): void {
    // Verifica si tiene img y la elimina de Firebase
    this.acercaDeS.detail(this.id).subscribe(
      data => {
        this.acercaDeE = data;
        if (this.acercaDeE.foto != this.urlImgEmpty) {
          const desertRef = ref(this.storage, 'imagenes/acercaDe/foto_' + this.id);
          deleteObject(desertRef).then(() => {
          }).catch((error) => {
            alert("Error al eliminar información");
          });
        }
      }, err => {
      }
    );

    // Elimina elemento 
    if (id != undefined) {
      this.acercaDeS.delete(id).subscribe(
        data => {
          this.cargarAcercaDe();
        }, err => {
          alert("Error al eliminar información");
        }
      );
    }
  }

  uploadImage($event: any): void {
    // Si se edita elemento, toma el ID correspondiente y sube img
    const file = $event.target.files[0];
    const name = "imagenes/acercaDe/foto_" + this.id;
    const imgRef = ref(this.storage, name);
    uploadBytes(imgRef, file)
      .then(response => { })
      .catch(error => console.log(error)
      );

    // Captura img
    this.archivoCapturado = $event.target.files[0];
    this.extraerBase64(this.archivoCapturado).then((imagen: any) => {
      this.img = true;
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