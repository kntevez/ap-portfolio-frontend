import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, list, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})

export class ImageService {

  url: string = "";

  constructor(private storage: Storage) { }

  uploadImage($event: any, name: string): void{
    const file = $event.target.files[0];
    const imgRef = ref(this.storage, name);
    uploadBytes(imgRef, file)
    .then(response => {})
    .catch(error => console.log(error)
    );
  }

  getImages(){
    const imagesRef = ref(this.storage, 'imagen');
    list(imagesRef)
    .then(async response => {
      for(let item of response.items){
        this.url = await getDownloadURL(item);
      }
    })
    .catch(error => console.log(error)
    );
  }
}