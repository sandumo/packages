import BaseDashboardLayout, { BaseDashboardLayoutProps } from '@layouts/base/BaseDashboardLayout';
import LeftMenu from './LeftMenu';

type AdminLayoutProps = Omit<BaseDashboardLayoutProps, 'leftMenu' | 'appBar'>;

export default function AdminLayout(props: AdminLayoutProps) {
  return (
    <BaseDashboardLayout

      // appBar={<AppBar title={props.title} />}
      leftMenu={<LeftMenu />}
      {...props}
    />
  );
}
