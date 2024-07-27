// ** React Imports
import { createContext, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
// import axios from 'axios';

// ** Config
import authConfig from 'src/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';
import { USER_STATUS, USER_TYPE } from '@sandumo/utils';
import api from 'api-client';

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  googleAuth: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
  session?: UserDataType;
}

const AuthProvider = ({ children, session }: Props) => {
  // ** States
  const [user, _setUser] = useState<UserDataType | null>(session || defaultProvider.user);
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);

  // useEffect(() => {
  //   if (session && session.id) {
  //     setUser(session);
  //   } else {
  //     setUser(null);
  //   }
  // }, [session]);

  const setUser = (user: UserDataType | null) => {
    _setUser(user ? {
      ...user,
      selectedOrganizationsIds: user?.organizations.filter((org: any) => org.selected).map((org) => org.id),
    } : null);
    window.localStorage.setItem('userData', JSON.stringify(user));
  };

  // ** Hooks
  const router = useRouter();

  const handleAuthResponse = (data: any) => {
    window.localStorage.setItem(authConfig.storageTokenKeyName, data.accessToken);
    setUser({ ...data.userData });
    window.localStorage.setItem('userData', JSON.stringify(data.userData));

    return data;
  };

  // useEffect(() => {
  //   const initAuth = async (): Promise<void> => {
  //     const userData = window.localStorage.getItem('userData');
  //     if (userData) {
  //       setUser(JSON.parse(userData));
  //     }

  //     const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!;

  //     if (storedToken) {
  //       setLoading(true);
  //       await axios
  //         .get(authConfig.meEndpoint, {
  //           headers: {
  //             Authorization: storedToken,
  //           },
  //         })
  //         .then(async response => {
  //           setLoading(false);
  //           const userDataJson = window.localStorage.getItem('userData');
  //           const user = userDataJson ? JSON.parse(userDataJson) : null;

  //           // setUser({ ...response.data.userData, selectedOrganization: user?.selectedOrganization || response.data.userData.selectedOrganization });
  //           setUser({
  //             ...response.data.userData,
  //             organizations:
  //               user?.organizations.length
  //                 ? response.data.userData.organizations.map((org: any) => ({ ...org, selected: user.organizations.find((_: any) => _.id === org.id)?.selected || false }))
  //                 : response.data.userData.organizations,
  //             selectedOrganizationsIds: user?.selectedOrganizationsIds || response.data.userData.selectedOrganizationsIds,
  //             selectedOrganization: user?.selectedOrganization || response.data.userData.selectedOrganization,
  //           });
  //           window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken);
  //         })
  //         .catch((err) => {
  //           if (err.status === 401) {
  //             localStorage.removeItem('userData');
  //             localStorage.removeItem('refreshToken');
  //             localStorage.removeItem('accessToken');
  //             setUser(null);
  //             setLoading(false);
  //             if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
  //               router.replace('/login');
  //             }
  //           }
  //         });
  //     } else {
  //       setLoading(false);
  //     }
  //   };

  //   initAuth();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    api.axios
      .post('/auth/login', params)
      .then(({ data }) => handleAuthResponse(data))
      .then((data) => {
        switch (data.userData.status) {
        case USER_STATUS.JUST_REGISTERED: router.push('/auth/choose-user-type/'); break;

        // case USER
        default:
          if (data.userData.type === USER_TYPE.EMPLOYER) router.push('/employer');
          else if (data.userData.type = USER_TYPE.ADMIN) router.push('/admin');
          else router.push('/employee');
          break;
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null));
  };

  const handleLogout = async () => {
    setUser(null);
    window.localStorage.removeItem('userData');
    window.localStorage.removeItem(authConfig.storageTokenKeyName);
    await api.axios.post('/auth/logout');
    router.push('/auth/login');
  };

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    api.axios
      .post(authConfig.registerEndpoint, params)
      .then(response => {
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken);
        const returnUrl = router.query.returnUrl;

        setUser({ ...response.data.userData });
        window.localStorage.setItem('userData', JSON.stringify(response.data.userData));

        const redirectURL = returnUrl ? returnUrl : params.isOrganization ? '/employer' : '/employee';

        router.replace(redirectURL as string);
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null));
  };

  /**
   * Google Authentication (Login/Register)
   */
  const handleGoogleAuth = ({ idToken, isOrganization }: { idToken: any, isOrganization: boolean }, errorCallback?: ErrCallbackType) => {
    api.axios
      .post('/auth/google', { token: idToken.credential, isOrganization })
      .then(({ data }) => {
        handleAuthResponse(data);

        const returnUrl = router.query.returnUrl;
        let redirectURL = returnUrl ? returnUrl : data.userData.type === 'employer' ? '/employer' : '/employee';

        if (data.shouldCompleteOrganizationRegistration) {
          redirectURL = '/dashboard/complete-organization-registration';
        } else if (data.shouldCompleteUserRegistration) {
          redirectURL = '/profile/complete-registration';
        }

        router.replace(redirectURL as string);
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null));
  };

  /**
   * Refresh userData
   */
  const handleRefresh = async (errorCallback?: ErrCallbackType) => {
    api.axios
      .get('/auth/me')
      .then(({ data }) => handleAuthResponse(data))
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null));
  };

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    googleAuth: handleGoogleAuth,
    logout: handleLogout,
    register: handleRegister,
    refresh: handleRefresh,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
