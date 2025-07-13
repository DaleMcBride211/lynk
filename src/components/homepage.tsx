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
          **Get organized, stay focused, and achieve more** with intelligent task management.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* These buttons would link to your actual login/signup routes */}
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
      </div>

      ---

      {/* Features Section */}
      <section className="w-full max-w-6xl my-16">
        <h2 className="text-5xl font-bold text-center text-indigo-700 mb-12 animate-fade-in-up">
          Unlock Your Potential with Lynk Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-left transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">📋 Intuitive Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Easily create, organize, and prioritize your daily tasks. Lynk's clean and simple interface
                ensures you spend less time managing and more time doing. Drag-and-drop, due dates, and reminders keep you on track.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-up transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">🎯 Goal Setting & Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Turn your ambitions into actionable plans. Break down big goals into manageable steps,
                set milestones, and visualize your progress. Celebrate every achievement, big or small.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-right transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">☁️ Seamless Multi-Device Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Your tasks and goals are always with you. Access Lynk from your desktop, tablet, or phone.
                Stay productive whether you're at your desk, on the go, or offline.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 4 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-left transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">🔔 Smart Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Never miss a deadline or an important task again. Lynk sends timely, customizable
                reminders, ensuring you're always aware of what needs your attention next.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 5 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-down transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">📊 Progress Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Gain valuable insights into your productivity. Lynk provides easy-to-understand
                overviews of your completed tasks and goal progress, helping you identify patterns and improve.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 6 */}
          <Card className="shadow-xl rounded-xl animate-fade-in-right transform hover:-translate-y-2 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-600">🔒 Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Your data security and privacy are our top priorities. Lynk employs robust
                encryption and security measures to keep your information safe and confidential.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-12">
          <Button variant="link" className="text-indigo-600 hover:text-indigo-700 text-lg md:text-xl">
            See All Features & Detailed Breakdown &rarr;
          </Button>
        </div>
      </section>

      ---

      {/* About Us / Company Story Section */}
      <section className="w-full max-w-4xl my-16 text-center animate-fade-in-up">
        <h2 className="text-5xl font-bold text-indigo-700 mb-8">
          Our Story: The Vision Behind Lynk
        </h2>
        <Card className="shadow-2xl rounded-xl p-8 bg-white">
          <CardContent className="text-lg text-gray-700 space-y-6">
            <p>
              At **Lynk**, we believe that true productivity comes from clarity and simplicity.
              Our journey began in <span className="font-semibold text-purple-600">late 2024</span>,
              when a small team of passionate developers and productivity enthusiasts recognized a common challenge:
              existing tools were either too complex, too simple, or lacked the seamless integration needed
              for modern life.
            </p>
            <p>
              We set out to build something different – an application that feels like a natural extension
              of your mind, helping you **capture ideas, manage commitments, and track progress** effortlessly.
              Lynk was born from the desire to create a smart, intuitive, and beautiful platform
              that empowers individuals and teams to **achieve their biggest goals without getting overwhelmed.**
            </p>
            <p>
              Our mission is to **simplify your digital life** and help you focus on what truly matters.
              We're constantly innovating, listening to our users, and refining Lynk to ensure it remains
              your go-to tool for a more organized and productive future.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center mt-6">
            <Button variant="link" className="text-indigo-600 hover:text-indigo-700 text-lg md:text-xl">
              Meet the Team & Our Values &rarr;
            </Button>
          </CardFooter>
        </Card>
      </section>

      ---

      {/* Call to Action Section (Repeated for emphasis) */}
      <section className="w-full max-w-4xl my-16 text-center animate-fade-in-up">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-2xl rounded-xl p-8 md:p-12">
          <CardTitle className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Productivity?
          </CardTitle>
          <CardDescription className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of users who are simplifying their lives and achieving their goals with Lynk.
          </CardDescription>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              Start Your Free Trial
            </Button>
            <Button variant="outline" className="bg-white text-purple-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              Contact Sales
            </Button>
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