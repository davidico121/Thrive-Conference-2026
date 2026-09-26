import { redirect } from 'next/navigation';
import { getPortalUser } from '../../../lib/portalSession.js';
import ChangePasswordForm from '../../../components/portal/ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const user = await getPortalUser();
  if (!user) redirect('/portal/login');
  return <ChangePasswordForm forced={user.must_change_password} home={user.role === 'tutor' ? '/portal/tutor' : '/portal'} />;
}
