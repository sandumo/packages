import { Injectable } from '@nestjs/common';
// import {
//   defaultRandomNumberServiceOptions,
//   RandomNumberServiceOptions,
// } from './random-number-service-options';

import OpenAI, { ClientOptions } from 'openai';

@Injectable()
export class OpenAIService extends OpenAI {
  // private options: OpenAIServiceOptions;

  constructor(options: ClientOptions) {
    super(options);

    // this.options = Object.assign(
    //   {},
    //   // defaultOpenAIServiceOptions,
    //   options,
    // );
  }

  // generate(): number {
  //   // const range = this.options.max - this.options.min;
  //   // return this.options.min + Math.floor(Math.random() * range);

  //   return 1;
  // }
}
