import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})

export class FilterPipe implements PipeTransform {

  transform(hys: any[], filter: any): any {
    if (!hys || !filter) {
        return hys;
    }
    return hys.filter(hys => hys.seccion.indexOf(filter) !== -1);
}

}
