import { ErrorLayout } from '@layouts';
import { ReactNode } from 'react';

const Page = () => {
  return '403';
};

Page.getLayout = (page: ReactNode) => <ErrorLayout>{page}</ErrorLayout>;

export default Page;
