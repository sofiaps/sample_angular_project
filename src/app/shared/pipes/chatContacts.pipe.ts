
import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatContacts'
})

export class ChatContactsPipe implements PipeTransform {
  transform(value, args?): Array<any> {
    let searchText = new RegExp(args.trim(), 'ig');

    if (value) {
      let array = value.filter(entry => {
        if(entry.name){
          if(((entry.name).trim()).search(searchText) !== -1){
            return true;
          }
        }
      });

      return array;
    }
  }
}
