
import ApiDocumentation from '@/components/ApiDocumentation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <ApiDocumentation />
      <Footer />
    </div>
  );
};

export default ApiDocs;
