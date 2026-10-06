import AppMasterShell from '../../../components/AppMasterShell';

interface MCQExamDetailPageProps {
  params: Promise<{ examId: string }>;
}

export default async function MCQExamDetailPage({ params }: MCQExamDetailPageProps) {
  const resolvedParams = await params;
  return <AppMasterShell initialTab="mcq" initialExamId={resolvedParams.examId} />;
}
