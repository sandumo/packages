import { USER_STATUS } from 'utils';

export type PartialUserData = {
  email: string;
  firstname: string;
  lastname: string;
  displayName: string;
  type: 'employee' | 'employer';
  status: keyof typeof USER_STATUS;
  phoneNumber: string;
  birthdate: string;
  gender: string;
  location: string;
};

export type UserData = PartialUserData & {
  id: number;
  role: string;
  avatarUrl: string;
  organizations: Record<string, any>[];
  selectedOrganization: Record<string, any>;
  selectedOrganizationsIds: number[];
  employeeStatus: boolean;
};

export type UserAuthData = {
  accessToken: string;
  userData: UserData;
  isNewRecord?: boolean;
};
