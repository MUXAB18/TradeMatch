import { redirect } from 'next/navigation';

// Interview prep is a single flashcard flow — redirect to main prep page
export default function PrepDetailPage() {
  redirect('/prep');
}
