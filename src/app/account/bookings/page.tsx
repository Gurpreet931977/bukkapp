import { redirect } from 'next/navigation';

export default function AccountBookingsRedirect() {
  redirect('/account?tab=upcoming');
}
