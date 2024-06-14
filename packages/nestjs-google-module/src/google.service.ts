import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  GoogleAuth,
  JSONClient,
} from 'google-auth-library/build/src/auth/googleauth';
import { google } from 'googleapis';

@Injectable()
export class GoogleService implements OnModuleInit {
  private client: GoogleAuth<JSONClient>;

  constructor() {
    this.client = null as any;
  }

  async onModuleInit() {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.client = (await auth.getClient()) as unknown as GoogleAuth<JSONClient>;
  }

  get sheets() {
    return google.sheets({ version: 'v4', auth: this.client });
  }

  get drive() {
    return google.drive({ version: 'v3', auth: this.client });
  }
}
