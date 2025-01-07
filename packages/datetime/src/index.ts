import dayjs from 'dayjs';

type DatetimeInput = string | number | Date | dayjs.Dayjs | null | undefined;

export class Datetime {
  private datetime: dayjs.Dayjs;

  constructor(datetime: DatetimeInput) {
    this.datetime = dayjs(datetime);
  }

  toDateFormat(): string {
    return this.datetime.format('YYYY-MM-DD');
  }

  toDatetimeFormat(): string {
    return this.datetime.format('YYYY-MM-DD HH:mm:ss');
  }

  isBetween(start: DatetimeInput, end: DatetimeInput): boolean {
    if (this.datetime.isBefore(start)) {
      return false;
    }

    if (this.datetime.isAfter(end)) {
      return false;
    }

    return true;
  }

  diff(datetime: DatetimeInput | Datetime, unit: dayjs.UnitType = 'day'): number {
    if (datetime instanceof Datetime) {
      datetime = datetime.datetime;
    }

    return this.datetime.diff(datetime, unit);
  }

  format(format: string): string {
    return this.datetime.format(format);
  }

  subtract(value: number, unit: dayjs.ManipulateType): Datetime {
    return new Datetime(this.datetime.subtract(value, unit));
  }

  add(value: number, unit: dayjs.ManipulateType): Datetime {
    return new Datetime(this.datetime.add(value, unit));
  }

  startOf(unit: dayjs.OpUnitType): Datetime {
    return new Datetime(this.datetime.startOf(unit));
  }

  startOfWeek(): Datetime {
    let datetime = this.datetime;

    while (datetime.format('ddd') !== 'Mon') {
      datetime = datetime.subtract(1, 'day');
    }

    return new Datetime(datetime);
  }

  toString(): string {
    return this.datetime.toString();
  }

  timeFrom<T extends 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'>(datetime?: DatetimeInput | Datetime): [value: number, unit: T] {
    let datetimeFrom = dayjs();

    if (datetime) {
      if (datetime instanceof Datetime) {
        datetimeFrom = datetime.datetime;
      } else {
        datetimeFrom = dayjs(datetime);
      }
    }

    let value = datetimeFrom.diff(this.datetime, 'second');
    let unit: T = 'second' + (value === 1 ? '' : 's') as T;

    if (value > 60) {
      value = datetimeFrom.diff(this.datetime, 'minute');
      unit = 'minute' + (value === 1 ? '' : 's') as T;

      if (value > 60) {
        value = datetimeFrom.diff(this.datetime, 'hour');
        unit = 'hour' + (value === 1 ? '' : 's') as T;

        if (value > 24) {
          value = datetimeFrom.diff(this.datetime, 'day');
          unit = 'day' + (value === 1 ? '' : 's') as T;

          if (value > 30) {
            value = datetimeFrom.diff(this.datetime, 'month');
            unit = 'month' + (value === 1 ? '' : 's') as T;

            if (value > 12) {
              value = datetimeFrom.diff(this.datetime, 'year');
              unit = 'year' + (value === 1 ? '' : 's') as T;
            }
          }
        }
      }
    }

    return [value, unit];
  }
}

export default function datetime(datetime?: DatetimeInput): Datetime {
  return new Datetime(datetime);
}
