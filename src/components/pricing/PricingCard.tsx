import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted,
}: PricingCardProps) {
  return (
    <Card className={`relative flex flex-col p-6 ${
      highlighted ? 'border-primary shadow-lg' : ''
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          Most Popular
        </div>
      )}
      
      <div className="mb-5">
        <h3 className="text-2xl font-bold">{name}</h3>
        <div className="mt-2 flex items-baseline gap-x-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          {period && (
            <span className="text-sm font-semibold leading-6 text-muted-foreground">
              {period}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2 flex-1">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Button
          asChild
          className="w-full"
          variant={highlighted ? "default" : "outline"}
        >
          <Link href={price === "Custom" ? "/demo" : "/signup"}>
            {price === "Custom" ? "Contact Sales" : "Get Started"}
          </Link>
        </Button>
        {price !== "Custom" && (
          <Button
            asChild
            variant="ghost"
            className="w-full"
          >
            <Link href="/demo">Book a Demo</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
