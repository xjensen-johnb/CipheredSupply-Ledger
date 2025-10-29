import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Zap, FileCheck, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Full Privacy Protection',
    description: 'Orders and invoices remain encrypted on-chain using ZAMA FHE technology, ensuring complete confidentiality.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Homomorphic Encryption',
    description: 'Perform computations on encrypted data without ever decrypting it, maintaining privacy at all times.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: FileCheck,
    title: 'Immutable Records',
    description: 'All transactions are recorded on blockchain, providing tamper-proof audit trails for compliance.',
    gradient: 'from-blue-600 to-indigo-500',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Real-time verification of encrypted documents without compromising sensitive business information.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Multi-Party Access',
    description: 'Controlled access to encrypted data ensures only authorized parties can view specific information.',
    gradient: 'from-teal-500 to-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Solution',
    description: 'Built to handle enterprise-level supply chain operations with optimal performance.',
    gradient: 'from-emerald-500 to-green-600',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            FEATURES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Enterprise-Grade Privacy Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Built with cutting-edge cryptography to protect your most sensitive business data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-2 border-border bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-8 space-y-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
