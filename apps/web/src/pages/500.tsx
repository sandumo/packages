import { ErrorLayout } from '@layouts';
import { ReactNode } from 'react';

const Page = () => {
  return '500';
};

Page.getLayout = (page: ReactNode) => <ErrorLayout>{page}</ErrorLayout>;

export default Page;
