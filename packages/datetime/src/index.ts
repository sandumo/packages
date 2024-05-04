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
}

export default function datetime(datetime?: DatetimeInput): Datetime {
  return new Datetime(datetime);
}
