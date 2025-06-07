import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'quarter'
})
export class QuarterPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const year = date.getFullYear();
    return `Q${quarter} ${year}`;
  }
}
