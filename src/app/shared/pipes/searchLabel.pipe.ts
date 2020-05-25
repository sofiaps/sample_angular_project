import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SearchLabel'
})

export class SearchLabelPipe implements PipeTransform {
  transform(value, labelsArray, args?): Array<any> {
    let searchText = new RegExp((args.replace(/\s\s+/g, ' ')).trim(), 'ig');

    if (value) {
      let array = value.filter(entry => {
        if(entry.name){
          if(((entry.name.replace(/\s\s+/g, ' ')).trim()).search(searchText) !== -1
          && !labelsArray.some(e=>(e['name'].replace(/\s\s+/g, ' ')).trim()==(entry['name'].replace(/\s\s+/g, ' ')).trim())){
            return true;
          }
        }
      });

      if(args!=='' && !labelsArray.some(e=>(e['name'].replace(/\s\s+/g, ' ')).trim()==(args.replace(/\s\s+/g, ' ')).trim())
      && !array.some(e=>(e['name'].replace(/\s\s+/g, ' ')).trim()==(args.replace(/\s\s+/g, ' ')).trim())){
        let tmp = {};
        tmp['name'] = (args.replace(/\s\s+/g, ' ')).trim();
        array.unshift(tmp);
      }

      return array;
    }
  }
}
