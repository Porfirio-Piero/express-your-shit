import Header from '../components/Header';
import Footer from '../components/Footer';
import SecretForm from '../components/SecretForm';

export const metadata = {
  title: 'Create Secret - SecretDrop',
  description: 'Create a self-destructing secret with end-to-end encryption',
};

export default function CreatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <SecretForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}