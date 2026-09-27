import React from 'react';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/adminSession';
import { getLatestSkillsTrainingParticipants } from '../../../lib/googleSheets';
import SkillsTrainingAdminGrid from '../../../components/SkillsTrainingAdminGrid';

export const dynamic = 'force-dynamic';

export default async function SkillsTrainingAdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const participants = await getLatestSkillsTrainingParticipants();
  return <SkillsTrainingAdminGrid initialParticipants={participants} />;
}
