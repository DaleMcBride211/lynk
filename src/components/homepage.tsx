import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center p-4 pt-12 md:pt-20">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in-down max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-800 tracking-tight leading-tight mb-6">
          Welcome to <span className="text-purple-600">Lynk</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
          Your ultimate companion for managing tasks, goals, and everything in between.
          <b>Get organized, stay focused, and achieve more</b> with intelligent task management.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          
        </div>
      </div>
      

      ---

      {/* Call to Action Section (Repeated for emphasis) */}
      <section className="w-full max-w-4xl my-16 text-center animate-fade-in-up">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-2xl rounded-xl p-8 md:p-12">
          <CardTitle className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Productivity?
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signin">
              <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300">
                  Sign Up for Free
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 cursor-pointer hover:text-indigo-700 text-lg px-8 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                  Log In
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Lynk. All rights reserved. Crafted with passion.
      </footer>
    </div>
  );
}

export default Homepage;