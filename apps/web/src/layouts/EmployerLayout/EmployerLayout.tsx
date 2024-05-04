import LeftMenu from './LeftMenu';
import AppBar from './AppBar';
import BaseDashboardLayout, { BaseDashboardLayoutProps } from '@layouts/base/BaseDashboardLayout';

type EmployerLayoutProps = Omit<BaseDashboardLayoutProps, 'appBar' | 'leftMenu'>;

export default function EmployerLayout(props: EmployerLayoutProps) {
  return (
    <BaseDashboardLayout
      appBar={<AppBar title={props.title} />}
      leftMenu={<LeftMenu />}
      {...props}
    />
  );
}
