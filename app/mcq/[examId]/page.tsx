import { redirect } from 'next/navigation';

interface MCQExamDetailPageProps {
  params: Promise<{ examId: string }>;
}

export default async function MCQExamDetailPage({ params }: MCQExamDetailPageProps) {
  const resolvedParams = await params;
  redirect(`/exam/${resolvedParams.examId}/instructions`);
}

