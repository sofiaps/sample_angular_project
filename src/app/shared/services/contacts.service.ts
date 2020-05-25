import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ContactsService {
  public contacts = new Array();
  public contactsRooms = {};
  public sum = {};

  constructor() {

  }

  setNewContact(contact) {
    this.contacts.push(contact);
  }

  getContacts(){
    return this.contacts;
  }
}
