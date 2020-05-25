import { AbstractControl } from '@angular/forms';

export function ValidateWhiteSpace(control: AbstractControl): { [key: string]: any } | null {
  var regex = RegExp(/\s/,'g');
  console.log()
  return (control.value!==null && !regex.test(control.value)) ? null : { whitespace: { valid: false, value: control.value }
}
}
