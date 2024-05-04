export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  isOrganization: boolean;

  // employer fields
  organizationName?: string;
  organizationIDNO?: string;
  fullname?: string;

  // employee fields
  firstname?: string;
  lastname?: string;
  idnp?: string;

  // common fields
  email: string;
  phoneNumber: string;
  password: string;
}

export type UserDataType = {
  id: number;

  role: string;
  email: string;
  displayName: string;
  firstname: string;
  lastname: string;
  type: string;
  phoneNumber: string;

  // password: string
  avatarUrl: string
  organizations: any[]
  selectedOrganization?: any
  selectedOrganizationsIds?: number[]
  employeeStatus: boolean
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  googleAuth: (idToken: any, errorCallback?: ErrCallbackType) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void
  refresh: (errorCallback?: ErrCallbackType) => Promise<void>
}
