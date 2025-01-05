'use client';

import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
  index: number;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  details,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <motion.div
              className="p-2 rounded-lg bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base mb-4">
            {description}
          </CardDescription>
          <motion.ul 
            className="space-y-2"
            initial="hidden"
            whileHover="visible"
            animate="visible"
          >
            {details.map((detail, idx) => (
              <motion.li
                key={idx}
                className="flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: idx * 0.1,
                    },
                  },
                }}
              >
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  whileHover={{ scale: 1.5 }}
                />
                <span className="text-sm">{detail}</span>
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
