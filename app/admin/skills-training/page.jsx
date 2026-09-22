import React from 'react';
import { getLatestSkillsTrainingParticipants } from '../../../lib/googleSheets';
import SkillsTrainingAdminGrid from '../../../components/SkillsTrainingAdminGrid';

export const dynamic = 'force-dynamic';

export default async function SkillsTrainingAdminPage() {
  const participants = await getLatestSkillsTrainingParticipants();
  return <SkillsTrainingAdminGrid initialParticipants={participants} />;
}
