import { NextRequest, NextResponse } from 'next/server';
import { Environment } from './configs/env';
import { USER_STATUS, USER_TYPE } from '@sandumo/utils';

export async function middleware(request: NextRequest) {
  return NextResponse.next();

  const res = await fetch(Environment.INTERNAL_API_URL + '/auth/me', { headers: { cookie: `accessToken=${request.cookies.get('accessToken')?.value}` } });

  if (res.status === 200) {
    const data = await res.json();

    if (request.nextUrl.pathname.startsWith('/auth/login')) {
      // if a user just registered without choosing it's type then redirect him to choose user type page
      if (data.userData.status === USER_STATUS.JUST_REGISTERED) {
        return NextResponse.redirect(new URL('/auth/choose-user-type', request.url));
      }

      // if a user just chose it's type then redirect him to fill company info page if it's an employer or to employee dashboard if it's an employee
      if (data.userData.status === USER_STATUS.CHOOSED_USER_TYPE) {
        return NextResponse.redirect(new URL(data.userData.type === USER_TYPE.EMPLOYER ? '/auth/fill-company-info/' : '/employee/', request.url));
      }

      return NextResponse.redirect(new URL(data.userData.type === USER_TYPE.ADMIN ? '/admin/' : data.userData.type === USER_TYPE.EMPLOYER ? '/employer/' : '/employee/', request.url));
    }

    // restrict access to admin dashboard dashboard for non-admin users
    if (data.userData.type !== USER_TYPE.ADMIN && request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/403';

      return NextResponse.rewrite(url);
    }

    // restrict access to employer dashboard for non-employer users
    if (request.nextUrl.pathname.startsWith('/employer') && ![USER_TYPE.EMPLOYER, USER_TYPE.ADMIN].includes(data.userData.type)) {
      const url = request.nextUrl.clone();
      url.pathname = '/403';

      return NextResponse.rewrite(url);
    }

    // restrict access to employee dashboard for non-employee users
    if (request.nextUrl.pathname.startsWith('/employee') && ![USER_TYPE.EMPLOYEE, USER_TYPE.ADMIN].includes(data.userData.type)) {
      const url = request.nextUrl.clone();
      url.pathname = '/403';

      return NextResponse.rewrite(url);
    }

    // enforce complete registration for employers that are trying to access dashboard
    // if (data.userData.type === 'employer' && !data.userData.selectedOrganization && request.nextUrl.pathname.startsWith('/dashboard') && !request.nextUrl.pathname.startsWith('/dashboard/complete-organization-registration')) {
    //   return NextResponse.redirect(new URL('/dashboard/complete-organization-registration', request.url));
    // }

    // enforce complete registration for employees that are trying to access profile
    // if (data.userData.type === 'employee' && !data.userData.phoneNumber && request.nextUrl.pathname.startsWith('/profile') && !request.nextUrl.pathname.startsWith('/profile/complete-registration')) {
    //   return NextResponse.redirect(new URL('/profile/complete-registration', request.url));
    // }

    // if (data.userData.type === 'employer' && request.nextUrl.pathname.startsWith('/profile')) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = '/403';

    //   return NextResponse.rewrite(url);
    // }

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('x-session', JSON.stringify(data.userData));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (request.nextUrl.pathname.startsWith('/employer') || request.nextUrl.pathname.startsWith('/employee')) {
    return NextResponse.redirect(new URL(`/auth/login?returnUrl=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|images|locales|favicon.ico|.*\.svg).*)',
  ],
};
