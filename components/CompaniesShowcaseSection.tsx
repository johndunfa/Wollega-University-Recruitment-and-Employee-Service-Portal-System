import { FC } from 'react';

const companyLogos = [
  'a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg', 'f.jpg', 'g.jpg', 'h.jpg',
];

const CompaniesShowcaseSection: FC = () => (
  <section className="w-full py-16 bg-white overflow-hidden">
    <div className="max-w-5xl mx-auto px-8 lg:px-16">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8 text-center">Companies We've Worked With</h2>
      <div className="overflow-hidden w-full relative">
        <div className="flex animate-marquee whitespace-nowrap items-center gap-12">
          {companyLogos.concat(companyLogos).map((src, idx) => (
            <img
              key={idx}
              src={`/${src}`}
              alt="Company logo"
              className="h-16 w-auto mx-4 rounded shadow bg-gray-100 object-contain"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CompaniesShowcaseSection; 