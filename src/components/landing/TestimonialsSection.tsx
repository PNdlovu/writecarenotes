const testimonials = [
  {
    body: "This platform has transformed how we manage our care home. The efficiency gains have been remarkable, and our staff love using it.",
    author: {
      name: "Sarah Thompson",
      role: "Care Home Manager",
      facility: "Sunrise Care Home",
    },
  },
  {
    body: "The compliance features alone have saved us countless hours. It's like having an extra team member dedicated to keeping us up to date.",
    author: {
      name: "James Wilson",
      role: "Operations Director",
      facility: "Golden Years Group",
    },
  },
  {
    body: "Our residents' families appreciate the transparency and communication features. It gives them peace of mind knowing they can stay connected.",
    author: {
      name: "Emma Roberts",
      role: "Family Liaison Officer",
      facility: "Oakwood Care",
    },
  },
];

export function TestimonialsSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-primary">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by care homes across the country
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:mx-0 sm:max-w-none sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author.name}
                className="flex max-w-xl flex-col justify-between"
              >
                <blockquote className="text-lg leading-8 text-muted-foreground">
                  <p>{testimonial.body}</p>
                </blockquote>
                <div className="mt-8 flex items-center gap-x-4">
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-foreground">
                      {testimonial.author.name}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {testimonial.author.role}
                    </p>
                    <p className="text-muted-foreground">
                      {testimonial.author.facility}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
