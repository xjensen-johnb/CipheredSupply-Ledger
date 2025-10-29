import { Upload, Lock, CheckCircle, FileText } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Documents',
    description: 'Submit your orders, invoices, and supply chain documents to our platform.',
    color: 'bg-blue-500',
  },
  {
    icon: Lock,
    title: 'FHE Encryption',
    description: 'Documents are encrypted using ZAMA\'s fully homomorphic encryption technology.',
    color: 'bg-green-500',
  },
  {
    icon: CheckCircle,
    title: 'On-Chain Storage',
    description: 'Encrypted data is securely stored on blockchain with immutable records.',
    color: 'bg-cyan-500',
  },
  {
    icon: FileText,
    title: 'Authorized Access',
    description: 'Only authorized parties can decrypt and verify specific information.',
    color: 'bg-emerald-500',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4">
            HOW IT WORKS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Simple Workflow with Military-Grade Encryption
          </h2>
          <p className="text-lg text-muted-foreground">
            Four easy steps to secure your supply chain data
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-32 left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-200 via-green-200 to-emerald-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center space-y-6">
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-white shadow-lg z-10">
                  {index + 1}
                </div>

                {/* Icon Container */}
                <div className={`w-28 h-28 rounded-2xl ${step.color} flex items-center justify-center relative group hover:scale-105 transition-all duration-300 shadow-xl mt-8`}>
                  <step.icon className="w-14 h-14 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
