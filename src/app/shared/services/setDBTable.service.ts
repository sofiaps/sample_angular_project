import { Injectable } from "@angular/core";
import { ApiClientService } from './ApiClient.service';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: "root"
})
export class SetDBTableService {
  public table: any=[];
  public keys: any=[];
  public columns: any={};
  constructor(private ApiClientService: ApiClientService) {
  }

  async setTable(table) {
    this.table=table;
  }

  async setKeys(keys) {
    this.keys=keys;
  }

  async setColumns(columns) {
    this.columns=columns;
  }

  getTable(){
    return this.table;
  }

  getKeys(){
    return this.keys;
  }

  getColumns(){
    return this.columns;
  }
}
