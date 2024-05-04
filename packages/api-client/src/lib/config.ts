class Config {
  _queryClient: any;

  get queryClient(): any {
    return this._queryClient;
  }

  set queryClient(queryClient: any) {
    this._queryClient = queryClient;
  }
}

export const config = new Config();
