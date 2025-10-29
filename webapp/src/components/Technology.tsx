import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Database, Shield, Boxes } from 'lucide-react';

export const Technology = () => {
  return (
    <section id="technology" className="py-24 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            TECHNOLOGY
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powered by ZAMA FHE
          </h2>
          <p className="text-lg text-muted-foreground">
            Leveraging fully homomorphic encryption for unprecedented privacy
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="border-2 border-border bg-white shadow-xl">
            <CardContent className="p-10 space-y-10">
              {/* Main Description */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">ZAMA Fully Homomorphic Encryption</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our platform utilizes ZAMA's groundbreaking FHE technology, enabling computations on encrypted data 
                  without ever decrypting it. This means your sensitive supply chain information remains private at all 
                  times, even during processing and verification.
                </p>
              </div>

              {/* Tech Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                <div className="space-y-4 p-6 rounded-xl bg-blue-50 border-2 border-blue-100">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Zero Knowledge</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify information without revealing underlying data
                  </p>
                </div>

                <div className="space-y-4 p-6 rounded-xl bg-green-50 border-2 border-green-100">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Encrypted Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    All data remains encrypted on-chain at rest and in transit
                  </p>
                </div>

                <div className="space-y-4 p-6 rounded-xl bg-cyan-50 border-2 border-cyan-100">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center">
                    <Boxes className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Smart Contracts</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated workflows with encrypted business logic
                  </p>
                </div>
              </div>

              {/* Learn More Link */}
              <div className="pt-6 border-t-2 border-border">
                <a 
                  href="https://www.zama.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold text-lg"
                >
                  Learn more about ZAMA FHE Technology
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Technology;
