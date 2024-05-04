import LeftMenu from './LeftMenu';
import AppBar from './AppBar';
import BaseDashboardLayout, { BaseDashboardLayoutProps } from '@layouts/base/BaseDashboardLayout';

type EmployeeLayoutProps = Omit<BaseDashboardLayoutProps, 'appBar' | 'leftMenu'>;

export default function EmployeeLayout(props: EmployeeLayoutProps) {
  return (
    <BaseDashboardLayout
      appBar={<AppBar title={props.title} />}
      leftMenu={<LeftMenu />}
      {...props}
    />
  );
}
