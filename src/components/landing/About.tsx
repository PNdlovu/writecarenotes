import { SectionTitle } from '@/components/ui/SectionTitle'
import { FaHospital, FaUserNurse, FaUsers } from 'react-icons/fa'

const stats = [
  {
    icon: FaHospital,
    number: "200+",
    title: "Care Homes",
    description: "Using our platform daily"
  },
  {
    icon: FaUserNurse,
    number: "5,000+",
    title: "Care Staff",
    description: "Empowered by our tools"
  },
  {
    icon: FaUsers,
    number: "15,000+",
    title: "Residents",
    description: "Receiving better care"
  }
]

export function About() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600">
          We are dedicated to revolutionizing care home management through innovative technology solutions. Our mission is to enhance the quality of care while simplifying administrative tasks for care home staff.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
        <p className="text-gray-600">
          Our comprehensive care home management system provides:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>Efficient resident management and care planning</li>
          <li>Streamlined staff scheduling and communication</li>
          <li>Automated medication management and tracking</li>
          <li>Real-time incident reporting and documentation</li>
          <li>Compliance monitoring and reporting tools</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Quality Care</h3>
            <p className="text-gray-600">
              We believe in enabling care homes to provide the highest standard of care through efficient management tools.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Innovation</h3>
            <p className="text-gray-600">
              We continuously improve our platform to meet the evolving needs of care homes and their residents.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Reliability</h3>
            <p className="text-gray-600">
              Our system is built to be dependable and secure, ensuring care homes can focus on what matters most.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Support</h3>
            <p className="text-gray-600">
              We provide comprehensive support to ensure our clients can maximize the benefits of our platform.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-600">
          Have questions about our care home management system? We'd love to hear from you. Contact our team for more information or to schedule a demo.
        </p>
      </section>
    </div>
  );
}
