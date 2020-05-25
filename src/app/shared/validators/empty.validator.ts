import { AbstractControl } from '@angular/forms';

export function ValidateNotEmpty(control: AbstractControl): { [key: string]: any } | null {
  return (control.value && control.value!=="") ? null : { empty: { valid: false, value: control.value }
}
}
