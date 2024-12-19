"use client";

import { FaEnvelope, FaPhone } from 'react-icons/fa';

export function Contact() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Need Custom Solutions?</h2>
          <p className="text-body-color">Contact our sales team for personalized pricing and features</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <FaPhone className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-dark">Call Us</h3>
              <p className="text-body-color">020 3442 1373</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <FaEnvelope className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-dark">Email Us</h3>
              <p className="text-body-color">sales@writecarenotes.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


