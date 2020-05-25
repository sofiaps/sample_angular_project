
import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskFilter'
})

export class TaskFilterPipe implements PipeTransform {

  transform(array: any[], query: any, searchBy: string = undefined): any {
    if (query) {
      if (searchBy != undefined) {
        switch (searchBy) {
          case ('name'):
            if (JSON.stringify(array).indexOf("name") > -1) {

              return _.filter(array, row => row.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
            }
            break;
            case ('assigned'):
              if (JSON.stringify(array).indexOf("assigned") > -1) {
                return _.filter(array, row => row.assigned && row.assigned.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
              }
              break;
            case ('due'):
              if (JSON.stringify(array).indexOf("due") > -1) {
                let year = String(query.year);
                let month = query.month <10 ? "0" + String(query.month) : String(query.month);
                let day = query.day <10 ? "0" + String(query.day) : String(query.day);
                let date = year+"-"+month+"-"+day;
                return _.filter(array, row => row.due != undefined && row.due.indexOf(date) > -1);
              }
              break;
            case ('created_at'):
              if (JSON.stringify(array).indexOf("due") > -1) {
                let year = String(query.year);
                let month = query.month <10 ? "0" + String(query.month) : String(query.month);
                let day = query.day <10 ? "0" + String(query.day) : String(query.day);
                let date = year+"-"+month+"-"+day;
                return _.filter(array, row => row.created_at.indexOf(date) > -1);
              }
              break;
          case ('list'):
            if (JSON.stringify(array).indexOf("list") > -1) {
              return _.filter(array, row => row.list.toLowerCase().indexOf(query.toLowerCase()) > -1);
            }
            break;
          case ('labels'):
            if (JSON.stringify(array).indexOf("labels") > -1) {
              return _.filter(array, row => row.labels && row.labels.some(e=>query.includes(e['name'])));
            }
            break;
          case ('size'):
            if (JSON.stringify(array).indexOf("size") > -1) {
              return _.filter(array, row => String(row.size).indexOf(query) > -1 || row.size.indexOf(query.toUpperCase())>-1
              || row.size.indexOf(query.toLowerCase()) > -1 || row.size.indexOf(this.ucFirst(query)) > -1 ||
              row.size.indexOf(this.lcFirst(query)) > -1);
            }
            break;
          case ('lastModified'):
            if (JSON.stringify(array).indexOf("lastModified") > -1) {
              return _.filter(array, row => row.type.indexOf(query) > -1);
            }
            break;
          case ('update_time'):
            if (JSON.stringify(array).indexOf("update_time") > -1) {
              return _.filter(array, row => row.type.indexOf(query) > -1);
            }
          break;

        }
      }
    }
    return array;
  }

  private ucFirst(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1);
  }

  private lcFirst(string) {
    return string.substring(0, 1).toLowerCase() + string.substring(1);
  }
}
