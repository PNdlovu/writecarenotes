import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ModuleHeroProps {
  title: string;
  description: string;
}

export function ModuleHero({ title, description }: ModuleHeroProps) {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
      </motion.div>
      
      <motion.p
        className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <Button asChild size="lg">
          <Link href="/demo">Request a Demo</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/features">View All Features</Link>
        </Button>
      </motion.div>
    </div>
  );
}
